/**
 * GroundFix Image Verification Controller (Rule 11)
 * Evaluates authenticity of uploaded photos
 */

const { verifyImage } = require('../services/imageVerificationService');

async function checkImage(req, res, next) {
  try {
    const file = req.file;

    if (!file && !req.body.image_url) {
      return res.status(400).json({
        success: false,
        error: 'Please provide an image file or image_url to verify.'
      });
    }

    const result = await verifyImage(file || req.body.image_url);

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  checkImage
};
