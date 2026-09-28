/**
 * GroundFix Storage Service
 * Handles uploading hazard photos, before-repair photos, and after-repair photos.
 * 
 * Uses Supabase Storage bucket 'groundfix-images' when Supabase is configured.
 * When Supabase credentials are not set, falls back to local disk storage in 'backend/uploads'
 * served via Express static route.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const BUCKET_NAME = 'groundfix-images';
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// Ensure local uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

let supabase = null;
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project')) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('[Storage] Connected to Supabase Storage client.');
  } catch (err) {
    console.warn('[Storage] Failed to initialize Supabase client:', err.message);
  }
}

/**
 * Uploads a file buffer or path to storage
 * @param {Object} file - Multer file object
 * @param {string} prefix - Subdirectory/type prefix (e.g. 'reports', 'proofs')
 * @returns {Promise<string>} Public URL of the uploaded image
 */
async function uploadImage(file, prefix = 'reports') {
  if (!file) {
    throw new Error('No file provided for upload.');
  }

  const ext = path.extname(file.originalname || file.filename || '.jpg') || '.jpg';
  const fileName = `${prefix}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;

  // If Supabase is configured, upload to Supabase Storage bucket
  if (supabase) {
    try {
      const fileData = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
      if (!fileData) throw new Error('File buffer empty.');

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, fileData, {
          contentType: file.mimetype || 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.warn(`[Storage] Supabase upload failed, falling back to local storage: ${error.message}`);
      } else {
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
          .getPublicUrl(fileName);

        if (publicUrlData && publicUrlData.publicUrl) {
          return publicUrlData.publicUrl;
        }
      }
    } catch (err) {
      console.warn(`[Storage] Supabase exception: ${err.message}. Using local storage fallback.`);
    }
  }

  // Local fallback storage
  const localFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
  const localFilePath = path.join(UPLOADS_DIR, localFileName);

  if (file.buffer) {
    fs.writeFileSync(localFilePath, file.buffer);
  } else if (file.path && fs.existsSync(file.path)) {
    fs.copyFileSync(file.path, localFilePath);
  } else {
    throw new Error('No valid file buffer or path provided.');
  }

  // Return static route URL (relative or full)
  return `/uploads/${localFileName}`;
}

module.exports = {
  uploadImage,
  BUCKET_NAME
};
