const userCollection = require('../model/userModel')
const categoryCollection = require('../model/categoryModel')
const AppError = require("../middleware/errorHandlingMiddleware.js")
const loginpage = async (req, res,next) => {
    try {
        if (req.session.admin) {
            res.render('adminPages/adminHome')
        } else {
            res.render('adminPages/adminLogin')
        }

    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }

}

const adminlogin = async (req, res,next) => {
    try {
        if (req.body.email == process.env.ADMINMAIL && req.body.password == process.env.ADMINPASS) {
            req.session.admin = true
            res.send({ success: true })
        } else {
            res.send({ invalidPass: true })
        }
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }

}

const adminLogout = async (req, res,next) => {
    try {
        req.session.admin = false
        res.redirect('/admin')
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }

}

const userManagement = async (req, res,next) => {
    try {
        let userDetail =  req.session.searchUser||await userCollection.find().sort({ _id: -1 })
        req.session.searchUser=null
        const usersPerPage = 10
        const totalPages = userDetail.length / usersPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * usersPerPage
        const end = start + usersPerPage
        userDetail = userDetail.slice(start, end)

        res.render('adminPages/userManagement', { userDet: userDetail, totalPages })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const userBlock = async (req, res,next) => {
    try {
        // let userBlock
        // if (req.query.action == 'unblock') {
        //     userBlock = false
        // } else {
        //     userBlock = true
        // }
        // await userCollection.updateOne({ _id: req.query.id }, { $set: { isBlocked: userBlock } })


        const user= await userCollection.findOne({_id: req.query.id})
        user.isBlocked= !user.isBlocked
        await user.save()
        res.send({ userStat: true })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}

const searchUser = async (req, res,next) => {
    try {
        const userDet = await userCollection.find({ name: { $regex: new RegExp(req.body.search, 'i') } });

  
        if (/^\s*$/.test(req.body.search)) {
            res.send({ noValue: true })
        }else if(userDet.length>0){
            req.session.searchUser=userDet
            res.send({userExists:true})
        }else{
            res.send({noUser:true })
        }
        // res.send({ userStat: userBlock })
    } catch (err) {
        next(new AppError('Sorry...Something went wrong', 500));
    }
}



module.exports = {
    loginpage, adminlogin, adminLogout, userManagement,
    userBlock, searchUser
}