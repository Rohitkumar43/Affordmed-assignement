const validator = require('validator');

const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL is required and must be a string' };
  }
  
  if (!validator.isURL(url, { 
    protocols: ['http', 'https'], 
    require_protocol: true 
  })) {
    return { isValid: false, error: 'Invalid URL format. Must include http:// or https://' };
  }
  
  return { isValid: true };
};

const validateShortcode = (shortcode) => {
  if (!shortcode) {
    return { isValid: true }; // Optional field
  }
  
  if (typeof shortcode !== 'string') {
    return { isValid: false, error: 'Shortcode must be a string' };
  }
  
  // Alphanumeric, reasonable length (3-20 characters)
  const shortcodeRegex = /^[a-zA-Z0-9]{3,20}$/;
  if (!shortcodeRegex.test(shortcode)) {
    return { 
      isValid: false, 
      error: 'Shortcode must be alphanumeric and between 3-20 characters' 
    };
  }
  
  return { isValid: true };
};

const validateValidity = (validity) => {
  if (validity === undefined || validity === null) {
    return { isValid: true, validityMinutes: 30 }; // Default 30 minutes
  }
  
  const validityNum = parseInt(validity);
  if (isNaN(validityNum) || validityNum <= 0) {
    return { 
      isValid: false, 
      error: 'Validity must be a positive integer representing minutes' 
    };
  }
  
  // Reasonable limits: 1 minute to 1 year
  if (validityNum < 1 || validityNum > 525600) {
    return { 
      isValid: false, 
      error: 'Validity must be between 1 minute and 525600 minutes (1 year)' 
    };
  }
  
  return { isValid: true, validityMinutes: validityNum };
};

module.exports = {
  validateUrl,
  validateShortcode,
  validateValidity
};
