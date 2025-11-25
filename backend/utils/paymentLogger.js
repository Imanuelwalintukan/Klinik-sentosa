// paymentLogger.js - Logger untuk pembayaran
const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logFile = path.join(logDir, 'payment.log');

const logPayment = (level, message, data = null) => {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data })
  };
  
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
};

module.exports = {
  info: (message, data) => logPayment('INFO', message, data),
  error: (message, data) => logPayment('ERROR', message, data),
  warn: (message, data) => logPayment('WARN', message, data)
};