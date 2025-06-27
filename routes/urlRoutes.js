const express = require('express');
const UrlController = require('../controllers/urlController');

const router = express.Router();

// Create short URL endpoint
router.post('/shorturls', UrlController.createShortUrl);

// Get URL statistics endpoint
router.get('/shorturls/:shortcode', UrlController.getUrlStatistics);

// Redirect endpoint (must be last to avoid conflicts)
router.get('/:shortcode', UrlController.redirectToOriginalUrl);

module.exports = router;