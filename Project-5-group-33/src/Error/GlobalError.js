const AppError = require('./AppError');

exports.globalErrorHand = (err, req, res, next) => {
  if (err.name === 'ValidationError') {
    err = validErrHandler(err);
  }
  if (err.name === 'TokenExpiredError') {
    err = jwtExpHandler(err);
  }
  if (err.name === 'JsonWebTokenError') {
    err = jwtTokenErrorHandler(err);
  }
  if (err.code === 11000) {
    err = duplicateError(err);
  }
  if (err.name === 'SyntaxError') {
    err = syntaxErrHandler(err);
  }
  if (err.kind === 'ObjectId') {
    err = mongooseObjErr(err);
  }
  res.status(err.statusCode || 500).json({
    status: false,
    msg: err.message,
    err,
  });
};

// MONGOOSE VALIDATION ERROR
const validErrHandler = (error) => new AppError(`${error.message}`, 400);

// DUPLICATE ENTRY ERROR
const duplicateError = (error) => {
  const msg = Object.keys(error.keyValue);
  return new AppError(
    `The ${msg}: ${error.keyValue[msg]} is already in use!`,
    409
  );
};

// JWT EXPIRATION HANDLER
const jwtExpHandler = (error) =>
  new AppError('Your token has expired! Please log in again.', 401);

// JWT INVALID TOKEN
const jwtTokenErrorHandler = (error) =>
  new AppError('Invalid token. Please log in again!', 401);

const syntaxErrHandler = (error) =>
  new AppError(`Invalid input! ${error.name}`, 400);

const mongooseObjErr = (error) =>
  new AppError(`Invalid ObjectId: ${error.value}`, 400);
