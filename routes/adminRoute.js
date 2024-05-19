const express=require('express')
const adminController = require('../controller/adminController')
const categoryController = require('../controller/categoryController')
const productController = require('../controller/productController')
const orderController=require('../controller/orderController')
const couponController=require('../controller/couponController')
const offerController=require('../controller/offerController')
const adminAuth = require('../middleware/adminAuth.js')
const salesReportController=require('../controller/salesReportController')
const dashboardController=require('../controller/dashboardController')
const returnController=require('../controller/returnController')
const router=express.Router()
const upload = require('../services/multer.js')


router.get('/admin',adminController.loginpage)
router.post('/adminlogin',adminController.adminlogin)
router.get('/adminLogout',adminController.adminLogout)
router.get('/userManagement',adminAuth,adminController.userManagement)
router.get('/userBlock',adminController.userBlock)
router.post('/searchUser',adminAuth,adminController.searchUser)

router.get('/productManagement',adminAuth,productController.productManagement)
router.get('/productList',productController.productList)
router.get('/addProduct',adminAuth,productController.addProductGet)
router.post('/addProducts',adminAuth,upload.any(),productController.addProducts)
router.get('/editProductGet',adminAuth,productController.editProduct)
router.post('/editProductsPost/:id',adminAuth,upload.any(),productController.editProducts)
router.post('/searchProduct',adminAuth,productController.searchProducts)
router.get('/deleteProduct',adminAuth,productController.deleteProduct)
router.post('/admin/editProduct/imageDelete',adminAuth,productController.imageDelete)

router.get('/categoryManagement',adminAuth,categoryController.categoryManagement)
router.post('/addCategory',adminAuth,categoryController.addCategory)
router.get('/categoryList',adminAuth,categoryController.categoryList)
router.post('/editCategory',adminAuth,categoryController.editCategory)
router.post('/searchCategory',adminAuth,categoryController.searchCategory)

router.get('/orderManagement',adminAuth,orderController.orderManagement)
router.post('/orderStatusChange',adminAuth,orderController.orderStatusChange)
router.post('/admin/viewOrder',adminAuth,orderController.adminViewOrder)
router.get('/orderView',adminAuth,orderController.orderView)
router.post('/searchOrder',adminAuth,orderController.searchOrder)
router.post('/cartStatusChange',adminAuth,orderController.cartStatusChange)


router.get('/couponManagement',adminAuth,couponController.couponManagement)
router.post('/admin/addCoupon',adminAuth,couponController.addCoupon)
router.get('/editCouponGet',adminAuth,couponController.editCouponGet)
router.post('/admin/editCoupon',adminAuth,couponController.adminEditCoupon)
router.delete('/deleteCoupon',adminAuth,couponController.deleteCoupon)


router.get('/productOfferManagement',adminAuth,offerController.productOfferManagement)
router.post('/addProductOffer',adminAuth,offerController.addProductOffer)
router.get('/editProductOfferGet',adminAuth,offerController.editProductOfferGet)
router.post('/admin/editProductOffer',adminAuth,offerController.editProductOffer)

router.get('/categoryOfferManagement',adminAuth,offerController.categoryOfferManagement)
router.post('/addCategoryOffer',adminAuth,offerController.addCategoryOffer)
router.get('/editCategoryOfferGet',adminAuth,offerController.editCategoryOfferGet)
router.post('/admin/editCategoryOffer',adminAuth,offerController.editCategoryOffer)

router.get('/returnManagement',adminAuth,returnController.returnManagement)



router.get('/salesReport',adminAuth,salesReportController.salesReport)
router.post('/admin/salesReport/filterCustom',adminAuth,salesReportController.salesReportFilterCustom)
router.get('/salesReport/download/pdf',adminAuth,salesReportController.salesReportDownloadPDF)
router.get('/admin/salesReport/download/xlsx',adminAuth,salesReportController.salesReportDownload)
router.get('/admin/salesReport/clearFilter',adminAuth,salesReportController.clearFilter)
router.post('/admin/salesReport/filter',adminAuth,salesReportController.salesReportFilter)


router.get('/dashboardData',adminAuth,dashboardController.dashboardData)
router.get('/topProducts',adminAuth,dashboardController.topProduct)
router.get('/topCategory',adminAuth,dashboardController.topCategory)
router.get('/topBrand',adminAuth,dashboardController.topSellingBrands)



module.exports=router

