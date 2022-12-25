const AppError = require('../Error/AppError');

// CATCH ASYNC HANDLER
exports.CatchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

exports.isJsonString = (data) => {
  return (req, res, next) => {
    try {
      req.body = JSON.parse(req.body[data]);
    } catch (error) {
      return next(
        new AppError(`Invalid ${data}! Please provide a valid json data`, 400)
      );
    }
    next();
  };
};
