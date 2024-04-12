const userCollection = require('../model/userModel')
const otpCollection = require('../model/otpModel')
const productCollection = require('../model/productModel')
const sendotp = require('../helper/sendOtp')
const bcrypt = require('bcrypt')


const landingPage = async (req, res) => {
    try {

        const productDetails = await productCollection.aggregate([
            {
                $group: {
                    _id: '$parentCategory',
                    minPrice: { $min: '$productPrice' }
                }
            },
            {
                $lookup: {
                    from: 'categories',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' }, // Unwind the category array
            {
                $lookup: {
                    from: 'products',
                    let: { parentCategory: '$_id', minPrice: '$minPrice' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$parentCategory', '$$parentCategory'] },
                                        { $eq: ['$productPrice', '$$minPrice'] }
                                    ]
                                }
                            }
                        },
                        { $project: { productImage: 1, _id: 0, parentCategory: 1 } }
                    ],
                    as: 'product'
                }
            },
            { $unwind: '$product' }, // Unwind the product array
            {
                $project: {
                    categoryName: '$category.categoryName',
                    minPrice: 1,
                    productImage: '$product.productImage',
                    parentCategory: '$product.parentCategory'
                }
            }
        ])

        if (req.session.logged) {
            res.render('userPages/landingPage', { userLogged: req.session.logged, productDetails })
        } else {
            res.render('userPages/landingPage', { userLogged: null, productDetails })
        }
    } catch (err) {
        console.log(err);
    }

}

const signUp = (req, res) => {
    try {
        if (req.session.logged) {
            res.redirect('/')
        } else {
            res.render('userPages/signUp')
        }
    } catch (err) {
        console.log(err);
    }

}
const login = async (req, res) => {
    try {
        if (req.session.logged) {

            res.redirect('/')
        } else {
            res.render('userPages/login')
        }
    } catch (err) {
        console.log(err);
    }
}

const logout = (req, res) => {
    try {
        req.session.logged = null
        res.redirect('/')
    } catch (err) {
        console.log(err);
    }
}

const otpPage = (req, res) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else {
            res.render('userPages/verifyOtp')
        }

    } catch (err) {
        console.log(err);
    }
}

const register = async (req, res) => {
    try {

        const checkSignin = await userCollection.findOne({ $or: [{ email: req.body.email }, { phone: req.body.phone }] })

        if (checkSignin) {
            res.status(208).send({ userExists: true })
        } else {
            res.status(200).send({ userExists: false })
        }

    } catch (err) {
        console.log(err);
    }
}

const saveUser = async (req, res) => {
    try {

        const bycryptpassword = bcrypt.hashSync(req.body.password, 10)
        const newUser = new userCollection({
            name: req.body.name,
            email: req.body.email,
            password: bycryptpassword,
            phone: req.body.phone
        })
        await newUser.save()

        req.session.logged = await userCollection.findOne({ email: req.body.email })


        if (req.query.otp) {
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()

            await sendotp(req.session.logged, generatedOtp)
            const bycryptotp = bcrypt.hashSync(generatedOtp, 10)
            const userotp = new otpCollection({
                userId: req.session.logged._id,
                otp: bycryptotp,
                generatedDate: new Date().toISOString(),
                expiryDate: new Date(Date.now() + 60000).toISOString()
            })
            await userotp.save()
        }
        res.status(200).send({ userSaved: true })
    } catch (err) {
        console.log(err);
    }
}

const verifyOtp = async (req, res) => {

    try {
        const usersOTP = await otpCollection.findOne({ userId: req.session.logged._id })
        const otpmatch = await bcrypt.compare(req.body.otp, usersOTP.otp)
        const notExpired = usersOTP.expiryDate.toISOString() > new Date().toISOString()
        if (otpmatch && notExpired) {
            await userCollection.updateOne({ _id: req.session.logged._id }, { $set: { isVerified: true } })

            res.status(200).send({ otpverified: true })
        } else {
            res.status(200).send({ otpinvalid: true })
        }
    } catch (error) {
        console.log(error);
    }
}

const resendOtp = async (req, res) => {
    try {

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        await sendotp(req.session.logged, generatedOtp)
        const bycryptotp = bcrypt.hashSync(generatedOtp, 10)
        await otpCollection.updateOne({ userId: req.session.logged._id }, { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } })

        res.status(200).send({ otpsend: true })
    } catch (err) {
        console.log(err);
    }
}


const userLogin = async (req, res) => {
    try {
        const user = await userCollection.findOne({ email: req.body.email })
        if (user?.isBlocked) {
            req.session.logged = false
            res.send({ blocked: true })
        }
        if (user) {
            const passwordMatch = await bcrypt.compare(req.body.password, user.password)
            if (passwordMatch) {
                req.session.logged = user
                res.send({ login: true })
            } else {
                res.send({ invalid: true })
            }
        } else {
            res.send({ invalid: true })
        }
    } catch (err) {
        console.log(err);
    }
}



const forgotPassword = (req, res) => {
    try {
        res.render('userPages/forgotPassword')
    } catch (err) {
        console.log(err);
    }

}

const forgotPasswordsendOtp = async (req, res) => {
    try {
        const userDet = await userCollection.findOne({ email: req.body.email })
        if (userDet.length < 1) {
            res.send({ emailExists: true })
        } else {
            req.session.forgotPasswordId = userDet._id
            console.log(req.session.forgotPasswordId)
            console.log('success')
            res.send({ success: true })
        }
    } catch (err) {
        console.log(err);
    }
}

const forgotPasswordVerifyOtp = async (req, res) => {
    try {
        console.log('forgotPasswordVerifyOtp'+req.session.forgotPasswordId)
        const user = await userCollection.findOne({ _id: req.session.forgotPasswordId })
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        await sendotp(user, generatedOtp)
        const bycryptotp = bcrypt.hashSync(generatedOtp, 10)
        await otpCollection.updateOne({ userId: req.session.forgotPasswordId },
            { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } }, { $upsert: true })
        res.render('userPages/forgotPasswordVerifyOtp')
    } catch (err) {
        console.log(err);
    }

}
const forgotPasswordVerifyOtpPost = async (req, res) => {
    try {
        console.log(req.body.otp)
        console.log('forgotPasswordVerifyOtpPost')
        const otpDet = await otpCollection.findOne({ userId: req.session.forgotPasswordId })
        const userDet = await userCollection.findOne({ _id: req.session.forgotPasswordId })
        const otpmatch = await bcrypt.compare(req.body.otp, otpDet.otp)
        const notExpired = otpDet.expiryDate.toISOString() > new Date().toISOString()
        if (otpmatch && notExpired) {
            req.session.logged = userDet
            res.status(200).send({ otpverified: true })
        }else{
            res.status(200).send({ otpinvalid: true })
        }

    } catch (err) {
        console.log(err);
    }
}

module.exports = {
    landingPage, signUp, login, register, saveUser, logout, otpPage, verifyOtp, resendOtp, userLogin, forgotPassword,
    forgotPasswordsendOtp, forgotPasswordVerifyOtp, forgotPasswordVerifyOtpPost
}