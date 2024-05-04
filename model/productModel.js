const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  parentCategory: { type: mongoose.Types.ObjectId, required: true, ref: 'category' },
  productImage: [ {type: String} ],
  productPrice: { type: Number, required: true },
  productStock: { type: Number, required: true },
  productOfferId: { type: mongoose.Types.ObjectId, default: null },
  offerPrice : { type: Number, default: null },
  isListed: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  wishlist:{ type: Boolean, default: false }
});

module.exports =  mongoose.model("products", productSchema)