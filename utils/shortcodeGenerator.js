const { nanoid } = require('nanoid');

const generateShortcode = (length = 6) => {
  return nanoid(length);
};

const generateUniqueShortcode = async (UrlModel, customShortcode = null) => {
  if (customShortcode) {
    const existing = await UrlModel.findOne({ shortcode: customShortcode });
    if (existing) {
      throw new Error('Custom shortcode already exists. Please choose a different one.');
    }
    return customShortcode;
  }
  
  let shortcode;
  let attempts = 0;
  const maxAttempts = 10;
  
  do {
    shortcode = generateShortcode();
    const existing = await UrlModel.findOne({ shortcode });
    
    if (!existing) {
      return shortcode;
    }
    
    attempts++;
  } while (attempts < maxAttempts);
  
  shortcode = generateShortcode(8);
  const existing = await UrlModel.findOne({ shortcode });
  
  if (existing) {
    throw new Error('Unable to generate unique shortcode. Please try again.');
  }
  
  return shortcode;
};

module.exports = {
  generateShortcode,
  generateUniqueShortcode
};