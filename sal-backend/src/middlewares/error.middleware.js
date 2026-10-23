function errorHandler(error, req, res, next) {
    const status = error.code === "ER_DUP_ENTRY" ? 409 : (error.status || 500);
    if (status >= 500) {
        console.error(error);
    }
    return res.status(status).json({
        message:
            status >= 500
                ? "Internal server error"
                : status === 409 && error.code === "ER_DUP_ENTRY"
                    ? "A record with the same unique value already exists"
                    : error.message
    });
}
module.exports = errorHandler;