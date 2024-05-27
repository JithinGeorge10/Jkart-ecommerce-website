const fs = require('fs');
const path = require('path');

const categoryCollection = require('../model/categoryModel')
const productCollection = require('../model/productModel');
const { log } = require('util');



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
       
        const croppedImages = req.files.filter(file => file.fieldname.startsWith('croppedImage'));
       
        if (req.files.length < 3) {
            res.send({ minImage: true })
        } else {
          
            const images = croppedImages.map(file => file.filename); // Extract filenames
         
            const addproduct = new productCollection({
                productName: req.body.productName,
                parentCategory: req.body.parentCategory,
                productImage: images,
                productPrice: req.body.productPrice,
                productStock: req.body.productStock,
                offerPrice: req.body.productPrice
            })
            
            const productDetails = await productCollection.find({ productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') }, isDeleted: false })
            if (/^\s*$/.test(req.body.productName) || /^\s*$/.test(req.body.productPrice) || /^\s*$/.test(req.body.productStock)) {
                res.send({ noValue: true })
            } else if (/^\s/.test(req.body.productName)) { // Check if there are leading whitespaces
                res.send({ whitespaceAlert: true });
            } else if (productDetails.length > 0) {
                res.send({ exists: true })
            }else {
                await addproduct.save()
                res.send({ success: true })
            
            }
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
     
            const croppedImages = req.files.filter(file => file.fieldname.startsWith('croppedImage'));
            const images = croppedImages.map(file => file.filename); // Extract filenames
            // New images uploaded
            const existingProduct = await productCollection.findOne({ _id: req.params.id });
            imgFiles = existingProduct.productImage || [];

            // Append new image filenames to the existing ones
            for (let i = 0; i < images.length; i++) {
                imgFiles.push(images[i]);
            }
        

        const productDetails = await productCollection.find({ _id: { $ne: req.params.id }, productName: { $regex: new RegExp('^' + req.body.productName.toLowerCase() + '$', 'i') }, isDeleted: false })
        if (/^\s/.test(req.body.productName)) { // Check if there are leading whitespaces
            res.send({ whitespaceAlert: true });
        } else if (/^\s*$/.test(req.body.productName) || /^\s*$/.test(req.body.productPrice) || /^\s*$/.test(req.body.productStock)) {
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

        const productDet = await productCollection.find({ productName: { $regex: new RegExp(req.body.search, 'i') },isListed:true,isDeleted:false });


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
        const { productId, imageId } = req.query;

        // Delete image from database
        await productCollection.updateOne(
            { _id: productId },
            { $pull: { productImage: imageId } }
        );

        // Delete image from public folder
        const publicFolderPath = path.resolve('public', 'assets', 'img', 'uploads');
        const imagePath = path.join(publicFolderPath, imageId);

     

        try {
            await fs.promises.unlink(imagePath);
          
            res.send({ success: true });
        } catch (error) {
            console.error(`Error deleting image file: ${error.message}`);
            res.status(500).send({ success: false, error: 'Failed to delete image file' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, error: 'Internal Server Error' });
    }
};

module.exports = {
    productManagement, productList, addProductGet, addProducts,
    editProduct, editProducts, searchProducts, deleteProduct, imageDelete
}