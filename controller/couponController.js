
const couponCollecton = require('../model/couponModel')

const couponManagement = async (req, res) => {
    try {
        const couponDet = await couponCollecton.find()
        res.render('adminPages/couponManagement', { couponDet })
    } catch (err) {
        console.log(err);
    }
}



const addCoupon = async (req, res) => {
    try {
        console.log(req.body)
        const newCoupon = new couponCollecton({
            couponCode: req.body.couponCode,
            couponAmount: req.body.couponAmount,
            expiryDate: req.body.expiryDate,
            minimumPurchase: req.body.minimumPurchase,
            startDate: req.body.startDate
        })
        await newCoupon.save()
        res.send({ success: true })
    } catch (err) {
        console.log(err);
    }
}

const editCouponGet = async (req, res) => {
    try {
        console.log('edit' + req.query.couponId)
        const couponDet = await couponCollecton.findOne({ _id: req.query.couponId })
        console.log(couponDet);
        res.render('adminPages/couponEdit', { couponDet })
    } catch (err) {
        console.log(err);
    }
}
const adminEditCoupon = async (req, res) => {
    try {
        const couponExists = await couponCollecton.findOne({
            couponCode: { $regex: new RegExp('^' + req.body.couponCode + '$', 'i') }
        });
        const couponDet = await couponCollecton.findOne({ _id: req.query.id })
        if (couponExists && couponDet.couponCode != req.body.couponCode) {
            res.send({ couponExists: true })
        } else if (/^\s*$/.test(req.body.couponCode) || /^\s*$/.test(req.body.minimumPurchase) || /^\s*$/.test(req.body.couponAmount)) {
            res.send({ noValue: true })
        } else {
            await couponCollecton.updateOne({ _id: req.query.id }, {
                $set: {
                    couponCode: req.body.couponCode,
                    couponAmount: req.body.couponAmount,
                    expiryDate: req.body.expiryDate,
                    minimumPurchase: req.body.minimumPurchase,
                    startDate: req.body.startDate
                }
            })
            res.send({ success: true })
        }

    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    couponManagement, addCoupon, editCouponGet, adminEditCoupon
}