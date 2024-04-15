const { createCollection } = require("../model/categoryModel")
const cartCollection = require('../model/cartModel')
const productCollection = require('../model/productModel')
const addToCart = async (req, res) => {
    try {
        const productDet = await productCollection.findOne({ _id: req.query.pid });
        const existingCartItem = await cartCollection.findOne({ userId: req.session.logged._id, productId: req.query.pid });
        console.log('session' + req.session.logged._id)
        if (existingCartItem) {
            const updatedQuantity = parseInt(existingCartItem.productQuantity) + parseInt(req.query.qty);
            const updatedTotalCost = updatedQuantity * productDet.productPrice;

            await cartCollection.updateOne({ _id: existingCartItem._id }, {
                $set: {
                    productQuantity: updatedQuantity,
                    totalCostPerProduct: updatedTotalCost
                }
            });
        } else {
            await cartCollection.create({
                userId: req.session.logged._id,
                productId: req.query.pid,
                productQuantity: req.query.qty,
                totalCostPerProduct: req.query.qty * productDet.productPrice
            });
        }
        req.session.cartDetails = await cartCollection.find({ userId: req.session.logged._id });
        res.send({ success: true });
    } catch (err) {
        console.log(err);
        res.status(500).send({ success: false, error: err.message });
    }
};


const cart = async (req, res) => {
    try {
        const productIds = req.session.cartDetails.map(cartItem => cartItem.productId);
        const productDetails = await productCollection.find({ _id: { $in: productIds } });
        res.render('userPages/addToCart', { userLogged: req.session.logged, productDet: req.session.cartDetails, productDetails })
    } catch (err) {
        console.log(err);
    }
}

const qtyInc = async (req, res) => {
    try {
        let cartProduct = await cartCollection.findOne({ productId: req.query.id })
        let productDet = await productCollection.findOne({ _id: req.query.id })
        await cartCollection.updateOne(
            { productId: req.query.id }, 
            { 
                $inc: { productQuantity: 1,totalCostPerProduct: productDet.productPrice},
            }
          )
          req.session.updatedPrice=await cartCollection.findOne({productId:req.query.id})
          console.log(req.session.updatedPrice.totalCostPerProduct)
          res.send({success:true,updatedPrice:req.session.updatedPrice})
              } catch (err) {
        console.log(err);
    }
}

const removeCart = async (req, res) => {
    try {
       console.log(req.query.pid);
       await cartCollection.deleteOne({productId:req.query.pid})
       res.send({success:true})
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    addToCart, cart, qtyInc,removeCart
}