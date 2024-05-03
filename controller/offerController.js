const productCollection = require('../model/productModel')
const productOfferCollection = require('../model/productOfferModel')

const productOfferManagement = async (req, res) => {
    try {
        const productDet = await productCollection.find({ isListed: true, isDeleted: false })
        const offerDetail = await productOfferCollection.find().sort({ _id: -1 })
        res.render('adminPages/productOfferManagement', { productDet, offerDetail })
    } catch (err) {
        console.log(err);
    }
}
const addProductOffer = async (req, res) => {
    try {

        const productDet = await productCollection.findOne({ productName: req.body.productName })
        const offerDet = await productOfferCollection.findOne({ productId: productDet._id })
        if (offerDet) {
            res.send({ offerExists: true })
        } else if (/^\s*$/.test(req.body.offerPercentage)) {
            res.send({ noValue: true })
        } else if (req.body.offerPercentage < 5 || req.body.offerPercentage > 90) {
            res.send({ limitExceeds: true })
        } else {
            const newProductOffer = new productOfferCollection({
                productId: productDet._id,
                productName: req.body.productName,
                productOfferPercentage: req.body.offerPercentage,
                startDate: req.body.startDate,
                endDate: req.body.expiryDate,
            })
            await newProductOffer.save()
            res.send({ success: true })
        }

    } catch (err) {
        console.log(err);
    }
}

const editProductOfferGet = async (req, res) => {
    try {

        const offer = await productOfferCollection.findOne({ _id: req.query.offerId })
        console.log(offer)
        res.render('adminPages/editProductOffer', { offer })
    } catch (err) {
        console.log(err);
    }
}
const editProductOffer = async (req, res) => {
    try {

        console.log('1' + req.query.id)
        console.log('2' + req.body.offerPercentage)

        if (/^\s*$/.test(req.body.offerPercentage)) {
            res.send({ noValue: true })
        } else if (req.body.offerPercentage < 5 || req.body.offerPercentage > 90) {
            res.send({ limitExceeds: true })
        }else{
            await productOfferCollection.updateOne({_id:req.query.id},{$set:{
                productOfferPercentage:req.body.offerPercentage,
                startDate:req.body.startDate,
                endDate:req.body.expiryDate
            }})
            res.send({success:true})
        }

    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    productOfferManagement, addProductOffer, editProductOfferGet, editProductOffer
}