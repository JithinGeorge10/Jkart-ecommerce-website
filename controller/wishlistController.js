const { createCollection } = require('../model/productModel');
const wishlistCollection = require('../model/wishlistModel')
const cartCollection = require('../model/cartModel')
const wishlist = async (req, res) => {
    try {
        const wishlistDet = await wishlistCollection.find().populate('productId').sort({ _id: -1 })
        res.render('userPages/wishlist', { userLogged: req.session.logged, wishlistDet })
    } catch (err) {
        console.log(err);
    }
}

const addToWishlist = async (req, res) => {
    try {
            const wishlist = new wishlistCollection({
              userId:req.session.logged._id,
              productId:req.query.id
            })
            await wishlist.save()
            res.send({ success: true })
        
    } catch (err) {
        console.log(err);
    }
}

const removeWishlist = async (req, res) => {
    try {
        const wishList = req.query.id;
        console.log('wishList' + req.query.id)
        await wishlistCollection.deleteOne({ productId: wishList });
        res.send({ success: true })

    } catch (err) {
        console.log(err);
    }
}
const AddToCart = async (req, res) => {
    try {
            console.log('wishlistproductadd'+req.query.id);
            const cartDet=await cartCollection.find({productId:req.query.id,userId:req.session.logged._id})
            if(cartDet){
                await cartCollection.updateOne({productId:req.query.id},{$set:{
                    
                }})
            }
            
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    wishlist, addToWishlist, removeWishlist,AddToCart
}