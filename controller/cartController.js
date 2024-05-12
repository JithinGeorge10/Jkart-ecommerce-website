const { createCollection } = require("../model/categoryModel")
const cartCollection = require('../model/cartModel')
const productCollection = require('../model/productModel')
const addressCollection = require('../model/addressModel')
const orderCollection = require('../model/ordersModel')
const couponCollection = require('../model/couponModel')
const walletCollection = require('../model/walletModel')
const axios = require('axios');
const uniqid = require('uniqid')
const sha256 = require('sha256')
const paypal = require('paypal-rest-sdk')
paypal.configure({
    'mode': process.env.PAYPAL_MODE, //sandbox or live
    'client_id': process.env.PAYPAL_CLIENT_KEY,
    'client_secret': process.env.PAYPAL_SECRET_KEY
});

const addToCart = async (req, res) => {
    try {
        const productDet = await productCollection.findOne({ _id: req.query.pid });
        const existingCartItem = await cartCollection.findOne({ userId: req.session.logged._id, productId: req.query.pid });

        if (existingCartItem) {
            const updatedQuantity = parseInt(existingCartItem.productQuantity) + parseInt(req.query.qty);
            const updatedTotalCost = updatedQuantity * productDet.offerPrice;

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
                totalCostPerProduct: req.query.qty * productDet.offerPrice
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

        const cartTotal = await cartCollection.aggregate([{ $group: { _id: null, sum: { $sum: '$totalCostPerProduct' } } }])

        req.session.grandTotal = cartTotal[0]?.sum
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
                $inc: { productQuantity: 1, totalCostPerProduct: productDet.offerPrice },
            }
        )
        req.session.updatedPrice = await cartCollection.findOne({ productId: req.query.id })
        req.session.grandTotal = req.session.grandTotal + productDet.offerPrice
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
                $inc: { productQuantity: -1, totalCostPerProduct: -productDet.offerPrice },
            }
        )
        req.session.updatedPrice = await cartCollection.findOne({ productId: req.query.id })
        req.session.grandTotal = req.session.grandTotal - productDet.offerPrice

        res.send({ success: true, updatedPrice: req.session.updatedPrice, grandTotal: req.session.grandTotal })
    } catch (err) {
        console.log(err);
    }
}

const removeCart = async (req, res) => {
    try {

        await cartCollection.deleteOne({ productId: req.query.pid })
        res.send({ success: true })
    } catch (err) {
        console.log(err);
    }
}


const cartCheckout = async (req, res) => {
    try {
        const addressDet = await addressCollection.find({ userId: req.session.logged._id, setAsDefault: true })
        res.render('userPages/cartCheckout', { userLogged: req.session.logged, userAddress: addressDet })
    } catch (err) {
        console.log(err);
    }
}


const changeAddressGet = async (req, res) => {
    try {
        const addressDet = await addressCollection.find({ userId: req.session.logged._id, setAsDefault: false })
        res.render('userPages/changeAddress', { userLogged: req.session.logged, userAddress: addressDet })
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
        const shippingAddress = await addressCollection.findOne({ _id: req.session.selectedAddress })
        res.render('userpages/cartCheckoutPayment', { userLogged: req.session.logged, shippingAddress })
    } catch (err) {
        console.log(err);
    }
}

const cartCheckoutreview = async (req, res) => {
    try {
        if (req.query.id === 'null') {
            res.send({ noPaymentMethod: true })
        } else {

            const cartDet = await cartCollection.find({ userId: req.session.logged._id })

            if (req.session.orderDetails) {
                const order = await orderCollection.find({ _id: req.session.orderDetails })
                await orderCollection.updateOne({ _id: req.session.orderDetails }, {
                    $set: {
                        userId: req.session.logged._id,
                        paymentType: req.query.id,
                        addressChosen: req.session.selectedAddress,
                        cartData: cartDet,
                        grandTotalCost: req.session.grandTotal
                    }
                });

            } else {
                order = await orderCollection.create({
                    userId: req.session.logged._id,
                    paymentType: req.query.id,
                    addressChosen: req.session.selectedAddress,
                    cartData: cartDet,
                    grandTotalCost: req.session.grandTotal
                });
                req.session.orderDetails = order._id
            }

        }

        res.send({ success: true })



    } catch (err) {
        console.log(err);
    }
}


const orderSummary = async (req, res) => {
    try {

        const orderDet = await orderCollection.findOne({ _id: req.session.orderDetails })
        const shippingAddress = await addressCollection.findOne({ _id: orderDet.addressChosen })
        const cartDetails = await cartCollection.find({ userId: req.session.logged._id }).populate('productId')
        const couponDet = await couponCollection.find()
        const couponAmount = await couponCollection.findOne({ _id: orderDet.couponApplied })
        res.render('userPages/orderSummary', { couponDet, orderDet, couponAmount, userLogged: req.session.logged, cartDetails, shippingAddress, paymentMethod: orderDet.paymentType, grandTotal: orderDet.grandTotalCost })
    } catch (err) {
        console.log(err);
    }
}

