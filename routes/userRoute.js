const express = require('express')
const userController = require('../controller/userController')
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
router.get('/shop',userController.shopPage)
router.get('/singleProduct',userController.singleProduct)



module.exports = router