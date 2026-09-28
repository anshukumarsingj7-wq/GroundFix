/**
 * GroundFix Backend Server
 * Tagline: Report. Fix. Safer Roads.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const complaintsRoutes = require('./routes/complaintsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const roadsRoutes = require('./routes/roadsRoutes');
const hazardsRoutes = require('./routes/hazardsRoutes');
const imageVerificationRoutes = require('./routes/imageVerificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Body parser
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static files for local image uploads fallback
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath));

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'GroundFix',
    tagline: 'Report. Fix. Safer Roads.',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/complaints', complaintsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roads', roadsRoutes);
app.use('/api/hazards', hazardsRoutes);
app.use('/api/image-verification', imageVerificationRoutes);
app.use('/api/ai', aiRoutes);

// Error and Not Found Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` GroundFix API Server running on port ${PORT}`);
    console.log(` Health check: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });
}

module.exports = app;
