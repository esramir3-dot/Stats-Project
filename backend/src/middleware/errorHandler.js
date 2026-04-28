function errorHandler(error, _req, res, _next) {
  const statusCode = error.statusCode || 500;
  const message =
    statusCode === 500 ? "Unexpected server error" : error.message;

  if (statusCode === 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    error: {
      message,
      details: error.details
    }
  });
}

module.exports = errorHandler;
