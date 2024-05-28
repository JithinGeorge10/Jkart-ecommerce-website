
const { trusted } = require('mongoose');
const userCollection = require('../model/userModel')
const addressCollection = require('../model/addressModel')
const orderCollection = require('../model/ordersModel');
const productCollection = require('../model/productModel');
const walletCollection = require('../model/walletModel');
const mongoose = require("mongoose");
const { productList } = require('./productController');
const { generateInvoice } = require("../services/generatePDF.js");
const AppError = require("../middleware/errorHandlingMiddleware.js")

const account = async (req, res, next) => {
    try {
        const userDet = await userCollection.findOne({ email: req.session.logged.email })
        res.render('userPages/accountProfile', { userLogged: req.session.logged, userDetails: userDet })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const editProfile = async (req, res,next) => {
    try {
        const contactDet = await userCollection.find({ phone: req.body.phone })
        const userDet = await userCollection.findOne({ email: req.session.logged.email })
        if (contactDet.length > 0 && userDet.phone != req.body.phone) {
            res.send({ exists: true })
        }
        await userCollection.updateOne({ email: req.session.logged.email }, { $set: { name: req.body.name, phone: req.body.phone } })
        req.session.logged.name = req.body.name;
        res.send({ profileEdited: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const addAddress = async (req, res,next) => {
    try {
        res.render('userPages/addAddress', { userLogged: req.session.logged })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const addAddressPost = async (req, res,next) => {
    try {
        if (/^\s*$/.test(req.body.address1) || /^\s*$/.test(req.body.address2) || /^\s*$/.test(req.body.city) || /^\s*$/.test(req.body.pincode)) {
            res.send({ noValue: true })
        } else {
            const userDet = await userCollection.findOne({ email: req.session.logged.email })
            const addAddress = new addressCollection({
                userId: userDet._id,
                username: req.body.name,
                address1: req.body.address1,
                address2: req.body.address2,
                addressTitle: req.body.title,
                phone: req.body.phone,
                alternatePhone: req.body.altphone,
                city: req.body.city,
                state: req.body.state,
                pincode: req.body.pincode
            })
            await addAddress.save()
            res.send({ addressSaved: true })

        }

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const myAddressget = async (req, res,next) => {
    try {
        const userAddress = await addressCollection.find({ userId: req.session.logged._id })
        res.render('userPages/myAddress', { userLogged: req.session.logged, userAddress: userAddress })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const addressDelete = async (req, res,next) => {
    try {
        await addressCollection.deleteOne({ _id: req.query.id })
        res.send({ success: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const editAddressGet = async (req, res,next) => {
    try {

        const userAddress = await addressCollection.findOne({ _id: req.query.id })
        res.render('userPages/editAddress', { userLogged: req.session.logged, userAddress })

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const editAddressPost = async (req, res,next) => {
    try {

        if (/^\s*$/.test(req.body.address1) || /^\s*$/.test(req.body.address2) || /^\s*$/.test(req.body.city) || /^\s*$/.test(req.body.pincode)) {
            res.send({ noValue: true })
        } else {
            await addressCollection.updateOne({ _id: req.query.id }, {
                $set: {
                    username: req.body.name,
                    address1: req.body.address1,
                    address2: req.body.address2,
                    addressTitle: req.body.title,
                    phone: req.body.phone,
                    alternatePhone: req.body.altphone,
                    pincode: req.body.pincode,
                    city: req.body.city,
                    state: req.body.state
                }
            })
            res.send({ addressSaved: true })
        }

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const allOrders = async (req, res,next) => {
    try {
        let orderDet = await orderCollection.find({ userId: req.session.logged._id, paymentId: { $ne: null } }).sort({ _id: -1 })
        const ordersPerPage = 10
        const totalPages = orderDet.length / ordersPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * ordersPerPage
        const end = start + ordersPerPage
        orderDet = orderDet.slice(start, end)



        res.render('userPages/allOrders', { userLogged: req.session.logged, orderDet, totalPages })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const cancelOrder = async (req, res,next) => {
    try {
        await orderCollection.updateOne({ _id: req.query.id }, { $set: { orderStatus: 'Cancelled', cancelReason: req.query.reason } })
        const orderDet = await orderCollection.findOne({ _id: req.query.id })
        for (let i = 0; i < orderDet.cartData.length; i++) {
            await productCollection.updateOne(
                { _id: orderDet.cartData[i].productId },
                { $inc: { productStock: orderDet.cartData[i].productQuantity } }
            );
        }
        if (orderDet.paymentType == 'paypal') {
            await walletCollection.updateOne(
                { userId: req.session.logged._id },
                {
                    $inc: {
                        walletBalance: orderDet.grandTotalCost
                    },
                    $push: {
                        walletTransaction: {
                            transactionDate: new Date(),
                            transactionAmount: orderDet.grandTotalCost,
                            transactionType: 'credit on cancel'
                        }
                    }
                },
                { upsert: true }
            );
        }


        res.send({ success: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const returnOrder = async (req, res,next) => {
    try {

        await orderCollection.updateOne({ _id: req.query.id }, { $set: { orderStatus: 'Request Return', returnReason: req.query.reason } })
        res.send({ success: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const viewOrder = async (req, res,next) => {
    try {

        let orderId = req.query.id
        res.send({ success: true, orderId })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const accountViewOrder = async (req, res,next) => {
    try {

        const orderDet = await orderCollection.findOne({ _id: req.query.id }).populate('userId')
        const addressDet = await addressCollection.findOne({ _id: orderDet.addressChosen })

        let cartProducts = []
        for (let i = 0; i < orderDet.cartData.length; i++) {
            cartProducts[i] = orderDet.cartData[i].productId
        }

        const productDet = await productCollection.find({ _id: cartProducts })

        res.render('userPages/viewOrder', { userLogged: req.session.logged, orderDet, addressDet, productDet })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}


const setDefault = async (req, res,next) => {
    try {
        await addressCollection.updateMany({ userId: req.session.logged._id }, { $set: { setAsDefault: false } })
        await addressCollection.updateOne({ _id: req.query.id, userId: req.session.logged._id }, { $set: { setAsDefault: true } })
        res.send({ success: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const singleProductCancel = async (req, res,next) => {
    try {
        const orderId = req.query.orderId.trim();
        const cartId = req.query.cartId.trim()
        await orderCollection.updateOne(
            { _id: new mongoose.Types.ObjectId(orderId), 'cartData._id': new mongoose.Types.ObjectId(cartId) },
            { $set: { 'cartData.$.status': 'Cancelled' } }
        );

        const order = await orderCollection.findOne({ _id: new mongoose.Types.ObjectId(orderId) });
        const allCancelled = order.cartData.every(item => item.status === 'Cancelled');

        if (allCancelled) {
            await orderCollection.updateOne(
                { _id: new mongoose.Types.ObjectId(orderId) },
                { $set: { orderStatus: 'Cancelled' } }
            );
        }

        for (let i = 0; i < order.cartData.length; i++) {
            await productCollection.updateOne(
                { _id: order.cartData[i].productId },
                { $inc: { productStock: order.cartData[i].productQuantity } }
            );
        }

        if (order.paymentType == 'paypal') {

            await walletCollection.updateOne(
                { userId: req.session.logged._id },
                {
                    $inc: {
                        walletBalance: order.grandTotalCost
                    },
                    $push: {
                        walletTransaction: {
                            transactionDate: new Date(),
                            transactionAmount: order.grandTotalCost,
                            transactionType: 'credit on cancel'
                        }
                    }
                },
                { upsert: true }
            );
        }
        res.send({ success: true })



    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}





const singleReturnOrder = async (req, res,next) => {
    try {

        const id = req.query.id.trim();
        const cartId = req.query.cartId.trim()

        const order = await orderCollection.find({ _id: new mongoose.Types.ObjectId(id), 'cartData._id': new mongoose.Types.ObjectId(cartId) })


        await orderCollection.findOneAndUpdate(
            { _id: new mongoose.Types.ObjectId(id), 'cartData._id': new mongoose.Types.ObjectId(cartId) },
            { $set: { 'cartData.$.status': 'Request Return', 'cartData.$.returnReason': req.query.reason } }
        );
        const orderData = await orderCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });
        const allReturned = orderData.cartData.every(item => item.status === 'Request Return');

        // If all products have been returned, update orderStatus to 'Returned'
        if (allReturned) {
            await orderCollection.findOneAndUpdate(
                { _id: new mongoose.Types.ObjectId(id) },
                { $set: { orderStatus: 'Request Return' } }
            );
        }
        res.send({ success: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}


const downloadInvoice = async (req, res,next) => {
    try {

        let orderData = await orderCollection
            .findOne({ _id: req.query.id })
            .populate("addressChosen");


        // Extract order number
        const orderNumber = orderData._id;

        // Construct filename with order number
        const filename = `invoice_order_${orderNumber}.pdf`;

        const stream = res.writeHead(200, {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=${filename}`,
        });

        generateInvoice(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            orderData
        );
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}


module.exports = {
    account, editProfile, addAddress, addAddressPost, myAddressget, addressDelete,
    editAddressGet, editAddressPost, allOrders, cancelOrder, viewOrder, accountViewOrder, returnOrder, setDefault,
    singleProductCancel, singleReturnOrder, downloadInvoice
}