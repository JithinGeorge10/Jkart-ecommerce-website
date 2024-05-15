const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'users' },
  productId: { type: mongoose.Types.ObjectId, required: true, ref: 'products' },
  productName:{type:String,required: true},
  categoryName:{type:String,required: true},
  productQuantity: { type: Number, required: true, default: 1, min: 1 },
  totalCostPerProduct: { type: Number },
  status: { type: String, default: 'Pending' }
});


module.exports = mongoose.model('carts', cartSchema)