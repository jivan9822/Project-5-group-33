const mongoose = require('mongoose');
const npmValidate = require('validator');

const productSchema = mongoose.Schema(
  {
    //   title: {string, mandatory, unique},
    title: {
      type: String,
      required: [true, 'Please provide a title of product!'],
      unique: true,
    },
    //   description: {string, mandatory},
    description: {
      type: String,
      required: [true, 'Please provide description of product!'],
    },
    //   price: {number, mandatory, valid number/decimal},
    price: {
      type: Number,
      required: [true, 'Please provide price of product!'],
      validate: {
        validator: (el) => el >= 0,
        message: 'Price should be greater than zero!',
      },
    },
    brand: String,
    //   currencyId: {string, mandatory, INR},
    currencyId: {
      type: String,
      required: [true, 'Please provide currency id!'],
      default: 'INR',
      enum: {
        values: ['INR', 'USD'],
        message: 'Only INR and USD is supported!',
      },
    },
    //   currencyFormat: {string, mandatory, Rupee symbol}, ₹ $
    currencyFormat: {
      type: String,
      required: [true, 'Please provide currencyFormat!'],
      default: '₹',
      enum: {
        values: ['₹', '$'],
        message: 'Only ₹ and $ is supported!',
      },
    },
    //   isFreeShipping: {boolean, default: false},
    isFreeShipping: {
      type: Boolean,
      default: false,
    },
    //   productImage: {string, mandatory},  // s3 link
    productImage: {
      type: String,
      required: [true, 'Please provide image of product!'],
    },
    //   style: {string},
    style: String,
    //   availableSizes: ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'],
    availableSizes: {
      type: [
        {
          type: String,
          enum: {
            values: ['S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'],
            message: `Please provide from 'S', 'XS', 'M', 'X', 'L', 'XXL', 'XL'`,
          },
        },
      ],
      required: [true, 'Please provide availableSizes of product!'],
    },
    //   installments: {number},//     style
    installments: Number,
    //   deletedAt: {Date, when the document is deleted},
    deletedAt: {
      type: Date,
      default: null,
    },
    //   isDeleted: {boolean, default: false},
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.installments) {
    this.installments = this.installments.toFixed(0);
  }
  this.price = ((this.price * 100) / 100).toFixed(2);
  next();
});

productSchema.pre(/^find/, async function (next) {
  this.find({ isDeleted: false });
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
