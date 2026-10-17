function errorHandler(error, req, res, next) {
    const status = error.status || 500;
    return res.status(status).json({
        message: error.message || 'Internal server error'
    });
}
module.exports = errorHandler;