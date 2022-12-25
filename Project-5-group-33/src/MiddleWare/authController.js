const AppError = require('../Error/AppError');
const { CatchAsync } = require('../Error/CatchAsync');
const User = require('../User/UserModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

//! TOKEN GENERATION FUNCTION
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRETE_STRING, {
    expiresIn: process.env.JWT_EXPIRATION,
  });
};

//! USER LOGIN CONTROLLER
exports.userLogin = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // CHECK IF EMAIL AND PASSWORD IS NOT THERE
  if (!email || !password) {
    return next(
      new AppError(`Please provide email and password for login!`, 400)
    );
  }

  // CHECKING EMAIL AND PASS IN DATA BASE
  const user = await User.findOne({ email });
  // console.log(password, user.password);
  // console.log(await user.correctPass(password, user.password));
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // GENERATING TOKEN
  const token = generateToken(user._id);
  req.user = user;
  return res.status(200).json({
    status: true,
    message: 'User login successful',
    data: {
      userId: user._id,
      token,
    },
  });
});

//! USER AUTHORIZATION
exports.protect = CatchAsync(async (req, res, next) => {
  const { userId } = req.params;
  // CHECKING TOKEN IS THERE IN HEADERS OR NOT
  let token = req.headers.authorization;
  if (!token && !token.startsWith('Bearer ')) {
    return next(new AppError(`Token is not present!`, 401));
  }

  // EXTRACTING TOKEN
  token = token.split(' ')[1];

  // DECODE TOKEN
  const decode = jwt.verify(token, process.env.JWT_SECRETE_STRING);

  // GETTING USER FROM TOKEN ID
  const user = await User.findById({ _id: decode.id });

  // IF ID MISMATCH THEN RETURN ERROR
  if (decode.id !== userId) {
    return next(
      new AppError(`You are not authorized to access the details!`, 403)
    );
  }

  // ADDING USER TO REQ.BODY
  req.user = user;

  // AFTER DONE AUTHORIZATION PASSING TO NEXT FUNCTION
  next();
});
