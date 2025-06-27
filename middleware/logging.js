const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const requestId = Math.random().toString(36).substr(2, 9);
  
  // Add request ID to request object for tracking
  req.requestId = requestId;
  
  // Log request
  const requestLog = {
    requestId,
    timestamp,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent') || 'Unknown',
    body: req.method === 'POST' ? req.body : undefined
  };
  
  console.log(`📝 [${timestamp}] [${requestId}] ${req.method} ${req.originalUrl} - IP: ${requestLog.ip}`);
  
  // Override res.json to log responses
  const originalJson = res.json;
  res.json = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const responseLog = {
      requestId,
      timestamp: new Date().toISOString(),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      responseSize: JSON.stringify(data).length
    };
    
    console.log(`📤 [${responseLog.timestamp}] [${requestId}] Response: ${res.statusCode} - Duration: ${duration}ms`);
    
    // Write detailed logs to file
    const logEntry = {
      request: requestLog,
      response: responseLog,
      success: res.statusCode < 400
    };
    
    const logFileName = `${new Date().toISOString().split('T')[0]}.log`;
    const logFilePath = path.join(logsDir, logFileName);
    
    fs.appendFile(logFilePath, JSON.stringify(logEntry) + '\n', (err) => {
      if (err) console.error('Failed to write log:', err);
    });
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = loggingMiddleware;