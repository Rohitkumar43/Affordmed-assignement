const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  referrer: {
    type: String,
    default: 'Direct'
  },
  location: {
    country: String,
    city: String,
    region: String
  },
  userAgent: String,
  ip: String
});

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
    trim: true
  },
  shortcode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  shortLink: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  clicks: [clickSchema],
  totalClicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});


module.exports = mongoose.model('Url', urlSchema);
