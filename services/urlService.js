const Url = require('../model/urlModel');
const { generateUniqueShortcode } = require('../utils/shortcodeGenerator');

class UrlService {
  static async createShortUrl(originalUrl, validityMinutes = 30, customShortcode = null) {
    try {
      // Generate or validate shortcode
      const shortcode = await generateUniqueShortcode(Url, customShortcode);
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + validityMinutes);
      
      // Create short link
      const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
      const shortLink = `${baseUrl}/${shortcode}`;
      
      // Create URL document
      const urlDoc = new Url({
        originalUrl,
        shortcode,
        shortLink,
        expiresAt
      });
      
      await urlDoc.save();
      
      return {
        shortLink,
        expiry: expiresAt.toISOString()
      };
    } catch (error) {
      throw error;
    }
  }
  
  static async getUrlByShortcode(shortcode) {
    try {
      const urlDoc = await Url.findActiveByShortcode(shortcode);
      
      if (!urlDoc) {
        return null;
      }
      
      return urlDoc;
    } catch (error) {
      throw error;
    }
  }
  
  static async recordClick(urlDoc, clickData) {
    try {
      const click = {
        timestamp: new Date(),
        referrer: clickData.referrer || 'Direct',
        userAgent: clickData.userAgent,
        ip: clickData.ip,
        location: clickData.location || {}
      };
      
      urlDoc.clicks.push(click);
      urlDoc.totalClicks += 1;
      
      await urlDoc.save();
      
      return urlDoc;
    } catch (error) {
      throw error;
    }
  }
  
  static async getUrlStatistics(shortcode) {
    try {
      const urlDoc = await Url.findOne({ shortcode });
      
      if (!urlDoc) {
        return null;
      }
      
      // Prepare statistics
      const stats = {
        shortcode,
        originalUrl: urlDoc.originalUrl,
        shortLink: urlDoc.shortLink,
        createdAt: urlDoc.createdAt.toISOString(),
        expiresAt: urlDoc.expiresAt.toISOString(),
        isActive: urlDoc.isActive && !urlDoc.isExpired(),
        totalClicks: urlDoc.totalClicks,
        clicks: urlDoc.clicks.map(click => ({
          timestamp: click.timestamp.toISOString(),
          referrer: click.referrer,
          location: click.location,
          userAgent: click.userAgent
        }))
      };
      
      return stats;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = UrlService;