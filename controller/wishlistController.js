const { createCollection } = require('../model/productModel');
const wishlistCollection = require('../model/wishlistModel')
const productCollection = require('../model/productModel')
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
            userId: req.session.logged._id,
            productId: req.query.id
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

        await wishlistCollection.deleteOne({ productId: wishList });
        res.send({ success: true })

    } catch (err) {
        console.log(err);
    }
}
const AddToCart = async (req, res) => {
    try {
       
        const productDet = await productCollection.findOne({ _id: req.query.id })
       
        const cartDet = await cartCollection.findOne({ productId: req.query.id, userId: req.session.logged._id })
        
        if (cartDet) {
            await cartCollection.updateOne(
                { productId: req.query.id },
                {
                    $inc: { productQuantity: 1 },
                    $set: { totalCostPerProduct: productDet.productPrice * (cartDet.productQuantity + 1) }
                }
            );

        } else {
            let cartDetails = new cartCollection({
                userId: req.session.logged._id,
                productId: req.query.id,
                productQuantity: 1, 
                totalCostPerProduct:productDet.productPrice
            })
            await cartDetails.save()
        }
        await wishlistCollection.deleteOne({productId:req.query.id})
        res.send({ success: true })
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    wishlist, addToWishlist, removeWishlist, AddToCart
}