const orderPlace = async (req, res) => {
    try {
        const cartDet = await cartCollection.find({ userId: req.session.logged._id })
        const orderDet = await orderCollection.findOne({ _id: req.session.orderDetails })
        console.log('bla' + orderDet)
        if (orderDet.paymentType === 'Cash On Delivery') {
            console.log('orderplace COD');
            await orderCollection.updateOne({ _id: req.session.orderDetails }, { $set: { paymentId: 'COD' } })
            for (let cart of cartDet) {
                await productCollection.updateOne(
                    { _id: cart.productId },
                    { $inc: { productStock: -cart.productQuantity } }
                );
            }
            await cartCollection.deleteMany({ userId: req.session.logged._id })
            res.send({ success: true })
        } else if (orderDet.paymentType === 'phone pe') {
            res.send({ phonepe: true })
        } else if (orderDet.paymentType === 'paypal') {
            res.send({ paypal: true })
        } else if (orderDet.paymentType === 'wallet') {
            await orderCollection.updateOne({ _id: req.session.orderDetails }, { $set: { paymentId: 'Wallet' } })
            for (let cart of cartDet) {
                await productCollection.updateOne(
                    { _id: cart.productId },
                    { $inc: { productStock: -cart.productQuantity } }
                );
            }
            await cartCollection.deleteMany({ userId: req.session.logged._id })
            ////

            await walletCollection.updateOne(
                { userId: req.session.logged._id },
                {
                    $inc: {
                        walletBalance: -orderDet.grandTotalCost
                    },
                    $push: {
                        walletTransaction: {
                            transactionDate: new Date(),
                            transactionAmount: orderDet.grandTotalCost,
                            transactionType: 'Debit on online payment'
                        }
                    }
                },
                { upsert: true }
            );


            res.send({ success: true })
        }

    } catch (err) {
        console.log(err);
    }
}


const orderPlaceComleted = async (req, res) => {
    try {
        const cartDet = await cartCollection.find({ userId: req.session.logged._id })



        await orderCollection.updateOne({ _id: req.session.orderDetails }, { $set: { paymentId: req.session.paymentId } })
        for (let cart of cartDet) {
            await productCollection.updateOne(
                { _id: cart.productId },
                { $inc: { productStock: -cart.productQuantity } }
            );
        }

        await cartCollection.deleteMany({ userId: req.session.logged._id })


        const orderDet = await orderCollection.find({ userId: req.session.logged._id }).sort({ _id: -1 }).limit(1)

        req.session.orderDetails = null
        req.session.grandTotal = null
        res.render('userPages/orderPlaced', { userLogged: req.session.logged, orderDet })
    } catch (err) {
        console.log(err);
    }
}

const phonePay = async (req, res) => {
    try {

        const order = await orderCollection.findOne({ _id: req.session.orderDetails })
        console.log('orderphonepe' + order);
        const payEndpoint = '/pg/v1/pay'
        const merchantTransactionId = uniqid()
        const amountInPaise = order.grandTotalCost * 100;
        console.log('grandtotal' + amountInPaise);
        const payload =
        {
            "merchantId": process.env.MERCHANT_ID,
            "merchantTransactionId": merchantTransactionId,
            "merchantUserId": req.session.logged._id,
            "amount": amountInPaise,
            "redirectUrl": `http://localhost:` + process.env.PORT + `/orderPlaceComleted?tranId=${merchantTransactionId}`,
            "redirectMode": "REDIRECT",
            "mobileNumber": req.session.logged.phone,
            // "callbackUrl": `http://localhost:` + process.env.PORT + `/orderPlaceComleted?tranId=${merchantTransactionId}`,
            "paymentInstrument": {
                "type": "PAY_PAGE"
            }
        }

        const bufferObj = Buffer.from(JSON.stringify(payload), 'utf8')
        const base63EncodedPayload = bufferObj.toString('base64')
        const xVerify = sha256(base63EncodedPayload + payEndpoint + process.env.SALT_KEY) + '###' + process.env.SALT_INDEX;


        const options = {
            method: 'post',
            url: 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': xVerify
            },
            data: {
                request: base63EncodedPayload
            }
        };

        axios
            .request(options)
            .then(function (response) {
                console.log(response.data);
                const url = response.data.data.instrumentResponse.redirectInfo.url
                res.redirect(url)
                // res.send({url})
            })
            .catch(function (error) {
                console.log('error caught');
                console.error(error);
            });

    } catch (err) {
        console.log('error caught');
        console.log(err);
    }
}


const payPal = async (req, res) => {
    try {

        const orderDet = await orderCollection.findOne({ userId:req.session.logged._id }).sort({_id:-1}).limit(1)
        console.log('grandtotoal'+orderDet.grandTotalCost)
        var amount = orderDet.grandTotalCost.toFixed(2);
        var create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": `http://localhost:` + process.env.PORT + `/orderPlaceComleted`,
                "cancel_url": `http://localhost:` + process.env.PORT + `/orderSummary`
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": "book",
                        "sku": "001",
                        "price":amount ,
                        "currency": "USD",
                        "quantity": 1
                    }]
                },
                "amount": {
                    "currency": "USD",
                    "total": amount // Fix the total amount to 2 decimal places
                },
                "description": "This is the payment description.",

            }]
        };

        // Create payment
        paypal.payment.create(create_payment_json, async function (error, payment) {
            if (error) {
                console.error("Error in creating payment:", error);
                return res.status(500).send('Error in creating payment');
            } else {
                console.log("Create Payment Response");
                console.log(payment);
                req.session.paymentId = payment.id
                for (let i = 0; i < payment.links.length; i++) {
                    if (payment.links[i].rel === 'approval_url') {
                        return res.redirect(payment.links[i].href);
                    }
                }
                res.status(500).send('Approval URL not found.');
            }
        });
    } catch (err) {
        console.error("Error in onlinePayment:", err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = {
    addToCart, cart, qtyInc, qtyDec, removeCart, cartCheckout, cartCheckoutAddress,
    cartCheckoutPayment, cartCheckoutreview, orderSummary, orderPlace, orderPlaceComleted, phonePay, changeAddressGet, payPal
}