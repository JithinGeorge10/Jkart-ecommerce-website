const express = require('express')
const userController = require('../controller/userController')
const shopController = require('../controller/shopController')
const accountController = require('../controller/accountController')
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


router.get('/shop',shopController.shopPage)
router.get('/singleProduct',shopController.singleProduct)
router.post('/searchProducts',shopController.searchProducts)
router.get('/shop/filter/price',shopController.filterByPrice)
router.get('/shop/sort/name',shopController.shopSortName)


router.get('/account',userAuth,accountController.account)
router.post('/editProfile',userAuth,accountController.editProfile)
router.get('/addAddress',userAuth,accountController.addAddress)
router.post('/addAddressPost',userAuth,accountController.addAddressPost)




module.exports = router