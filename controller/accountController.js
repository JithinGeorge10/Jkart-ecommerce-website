
const { trusted } = require('mongoose');
const userCollection = require('../model/userModel')
const account = async (req, res) => {
    try {
        const userDet = await userCollection.findOne({ email: req.session.logged.email })
        res.render('userPages/accountProfile', { userLogged: req.session.logged, userDetails: userDet })
    } catch (err) {
        console.log(err);
    }
}

const editProfile = async (req, res) => {
    try {
        const userDet = await userCollection.find({ phone: req.body.phone })
        if (userDet.length > 0) {
            res.send({ exists: true })
        }
        await userCollection.updateOne({ email: req.session.logged.email }, { $set: { name: req.body.name, phone: req.body.phone } })
        res.send({ profileEdited: true })


    } catch (err) {

    }
}


module.exports = {
    account, editProfile
}