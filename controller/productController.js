
const categoryCollection = require('../model/categoryModel')
const productCollection = require('../model/productModel')



const productManagement = async (req, res) => {
    try {
        let productDetails = req.session.searchProducts || await productCollection.find({ isDeleted: false }).populate('parentCategory').sort({ _id: -1 })
        req.session.searchProducts = null
        const productsPerPage = 10
        const totalPages = productDetails.length / productsPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        productDetails = productDetails.slice(start, end)

        res.render('adminPages/productManagement', { productDet: productDetails, totalPages })
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
        if (req.files.length < 3) {
            res.send({ minImage: true })
        } else {
            for (let i = 0; i < req.files.length; i++) {
                imgFiles[i] = req.files[i].filename
            }
        }
        const addproduct = new productCollection({
            productName: req.body.productName,
            parentCategory: req.body.parentCategory,
            productImage: imgFiles,
            productPrice: req.body.productPrice,
            productStock: req.body.productStock,
            offerPrice: req.body.productPrice
        })
        const productDetails = await productCollection.find({ productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') }, isDeleted: false })
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

        res.render('adminPages/editProduct', { categoryDet, productDet, categoryDetail })
    } catch (err) {
        console.log(err);
    }
}
const editProducts = async (req, res) => {
    try {
        let imgFiles = [];
        if (req.files.length === 0) {
            // No new images uploaded, retain existing images
            const existingProduct = await productCollection.findOne({ _id: req.params.id });
            imgFiles = existingProduct.productImage;
        } else {
            // New images uploaded
            const existingProduct = await productCollection.findOne({ _id: req.params.id });
            imgFiles = existingProduct.productImage || [];

            // Append new image filenames to the existing ones
            for (let i = 0; i < req.files.length; i++) {
                imgFiles.push(req.files[i].filename);
            }
        }

        const productDetails = await productCollection.find({ _id: { $ne: req.params.id }, productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') }, isDeleted: false })
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
                    productStock: req.body.productStock,
                    offerPrice: req.body.productPrice
                }
            })
            res.send({ success: true })

        }

    } catch (err) {
        console.log(err);
    }
}



const searchProducts = async (req, res) => {
    try {

        const productDet = await productCollection.find({ productName: { $regex: new RegExp(req.body.search, 'i') } });


        if (/^\s*$/.test(req.body.search)) {
            res.send({ noValue: true })
        } else if (productDet.length > 0) {
            req.session.searchProducts = productDet
            res.send({ productExists: true })
        } else {
            res.send({ noProduct: true })
        }
    } catch (err) {
        console.log(err);
    }
}

const deleteProduct = async (req, res) => {
    try {

        await productCollection.updateOne({ _id: req.query.id }, { $set: { isDeleted: true } })
        res.send({ deleted: true })
    } catch (err) {
        console.log(err);
    }
}

const imageDelete = async (req, res) => {
    try {
        
        await productCollection.updateOne(
            { _id: req.query.productId },
            { $pull: { productImage: req.query.imageId } }
        )
        res.send({success:true})


    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    productManagement, productList, addProductGet, addProducts,
    editProduct, editProducts, searchProducts, deleteProduct, imageDelete
}