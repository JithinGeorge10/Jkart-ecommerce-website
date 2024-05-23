const productCollection = require('../model/productModel')
const productOfferCollection = require('../model/productOfferModel')
const categoryOfferCollection = require('../model/categoryOfferModel')
const categoryCollection = require('../model/categoryModel')
const { applyProductOffer, applyCategoryOffer } = require("../helper/offer");
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
        await applyProductOffer()
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
      
        res.render('adminPages/editProductOffer', { offer })
    } catch (err) {
        console.log(err);
    }
}
const editProductOffer = async (req, res) => {
    try {

      

        if (/^\s*$/.test(req.body.offerPercentage)) {
            res.send({ noValue: true })
        } else if (req.body.offerPercentage < 5 || req.body.offerPercentage > 90) {
            res.send({ limitExceeds: true })
        } else {
            await productOfferCollection.updateOne({ _id: req.query.id }, {
                $set: {
                    productOfferPercentage: req.body.offerPercentage,
                    startDate: req.body.startDate,
                    endDate: req.body.expiryDate
                }
            })
            res.send({ success: true })
        }

    } catch (err) {
        console.log(err);
    }
}



const categoryOfferManagement = async (req, res) => {
    try {
        const categoryDet = await categoryCollection.find({ isListed: true })
        const offerDetail = await categoryOfferCollection.find().sort({ _id: -1 })
        res.render('adminPages/categoryOfferManagement', { categoryDet, offerDetail })
    } catch (err) {
        console.log(err);
    }
}



const addCategoryOffer = async (req, res) => {
    try {
        await applyCategoryOffer()
        const categoryDet = await categoryCollection.findOne({ categoryName: req.body.categoryName })
        const offerDet = await categoryOfferCollection.findOne({ categoryId: categoryDet._id })
        if (offerDet) {
            res.send({ offerExists: true })
        } else if (/^\s*$/.test(req.body.offerPercentage)) {
            res.send({ noValue: true })
        } else if (req.body.offerPercentage < 5 || req.body.offerPercentage > 90) {
            res.send({ limitExceeds: true })
        } else {
            const newCategoryOffer = new categoryOfferCollection({
                categoryId: categoryDet._id,
                categoryName: req.body.categoryName,
                productOfferPercentage: req.body.offerPercentage,
                startDate: req.body.startDate,
                endDate: req.body.expiryDate,
            })
            await newCategoryOffer.save()
            res.send({ success: true })
        }

    } catch (err) {
        console.log(err);
    }
}


const editCategoryOfferGet = async (req, res) => {
    try {

        const offer = await categoryOfferCollection.findOne({ _id: req.query.offerId })
     
        res.render('adminPages/editCategoryOffer', { offer })
    } catch (err) {
        console.log(err);
    }
}
const editCategoryOffer = async (req, res) => {
    try {

        if (/^\s*$/.test(req.body.offerPercentage)) {
            res.send({ noValue: true })
        } else if (req.body.offerPercentage < 5 || req.body.offerPercentage > 90) {
            res.send({ limitExceeds: true })
        } else {
            await categoryOfferCollection.updateOne({ _id: req.query.id }, {
                $set: {
                    productOfferPercentage: req.body.offerPercentage,
                    startDate: req.body.startDate,
                    endDate: req.body.expiryDate
                }
            })
            res.send({ success: true })
        }

    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    productOfferManagement, addProductOffer, editProductOfferGet, editProductOffer,
    categoryOfferManagement, addCategoryOffer,editCategoryOfferGet,editCategoryOffer
}