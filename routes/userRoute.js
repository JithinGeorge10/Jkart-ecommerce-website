const express = require('express')

const userController = require('../controller/userController')
const shopController = require('../controller/shopController')
const accountController = require('../controller/accountController')
const cartController = require('../controller/cartController')
const userAuth = require('../middleware/userAuth.js')
const userAuthFetch = require('../middleware/userAuthFetch.js')
const wishlistController=require('../controller/wishlistController')
const couponController=require('../controller/couponController')
const userCollection = require('../model/userModel')
const walletController=require('../controller/walletController')
const router = express.Router()
const passport=require('passport')

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
router.get('/newPassword', userController.forgotPasswordnewPassword)
router.post('/forgotPassword/updatePassword', userController.updatePassword)
router.get('/auth/google', passport.authenticate('google',{scope:['email','profile']}))
router.get('/google/callback', passport.authenticate('google',{failureRedirect:'/login'}),userController.googleCallback)    
router.get('/shop',shopController.shopPage)
router.get('/singleProduct',shopController.singleProduct)
router.post('/searchProducts',shopController.searchProducts)
router.get('/shop/filter/:by',shopController.filter)
router.get('/shop/sort',shopController.shopSort)
router.post('/clearFilter',shopController.clearFilter)



router.get('/account',userAuth,accountController.account)
router.post('/editProfile',userAuth,accountController.editProfile)
router.get('/addAddress',userAuth,accountController.addAddress)
router.post('/addAddressPost',userAuth,accountController.addAddressPost)
router.get('/myAddressGet',userAuth,accountController.myAddressget)
router.get('/addressDelete',userAuth,accountController.addressDelete)
router.get('/editAddressGet',userAuth,accountController.editAddressGet)
router.post('/editAddressPost',userAuth,accountController.editAddressPost)
router.get('/allOrders',userAuth,accountController.allOrders)
router.post('/user/cancelOrder',userAuth,accountController.cancelOrder)
router.post('/user/returnOrder',userAuth,accountController.returnOrder)
router.post('/setDefault',userAuth,accountController.setDefault)


router.post('/viewOrder',userAuth,accountController.viewOrder)
router.get('/allOrder/viewOrder',userAuth,accountController.accountViewOrder)


router.post('/addToCart',userAuthFetch,cartController.addToCart)
router.get('/cart',userAuth,cartController.cart)
router.put('/cart/qtyInc',userAuth,cartController.qtyInc)
router.put('/cart/qtyDec',userAuth,cartController.qtyDec)
router.post('/removeCart',userAuth,cartController.removeCart)
router.get('/cartCheckout',userAuth,cartController.cartCheckout)
router.get('/cartCheckout/address',userAuth,cartController.cartCheckoutAddress)
router.get('/cartCheckout/payment',userAuth,cartController.cartCheckoutPayment)
router.get('/cartCheckout/review',userAuth,cartController.cartCheckoutreview)
router.get('/orderSummary',userAuth,cartController.orderSummary)
router.get('/orderPlace',userAuth,cartController.orderPlace)
router.get('/orderPlaceComleted',userAuth,cartController.orderPlaceComleted)
// router.get('/onlinePayment',userAuth,cartController.onlinePayment)
router.get('/phonePay',userAuth,cartController.phonePay)


router.get('/wishlist',userAuth,wishlistController.wishlist)
router.post('/addToWishlist',userAuthFetch,wishlistController.addToWishlist)
router.delete('/removeWishlist',userAuthFetch,wishlistController.removeWishlist)
router.post('/wishlist/AddToCart',userAuthFetch,wishlistController.AddToCart)


router.post('/user/applyCoupon',userAuthFetch,couponController.applyCoupon)
router.post('/user/removeCoupon',userAuthFetch,couponController.removeCoupon)

router.get('/wallet',userAuth,walletController.wallet)

module.exports = router