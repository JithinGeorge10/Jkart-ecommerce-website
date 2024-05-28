const userCollection = require('../model/userModel')
const otpCollection = require('../model/otpModel')
const productCollection = require('../model/productModel')
const walletCollection = require('../model/walletModel');
const sendotp = require('../helper/sendOtp')
const bcrypt = require('bcrypt')
const applyReferralOffer = require("../helper/referralOffer.js");
const AppError = require("../middleware/errorHandlingMiddleware.js")


const landingPage = async (req, res,next) => {
    try {
      const productDetails = await productCollection.aggregate([
        {
          $match: {
            isDeleted: false,
            isListed: true
          }
        },
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
              { $limit: 1 }, // Limit the results to one document
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
      ]);
  
      if (req.session.logged) {
        res.render('userPages/landingPage', { userLogged: req.session.logged, productDetails });
      } else {
        res.render('userPages/landingPage', { userLogged: null, productDetails });
      }
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
  };

const signUp = (req, res,next) => {
    try {
        const referral = req.query.referral
        if (req.session.logged) {
            res.redirect('/')
        } else {
            res.render('userPages/signUp',{referral})
        }
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }

}
const login = async (req, res,next) => {
    try {
        if (req.session.logged) {

            res.redirect('/')
        } else {
            res.render('userPages/login')
        }
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const logout = (req, res,next) => {
    try {
        req.session.logged = null
        req.session.grandTotal = null
        res.redirect('/')
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const otpPage = (req, res,next) => {
    try {
        if (req.session.user) {
            res.redirect('/')
        } else {
            res.render('userPages/verifyOtp')
        }

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const register = async (req, res,next) => {
    try {
       
        const { email, phone } = req.body;
        const checkSignin = await userCollection.findOne({ $or: [{ email }, { phone }] });
        
        if (checkSignin) {
            res.status(208).send({ userExists: true })
        } else {
            req.session.tempUserReferralCode = req.body?.referralCode;
            res.status(200).send({ userExists: false })
        }

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const saveUser = async (req, res,next) => {
    try {
        let referralCode= Math.floor(1000 + Math.random() * 9000);
        req.session.referralCode = referralCode;
        const bycryptpassword = bcrypt.hashSync(req.body.password, 10)
        const newUser = new userCollection({
            name: req.body.name,
            email: req.body.email,
            password: bycryptpassword,
            phone: req.body.phone,
            referralCode
        })
        await newUser.save()

        req.session.logged = await userCollection.findOne({ email: req.body.email })

        const newWallet = new walletCollection({
           userId: req.session.logged._id,
           walletBalance:0,
           walletTransaction:[]
        })
        await newWallet.save()

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
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const verifyOtp = async (req, res,next) => {

    try {
        const usersOTP = await otpCollection.findOne({ userId: req.session.logged._id })
        const otpmatch = await bcrypt.compare(req.body.otp, usersOTP.otp)
        const notExpired = usersOTP.expiryDate.toISOString() > new Date().toISOString()
        if (otpmatch && notExpired) {
            let tempUserReferralCode = req.session?.tempUserReferralCode;
            if (tempUserReferralCode) {
              await applyReferralOffer(tempUserReferralCode);
            }
            await userCollection.updateOne({ _id: req.session.logged._id }, { $set: { isVerified: true } })
            
            res.status(200).send({ otpverified: true })
        } else {
            res.status(200).send({ otpinvalid: true })
        }
    } catch (error) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const resendOtp = async (req, res,next) => {
    try {

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        await sendotp(req.session.logged, generatedOtp)
        const bycryptotp = bcrypt.hashSync(generatedOtp, 10)
        await otpCollection.updateOne({ userId: req.session.logged._id }, { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } })

        res.status(200).send({ otpsend: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}


const userLogin = async (req, res,next) => {
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
        next(new AppError('Sorry...Something went wrong', 500));
    }
}



const forgotPassword = (req, res,next) => {
    try {
        res.render('userPages/forgotPassword')
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }

}

const forgotPasswordsendOtp = async (req, res,next) => {
    try {
        const userDet = await userCollection.findOne({ email: req.body.email })
     
        if (userDet) {
            req.session.forgotPasswordId = userDet._id
           
            res.send({ success: true })
        } else {
            res.send({ emailExists: true })
        }
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const forgotPasswordVerifyOtp = async (req, res,next) => {
    try {
      
        const user = await userCollection.findOne({ _id: req.session.forgotPasswordId })
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        await sendotp(user, generatedOtp)
        const bycryptotp = bcrypt.hashSync(generatedOtp, 10)
        await otpCollection.updateOne({ userId: req.session.forgotPasswordId },
            { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } }, { $upsert: true })
        res.render('userPages/forgotPasswordVerifyOtp')
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}
const forgotPasswordVerifyOtpPost = async (req, res,next) => {
    try {
        const otpDet = await otpCollection.findOne({ userId: req.session.forgotPasswordId })
        const userDet = await userCollection.findOne({ _id: req.session.forgotPasswordId })
        const otpmatch = await bcrypt.compare(req.body.otp, otpDet.otp)
        const notExpired = otpDet.expiryDate.toISOString() > new Date().toISOString()
        if (otpmatch && notExpired) {
            req.session.logged = userDet
            res.status(200).send({ otpverified: true })
        } else {
            res.status(200).send({ otpinvalid: true })
        }

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const forgotPasswordresendOtp = async (req, res,next) => {
    try {
      
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString()
        const user = await userCollection.findOne({ _id: req.session.forgotPasswordId })
        await sendotp(user, generatedOtp)
        const bycryptotp = bcrypt.hashSync(generatedOtp, 10)
        await otpCollection.updateOne({ userId: req.session.forgotPasswordId }, { $set: { otp: bycryptotp, generatedDate: new Date().toISOString(), expiryDate: new Date(Date.now() + 60000).toISOString() } })

        res.status(200).send({ otpsend: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}


const forgotPasswordnewPassword = async (req, res,next) => {
    try {
       res.render('userPages/newPassword')
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}


const updatePassword = async (req, res,next) => {
    try {

       const bycryptpassword = bcrypt.hashSync(req.body.password, 10)
      
       await userCollection.updateOne({_id:req.session.forgotPasswordId},{$set:{password:bycryptpassword}})
       res.send({success:true})
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}


const googleCallback=async (req, res) => {
    try {
      // Add the user's name to the database
      let referralCode= Math.floor(1000 + Math.random() * 9000);
      req.session.referralCode = referralCode;
      const user = await userCollection.findOneAndUpdate(
        { email: req.user.email},
        { $set: { name: req.user.displayName,referralCode:referralCode  } },
        { upsert: true,new :true }
      );
  
  
      // Set the user session
        req.session.logged = user
      // Redirect to the homepage
      res.redirect('/');
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  } 

module.exports = {
    landingPage, signUp, login, register, saveUser, logout, otpPage, verifyOtp, resendOtp, userLogin, forgotPassword,
    forgotPasswordsendOtp, forgotPasswordVerifyOtp, forgotPasswordVerifyOtpPost,
    forgotPasswordresendOtp,forgotPasswordnewPassword,updatePassword,googleCallback
}