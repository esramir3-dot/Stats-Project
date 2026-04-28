class HttpError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

function badRequest(message, details) {
  return new HttpError(400, message, details);
}

function notFound(message) {
  return new HttpError(404, message);
}

module.exports = {
  HttpError,
  badRequest,
  notFound
};
