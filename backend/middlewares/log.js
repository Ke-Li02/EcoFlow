const { logRequest } = require('../models/requestLogsModel');

function requestLoggerMiddleware(req, res, next) {
    res.on('finish', () => {
        logRequest(req.method, req.path, res.statusCode).catch(() => {});
    });
    next();
}

module.exports = requestLoggerMiddleware;