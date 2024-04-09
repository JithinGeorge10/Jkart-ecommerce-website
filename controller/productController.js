
const categoryCollection = require('../model/categoryModel')
const productCollection = require('../model/productModel')



const productManagement = async (req, res) => {
    try {
        const productDetails = await productCollection.find().populate('parentCategory').sort({ _id: -1 })
        res.render('adminPages/productManagement', { productDet: productDetails })
    } catch (err) {
        console.log(err);
    }
}

const productList = async (req, res) => {
    try {
        let productList
        if (req.query.action === 'list') {
            productList = false
        } else {
            productList = true
        }
        await productCollection.updateOne({ _id: req.query.id }, { $set: { isListed: productList } })
        res.send({ list: productList })
    } catch (err) {
        console.log(err);
    }
}

const addProductGet = async (req, res) => {
    try {
        const categoryDetails = await categoryCollection.find()
        res.render('adminPages/addProduct', { categoryDet: categoryDetails })
    } catch (err) {
        console.log(err);
    }
}

const addProducts = async (req, res) => {
    try {
        let imgFiles = []
        for (let i = 0; i < req.files.length; i++) {
            imgFiles[i] = req.files[i].filename
        }

        const addproduct = new productCollection({
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage: imgFiles,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock
        })
        const productDetails = await productCollection.find({ productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') } })
        if (/^\s*$/.test(req.body.productName) || /^\s*$/.test(req.body.productPrice) || /^\s*$/.test(req.body.productStock)) {
            res.send({ noValue: true })
        }
        else if (productDetails.length > 0) {
            res.send({ exists: true })
        } else {
            res.send({ success: true })
            addproduct.save()
        }

    } catch (err) {
        console.log(err);
    }
}

const editProduct = async (req, res) => {
    try {


        const categoryDetail = await categoryCollection.find()
        const categoryDet = await categoryCollection.findOne({ _id: req.query.cid })
        const productDet = await productCollection.findOne({ _id: req.query.pid })
        console.log(productDet)
        res.render('adminPages/editProduct', { categoryDet, productDet, categoryDetail })
    } catch (err) {
        console.log(err);
    }
}

const editProducts = async (req, res) => {
    try {
        console.log(req.files)
        if (req.files.length < 3) {
            res.send({ noImage: true })
        } else{
            var imgFiles = []
            for (let i = 0; i < req.files.length; i++) {
                imgFiles[i] = req.files[i].filename
            }
        }
           //dfhbsjdbfjs
           
       

        const productDetails = await productCollection.find({ _id: { $ne: req.params.id }, productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') } })
        if (/^\s*$/.test(req.body.productName) || /^\s*$/.test(req.body.productPrice) || /^\s*$/.test(req.body.productStock)) {
            res.send({ noValue: true })
        }
        // catDetails._id != req.body.categoryId
        else if (productDetails.length > 0 && req.body.productName != productDetails.productName) {
            res.send({ exists: true })
        } else {
            await productCollection.updateOne({ _id: req.params.id }, {
                $set: {
                    productName: req.body.productName,
                    parentCategory: req.body.parentCategory,
                    productImage: imgFiles,
                    productPrice: req.body.productPrice,
                    productStock: req.body.productStock
                }
            })
            res.send({ success: true })

        }

    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    productManagement, productList, addProductGet, addProducts,
    editProduct, editProducts
}