const { CatchAsync } = require('../Error/CatchAsync');
const Cart = require('./cartModel');
const Product = require('../Product/ProductModel');
const AppError = require('../Error/AppError');
const { emptyCart, updateCart, addToCart } = require('../Utils/SmallUtils');

//! CREATE CART
exports.createCart = CatchAsync(async (req, res, next) => {
  const { userId, productId } = req.body;
  if (userId !== req.params.userId) {
    return next(new AppError(`UserId in params and body mismatch!`, 400));
  }
  if (!userId || !productId) {
    return next(new AppError(`UserId or and ProductId is missing!`, 400));
  }

  // FOR GETTING PRICE OF PRODUCT FETCHING PRODUCT FROM DB
  const product = await Product.findById(productId);
  if (!product) {
    return next(new AppError(`Product not found!`, 404));
  }

  // FETCHING USER CART IF ALREADY CREATED
  const userCart = await Cart.findOne({ userId });

  // PRICE DESTRUCTION FROM PRODUCT
  const price = product.price;
  // SETTING IN BODY (FOR NEW CART CREATION)
  req.body.totalPrice = price;
  // SETTING ITEMS IN BODY (FOR NEW CART CREATION)
  req.body.items = { productId, quantity: 1, price: price };

  // IF NO USER CART THEN WE HAVE TO CREATE NEW CART
  if (!userCart) {
    const newCart = await Cart.create(req.body);
    return res.status(201).json({
      status: true,
      message: 'Success',
      data: {
        newCart,
      },
    });
  }

  // IF USER HAVE ALREADY A CART
  // GETTING INDEX OF THE PRODUCT IN CART ITEMS ARRAY
  const ind = userCart.items.findIndex((p) => p.productId == productId);

  // THE ADDING THE DETAILS TO CART IF PRODUCT FOUND WILL INCREMENT ELSE ADD NEW PRODUCT TO ARRAY
  const newCart = await addToCart(userCart, ind, req.body.items, price).save();
  res.status(201).json({
    status: true,
    message: 'Success',
    data: {
      newCart,
    },
  });
});

//! UPDATE CART

exports.updateCartById = CatchAsync(async (req, res, next) => {
  const { cartId, removeProduct, productId } = req.body;

  // FETCHING CART USING USER_ID
  const cart = await Cart.findOne({ userId: req.user._id }).select(
    '+items.price'
  );

  // IF CART NOT FOUND
  if (!cart) {
    return next(new AppError(`The cart with this id dose not exist!`, 404));
  }

  // FETCHED CART_ID AND BODY CART_ID NOT EQUAL
  if (cart._id != cartId) {
    return next(new AppError(`CartId in body is not correct!`, 400));
  }

  // FINDING INDEX OF ITEM IN CART.ITEMS ARRAY
  const ind = cart.items.findIndex((p) => p.productId == productId);

  // IF ITEM NOT FOUND
  if (ind === -1) {
    return next(
      new AppError(
        `This Product is not in your cart!, Please provide valid productId`,
        400
      )
    );
  }

  // UPDATING DETAILS TO CART
  const cartNew = await updateCart(removeProduct, cart, ind).save();

  res.status(200).json({
    status: true,
    message: 'Success',
    data: {
      cartNew,
    },
  });
});

//! GET CART DETAILS BY ID
exports.getCartById = CatchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({ userId: req.params.userId }).populate(
    'items.productId'
  );
  if (req.params.userId !== req.body.userId) {
    return next(new AppError(`UserId mismatch in params and body!`, 400));
  }
  if (!cart) {
    return next(new AppError(`Cart dose not found for this user!`, 404));
  }
  res.status(200).json({
    status: true,
    message: 'Success',
    data: {
      cart,
    },
  });
});

//! DELETING CART BY ID (MAKING ALL CART FIELD TO ZERO)
exports.deleteCartById = CatchAsync(async (req, res, next) => {
  const query = await Cart.findOne(req.params);
  const cart = await emptyCart(query);
  if (!cart) {
    return next(new AppError(`No cart present with this id!`, 404));
  }
  res.status(204).json({
    data: null,
  });
});
