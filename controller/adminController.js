const userCollection = require('../model/userModel')


const loginpage = async (req, res) => {
    try {
        if (req.session.admin) {
            res.render('adminPages/adminHome')
        } else {
            res.render('adminPages/adminLogin')
        }

    } catch (err) {
        console.log(err);
    }

}

const adminlogin = async (req, res) => {
    try {
        if (req.body.email == process.env.ADMINMAIL && req.body.password == process.env.ADMINPASS) {
            req.session.admin = true
            res.send({ success: true })
        } else {
            res.send({ invalidPass: true })
        }
    } catch (err) {
        console.log(err);
    }

}

const adminLogout = async (req, res) => {
    try {
        req.session.admin = false
        res.redirect('/admin')
    } catch (err) {
        console.log(err);
    }

}

const userManagement = async (req, res) => {
    try {
        const userDetail = await userCollection.find().sort({ _id: -1 })
        res.render('adminPages/userManagement', { userDet: userDetail })
    } catch (err) {
        console.log(err);
    }
}

const userBlock = async (req, res) => {
    try {
        let userBlock
        if (req.query.action == 'unblock') {
            userBlock = false
        } else {
            userBlock = true
        }
        await userCollection.updateOne({ _id: req.query.id }, { $set: { isBlocked: userBlock } })
        res.send({ userStat: userBlock })
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    loginpage, adminlogin, adminLogout, userManagement,
    userBlock
}