const Cart = require('../Cart/cartModel');
const AppError = require('../Error/AppError');
const { CatchAsync } = require('../Error/CatchAsync');
const { emptyCart } = require('../Utils/SmallUtils');
const Order = require('./OrderModel');

//! CREATE ORDER

exports.createOrder = CatchAsync(async (req, res, next) => {
  const { cartId } = req.body;
  if (!cartId) {
    return next(new AppError(`Please send your cart id!`, 400));
  }
  // GETTING CART DETAILS USING CART ID
  const cart = await Cart.findById(cartId);
  if (!cart || !cart.totalItems) {
    return next(
      new AppError(`${!cart ? 'cart not found!' : ' Your cart is empty!'}`, 400)
    );
  }

  // CREATING AN OBJECT TO CREATE A NEW ORDER
  const Obj = JSON.parse(JSON.stringify(cart));

  // REMOVING EXTRA FIELD FROM CART OBJ
  [('_id', 'createdAt', 'updatedAt', '__v')].map((el) => delete Obj[el]);

  // AFTER REMOVING CREATING NEW ORDER
  const order = await Order.create(Obj);

  // AFTER SUCCESSFULLY ORDER CREATION MAKING CART EMPTY
  await emptyCart(cart);

  res.status(201).json({
    status: true,
    message: 'Success',
    data: {
      order,
    },
  });
});

//! UPDATE ORDER STATUS
exports.updateOrder = CatchAsync(async (req, res, next) => {
  // FETCHING ORDER DETAILS FOR CANCELATION
  const order = await Order.findById(req.body.orderId);

  // IF NO ORDER WITH THIS ID
  if (!order) {
    return next(
      new AppError(`No order found with id: ${req.body.orderId}.`, 404)
    );
  }

  // IF USER_ID IN ORDER AND PARAMS MISMATCH
  if (order.userId != req.params.userId) {
    return next(
      new AppError(
        `This order is not belong to userId: ${req.params.userId}`,
        400
      )
    );
  }

  // IF ORDER ALREADY CANCELED
  if (!order.cancellable) {
    return next(new AppError(`This order will not be cancel!`, 400));
  }

  // IF ORDER STATUS IS CANCELED
  if (order.status === 'canceled') {
    return next(new AppError(`This order already canceled!`, 400));
  }

  // FINALLY WE WILL CANCEL THIS ORDER
  order.status = 'canceled';
  await order.save();
  res.status(200).json({
    status: true,
    message: 'Success',
    data: {
      order,
    },
  });
});
