const { trusted } = require('mongoose');
const orderCollection = require('../model/ordersModel')
const productCollection = require('../model/productModel')
const addressCollection = require('../model/addressModel');
const walletCollection = require('../model/walletModel');
const mongoose = require("mongoose")
const { productList } = require('./productController');
const { createCollection } = require('../model/userModel');

const orderManagement = async (req, res) => {
    try {
        let orderDet = req.session.searchOrder || await orderCollection.find({
            paymentId: { $ne: null },
            orderStatus: { $nin: ['Request Return', 'Approved','Returned'] }
        }).populate('userId').sort({ _id: -1 });
                const ordersPerPage = 10
        const totalPages = orderDet.length / ordersPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * ordersPerPage
        const end = start + ordersPerPage
        orderDet = orderDet.slice(start, end)

        res.render('adminPages/orderManagement', { orderDet,totalPages })
    } catch (err) {
        console.log(err);
    }
}
const orderStatusChange = async (req, res) => {
    try {
        if (req.query.status === 'Approved') {
            await orderCollection.updateOne(
                { _id: req.query.orderId },
                {
                    $set: { 
                        orderStatus: 'Returned',
                        "cartData.$[element].status": 'Returned'
                    }
                },
                {
                    arrayFilters: [{ "element.status": { $exists: true } }]
                }
            );
        
            const orderData = await orderCollection.findOne({ _id: req.query.orderId });
            // Check if cartData exists and is an array
            if (orderData && orderData.cartData && Array.isArray(orderData.cartData)) {
                // Update product stock quantity for each item in cartData
                for (const item of orderData.cartData) {
                    await productCollection.updateMany(
                        { _id: item.productId },
                        { $inc: { productStock: item.productQuantity } }
                    );
                } 
                await walletCollection.updateOne(
                    { userId: req.session.logged._id },
                    {
                        $inc: {
                            walletBalance: orderData.grandTotalCost
                        },
                        $push: {
                            walletTransaction: {
                                transactionDate: new Date(),
                                transactionAmount: orderData.grandTotalCost,
                                transactionType: 'credit on return'
                            }
                        }
                    },
                    { upsert: true }
                );
            } else {
                console.error('Order data or cart data is missing or not in the correct format.');
            }
        }else if(req.query.status === 'Rejected'){
            await orderCollection.updateOne(
                { _id: req.query.orderId },
                {
                    $set: { 
                        orderStatus: 'Return Rejected',
                        "cartData.$[element].status": 'Return Rejected'
                    }
                },
                {
                    arrayFilters: [{ "element.status": { $exists: true } }]
                }
            );
            }
        else {
            await orderCollection.updateOne(
                { _id: req.query.orderId },
                {
                  $set: { 
                    orderStatus: req.query.status,
                    "cartData.$[element].status": req.query.status
                  }
                },
                {
                  arrayFilters: [{ "element.status": { $exists: true } }]
                }
              );
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


        res.render('adminPages/orderView', { orderDet: req.session.viewOrder, addressDet: req.session.viewOrderAddress,productdet })
    } catch (err) {
        console.log(err);
    }
}

const searchOrder = async (req, res) => {
    try {
 
        const orderDet = await orderCollection.findOne({ _id: req.body.search });

        if (/^\s*$/.test(req.body.search)) {
            res.send({ noValue: true })
        }else if(orderDet.length>0){
            req.session.searchOrder=orderDet
            res.send({orderExists:true})
        }else{
            res.send({noOrder:true })
        }
    } catch (err) {
        console.log(err);
    }
}

const cartStatusChange = async (req, res) => {
    try {
        const orderId = req.query.orderId.trim();
        const cartId = req.query.cartId.trim()
       

        await orderCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(orderId), 'cartData._id': new mongoose.Types.ObjectId(cartId) },
            { $set: { 'cartData.$.status': req.query.status } }
        );
        const order = await orderCollection.findOne({ _id: new mongoose.Types.ObjectId(orderId) });

        const sameStatus = order.cartData.every(item => item.status === req.query.status);

        if (sameStatus) {
            await orderCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(orderId) },
                { $set: { orderStatus: req.query.status } }
            );
        }
        res.send({success:true})
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    orderManagement, orderStatusChange, adminViewOrder, orderView,searchOrder,cartStatusChange
}