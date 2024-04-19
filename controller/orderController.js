const { trusted } = require('mongoose');
const orderCollection = require('../model/ordersModel')
const productCollection = require('../model/productModel')
const addressCollection = require('../model/addressModel');
const { productList } = require('./productController');

const orderManagement = async (req, res) => {
    try {
        const orderDet = await orderCollection.find().populate('userId').sort({ _id: -1 })
        res.render('adminPages/orderManagement', { orderDet })
    } catch (err) {
        console.log(err);
    }
}
const orderStatusChange = async (req, res) => {
    try {
        if (req.query.status) {
            await orderCollection.updateOne({ _id: req.query.orderId }, { $set: { orderStatus: req.query.status } })
        }
        res.send({ success: true })
    } catch (err) {
        console.log(err);
    }
}

const adminViewOrder = async (req, res) => {
    try {
        req.session.viewOrder = await orderCollection.findOne({ _id: req.query.orderId })
        req.session.viewOrderAddress = await addressCollection.findOne({ _id: req.session.viewOrder.addressChosen })

        //   req.session.viewOrderProduct=await productCollection.find({_id:req.session.viewOrder.cartData.productId})
        console.log('viewOrder' + req.session.viewOrder)
        console.log('address' + req.session.viewOrderAddress)
        //   console.log('product'+req.session.viewOrderProduct)
        res.send({ success: true, orderDet: req.session.viewOrder, addressDet: req.session.viewOrderAddress })
    } catch (err) {
        console.log(err);
    }
}
const orderView = async (req, res) => {
    try {
        let cartProducts = []
        for (let i = 0; i < req.session.viewOrder.cartData.length; i++) {
            cartProducts[i] = req.session.viewOrder.cartData[i].productId
        }
       const productdet=await productCollection.find({_id:cartProducts})
       console.log(productdet)

        res.render('adminPages/orderView', { orderDet: req.session.viewOrder, addressDet: req.session.viewOrderAddress,productdet })
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    orderManagement, orderStatusChange, adminViewOrder, orderView
}