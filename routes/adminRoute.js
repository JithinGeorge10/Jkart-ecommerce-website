const express=require('express')
const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const adminAuth = require('../middleware/adminAuth.js')
const router=express.Router()
const upload = require('../services/multer.js')


router.get('/admin',adminController.loginpage)
router.post('/adminlogin',adminController.adminlogin)
router.get('/adminLogout',adminController.adminLogout)
router.get('/userManagement',adminAuth,adminController.userManagement)
router.get('/userBlock',adminController.userBlock)


router.get('/productManagement',adminAuth,productController.productManagement)
router.get('/productList',productController.productList)
router.get('/addProduct',adminAuth,productController.addProductGet)
router.post('/addProducts',adminAuth,upload.any(),productController.addProducts)
router.get('/editProduct',adminAuth,productController.editProduct)
router.post('/editProducts/:id',adminAuth,upload.any(),productController.editProducts)


router.get('/categoryManagement',adminAuth,categoryController.categoryManagement)
router.post('/addCategory',categoryController.addCategory)
router.get('/categoryList',categoryController.categoryList)
router.post('/editCategory',categoryController.editCategory)


module.exports=router