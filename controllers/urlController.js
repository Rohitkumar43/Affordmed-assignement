const UrlService = require('../services/urlService');
const { validateUrl, validateShortcode, validateValidity } = require('../utils/validators');

class UrlController {
  static async createShortUrl(req, res) {
    try {
      const { url, validity, shortcode } = req.body;
      
      // Validate URL
      const urlValidation = validateUrl(url);
      if (!urlValidation.isValid) {
        return res.status(400).json({
          error: 'Invalid URL',
          message: urlValidation.error
        });
      }
      
      // Validate shortcode (if provided)
      const shortcodeValidation = validateShortcode(shortcode);
      if (!shortcodeValidation.isValid) {
        return res.status(400).json({
          error: 'Invalid shortcode',
          message: shortcodeValidation.error
        });
      }
      
      // Validate validity
      const validityValidation = validateValidity(validity);
      if (!validityValidation.isValid) {
        return res.status(400).json({
          error: 'Invalid validity',
          message: validityValidation.error
        });
      }
      
      // Create short URL
      const result = await UrlService.createShortUrl(
        url,
        validityValidation.validityMinutes,
        shortcode
      );
      
      res.status(201).json({
        shortLink: result.shortLink,
        expiry: result.expiry
      });
      
    } catch (error) {
      console.error('Create Short URL Error:', error);
      
      if (error.message.includes('shortcode already exists')) {
        return res.status(409).json({
          error: 'Shortcode collision',
          message: error.message
        });
      }
      
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to create short URL'
      });
    }
  }
  
  static async redirectToOriginalUrl(req, res) {
    try {
      const { shortcode } = req.params;
      
      if (!shortcode) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Shortcode is required'
        });
      }
      
      // Get URL document
      const urlDoc = await UrlService.getUrlByShortcode(shortcode);
      
      if (!urlDoc) {
        return res.status(404).json({
          error: 'Short URL not found',
          message: 'The requested shortcode does not exist or has expired'
        });
      }
      
      // Record click analytics
      const clickData = {
        referrer: req.get('Referer'),
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress
      };
      
      await UrlService.recordClick(urlDoc, clickData);
      
      // Redirect to original URL
      res.redirect(302, urlDoc.originalUrl);
      
    } catch (error) {
      console.error('Redirect Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to process redirect'
      });
    }
  }
  
  static async getUrlStatistics(req, res) {
    try {
      const { shortcode } = req.params;
      
      if (!shortcode) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Shortcode is required'
        });
      }
      
      // Get statistics
      const stats = await UrlService.getUrlStatistics(shortcode);
      
      if (!stats) {
        return res.status(404).json({
          error: 'Short URL not found',
          message: 'No statistics available for this shortcode'
        });
      }
      
      res.status(200).json(stats);
      
    } catch (error) {
      console.error('Get Statistics Error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to retrieve statistics'
      });
    }
  }
}

module.exports = UrlController;