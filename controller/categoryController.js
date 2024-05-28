const categoryCollection = require('../model/categoryModel')
const productCollection = require('../model/productModel')

const AppError = require("../middleware/errorHandlingMiddleware.js")


const categoryManagement = async (req, res,next) => {
    try {
        let catcollection = req.session.searchCategory||await categoryCollection.find().sort({ _id: -1 })
        req.session.searchCategory=null
        const categoryPerPage = 10
        const totalPages = catcollection.length / categoryPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * categoryPerPage
        const end = start + categoryPerPage
        catcollection = catcollection.slice(start, end)

        res.render('adminPages/categoryManagement', { categoryDet: catcollection ,totalPages})
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));

    }
}

const addCategory = async (req, res,next) => {
    try {
        const newCategory = new categoryCollection({
            categoryName: req.body.categoryName,
            categoryDescription: req.body.categoryDes
        })
        // const catExists = await categoryCollection.findOne({ categoryName: req.body.categoryName })
        const catExists = await categoryCollection.findOne({
            categoryName: { $regex: new RegExp('^' + req.body.categoryName + '$', 'i') }
        });

        if (catExists) {
            res.send({ invalid: true })
        } else {
            newCategory.save()
            res.send({ success: true })
        }

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const categoryList = async (req, res,next) => {
    try {
        let catList
        if (req.query.action === 'list') {
            catList = true
        } else {
            catList = false
        }
        await productCollection.updateMany({ parentCategory: req.query.id }, { $set: { isListed: catList } })
        await categoryCollection.updateOne({ _id: req.query.id }, { $set: { isListed: catList } })
        res.send({ list: catList })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const editCategory = async (req, res,next) => {
    try {
        const catDetails = await categoryCollection.findOne({ categoryName: { $regex: new RegExp('^' + req.body.categoryName.trim().toLowerCase() + '$', 'i') } })


        if (/^\s/.test(req.body.categoryName)) { // Check if there are leading whitespaces
            res.send({ whitespaceAlert: true });
        } else if (/^\s*$/.test(req.body.categoryName.trim()) || /^\s*$/.test(req.body.categoryDes)) {
            res.send({ noValue: true })
        }
        else if (catDetails && catDetails._id != req.body.categoryId) {
            res.send({ exists: true })
        }
        else {
            await categoryCollection.updateOne({ _id: req.body.categoryId }, { $set: { categoryName: req.body.categoryName.trim(), categoryDescription: req.body.categoryDes } })
            res.send({ success: true })
        }
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const searchCategory = async (req, res,next) => {
    try {
        const categoryDet = await categoryCollection.find({ categoryName: { $regex: new RegExp(req.body.search, 'i') } });


        if (/^\s*$/.test(req.body.search)) {
            res.send({ noValue: true })
        }else if(categoryDet.length>0){
            req.session.searchCategory=categoryDet
            res.send({categoryExists:true})
        }else{
            res.send({noCat:true })
        }
        // res.send({ userStat: userBlock })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

module.exports = {
    categoryManagement, addCategory, categoryList,editCategory,searchCategory
}