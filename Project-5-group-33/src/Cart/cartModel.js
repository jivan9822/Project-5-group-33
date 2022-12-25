const mongoose = require('mongoose');

const cartSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide userId!'],
      unique: true,
    },
    items: {
      type: [
        {
          productId: {
            type: mongoose.Types.ObjectId,
            ref: 'Product',
            required: [true, 'Please provide productId!'],
          },
          quantity: {
            type: Number,
            required: [true, 'Please enter a Qty!'],
            min: 1,
          },
          price: {
            type: Number,
            require: [true, 'Please provide price of product!'],
            select: false,
          },
        },
      ],
    },
    totalPrice: {
      type: Number,
      default: 0,
      required: true,
      // comment: 'Holds total price of all the items in the cart',
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Please add Total qty!'],
      default: 1,
    },
    totalItems: {
      type: Number,
      default: 1,
      required: true,
      // comment: 'Holds total number of items in the cart',
    },
  },
  { timestamps: true }
);

cartSchema.index({ userId: 1 });

const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart;
