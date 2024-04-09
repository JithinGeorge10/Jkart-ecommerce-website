const categoryCollection = require('../model/categoryModel')
const productCollection = require('../model/productModel')



const categoryManagement = async (req, res) => {
    try {
        const catcollection = await categoryCollection.find().sort({ _id: -1 })
        res.render('adminPages/categoryManagement', { categoryDet: catcollection })
    } catch (err) {
        console.log(err);
    }
}

const addCategory = async (req, res) => {
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
        console.log(err);
    }
}
const categoryList = async (req, res) => {
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
        console.log(err);
    }
}

const editCategory = async (req, res) => {
    try {
        const catDetails = await categoryCollection.findOne({ categoryName: { $regex: new RegExp('^' + req.body.categoryName.toLowerCase() + '$', 'i') } })

        if (/^\s*$/.test(req.body.categoryName) || /^\s*$/.test(req.body.categoryDes)) {
            res.send({ noValue: true })
        }
        else if (catDetails && catDetails._id != req.body.categoryId) {
            res.send({ exists: true })
        }
        else {
            await categoryCollection.updateOne({ _id: req.body.categoryId }, { $set: { categoryName: req.body.categoryName, categoryDescription: req.body.categoryDes } })
            res.send({ success: true })
        }
    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    categoryManagement, addCategory, categoryList,editCategory
}