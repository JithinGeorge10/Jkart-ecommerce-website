const orderCollection = require('../model/ordersModel')

const orderManagement = async (req, res) => {
    try {
        const orderDet=await orderCollection.find().populate('userId')
        console.log(orderDet);
        res.render('adminPages/orderManagement',{orderDet})
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    orderManagement
}