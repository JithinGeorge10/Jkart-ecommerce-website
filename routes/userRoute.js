const express = require('express')
const userController = require('../controller/userController')
const shopController = require('../controller/shopController')
const accountController = require('../controller/accountController')
const cartController = require('../controller/cartController')
const userAuth = require('../middleware/userAuth.js')
const router = express.Router()


router.get('/', userController.landingPage)
router.get('/signUp', userController.signUp)
router.get('/login', userController.login)
router.get('/logout', userController.logout)
router.post('/saveUser', userController.saveUser)
router.post('/register', userController.register)
router.get('/sendotp', userController.otpPage)
router.post('/verifyOtp',userController.verifyOtp)
router.post('/resendOtp', userController.resendOtp)
router.post('/login', userController.userLogin)
router.get('/forgotPassword', userController.forgotPassword)
router.post('/forgotPassword/sendOtp', userController.forgotPasswordsendOtp)
router.get('/forgotPassword/verifyOtp', userController.forgotPasswordVerifyOtp)
router.post('/forgotPassword/verifyOtpPost', userController.forgotPasswordVerifyOtpPost)
router.post('/forgotPassword/resendOtp', userController.forgotPasswordresendOtp)



router.get('/shop',shopController.shopPage)
router.get('/singleProduct',shopController.singleProduct)
router.post('/searchProducts',shopController.searchProducts)
router.get('/shop/filter/price',shopController.filterByPrice)
router.get('/shop/sort/name',shopController.shopSortName)


router.get('/account',userAuth,accountController.account)
router.post('/editProfile',userAuth,accountController.editProfile)
router.get('/addAddress',userAuth,accountController.addAddress)
router.post('/addAddressPost',userAuth,accountController.addAddressPost)
router.get('/myAddressGet',userAuth,accountController.myAddressget)
router.get('/addressDelete',userAuth,accountController.addressDelete)
router.get('/editAddressGet',userAuth,accountController.editAddressGet)
router.post('/editAddressPost',userAuth,accountController.editAddressPost)


router.post('/addToCart',userAuth,cartController.addToCart)
router.get('/cart',userAuth,cartController.cart)
router.put('/cart/qtyInc',userAuth,cartController.qtyInc)
router.post('/removeCart',userAuth,cartController.removeCart)


module.exports = router