const { createCollection } = require("../model/categoryModel")
const cartCollection = require('../model/cartModel')
const productCollection = require('../model/productModel')
const addressCollection = require('../model/addressModel')
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
        const cartDetails = await cartCollection.find({ userId: req.session.logged._id }).populate('productId')
        console.log(cartDetails)
        const cartTotal = await cartCollection.aggregate([{ $group: { _id: null, sum: { $sum: '$totalCostPerProduct' } } }])
        req.session.grandTotal = cartTotal[0].sum
        res.render('userPages/Cart', { userLogged: req.session.logged, cartDetails, grandTotal: req.session.grandTotal })
    } catch (err) {
        console.log(err);
    }
}

const qtyInc = async (req, res) => {
    try {

        let productDet = await productCollection.findOne({ _id: req.query.id })
        await cartCollection.updateOne(
            { productId: req.query.id },
            {
                $inc: { productQuantity: 1, totalCostPerProduct: productDet.productPrice },
            }
        )
        req.session.updatedPrice = await cartCollection.findOne({ productId: req.query.id })
        req.session.grandTotal = req.session.grandTotal + productDet.productPrice
        res.send({ success: true, updatedPrice: req.session.updatedPrice, grandTotal: req.session.grandTotal })
    } catch (err) {
        console.log(err);
    }
}
const qtyDec = async (req, res) => {
    try {

        let productDet = await productCollection.findOne({ _id: req.query.id })
        await cartCollection.updateOne(
            { productId: req.query.id },
            {
                $inc: { productQuantity: -1, totalCostPerProduct: -productDet.productPrice },
            }
        )
        req.session.updatedPrice = await cartCollection.findOne({ productId: req.query.id })
        req.session.grandTotal = req.session.grandTotal - productDet.productPrice
        console.log(req.session.updatedPrice.totalCostPerProduct)
        res.send({ success: true, updatedPrice: req.session.updatedPrice, grandTotal: req.session.grandTotal })
    } catch (err) {
        console.log(err);
    }
}

const removeCart = async (req, res) => {
    try {
        console.log(req.query.pid);
        await cartCollection.deleteOne({ productId: req.query.pid })
        res.send({ success: true })
    } catch (err) {
        console.log(err);
    }
}


const cartCheckout = async (req, res) => {
    try {
        const addressDet = await addressCollection.find({ userId: req.session.logged._id })
        res.render('userPages/cartCheckout', { userLogged: req.session.logged, userAddress: addressDet })
    } catch (err) {
        console.log(err);
    }
}

const cartCheckoutAddress = async (req, res) => {
    try {
        req.session.selectedAddress = req.query.id
        // const addressDet=await addressCollection.find({userId:req.session.logged._id})
        res.send({ success: true })
    } catch (err) {
        console.log(err);
    }
}


const cartCheckoutPayment = async (req, res) => {
    try {
        const shippingAddress=await addressCollection.findOne({_id:req.session.selectedAddress })
        res.render('userpages/cartCheckoutPayment', { userLogged: req.session.logged,shippingAddress})
    } catch (err) {
        console.log(err);
    }
}

const cartCheckoutreview = async (req, res) => {
    try {
            console.log(req.query.id)
            if(req.query.id==='null'){
                res.send({ noPaymentMethod: true })
            }else{
                req.session.paymentMethod = req.query.id
                res.send({ success: true })
            }
            
    } catch (err) {
        console.log(err);
    }
}


const orderSummary = async (req, res) => {
    try {
        const shippingAddress=await addressCollection.findOne({_id:req.session.selectedAddress })
          const cartDetails=await cartCollection.find({userId:req.session.logged._id}).populate('productId')
          console.log(cartDetails)
          res.render('userPages/orderSummary',{userLogged:req.session.logged,cartDetails,shippingAddress,paymentMethod:req.session.paymentMethod,grandTotal: req.session.grandTotal})
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    addToCart, cart, qtyInc, qtyDec, removeCart, cartCheckout, cartCheckoutAddress, cartCheckoutPayment,cartCheckoutreview,orderSummary
}