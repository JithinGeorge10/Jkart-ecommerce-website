const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, required: true, ref: 'users'},
  productId: { type: mongoose.Types.ObjectId, required: true, ref: 'products'}
});


module.exports=mongoose.model('wishlist',wishlistSchema)