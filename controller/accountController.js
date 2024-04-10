
const { trusted } = require('mongoose');
const userCollection = require('../model/userModel')
const addressCollection = require('../model/addressModel')
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
        const contactDet = await userCollection.find({ phone: req.body.phone })
        const userDet = await userCollection.findOne({ email: req.session.logged.email })
        if (contactDet.length > 0 && userDet.phone != req.body.phone) {
            res.send({ exists: true })
        }
        await userCollection.updateOne({ email: req.session.logged.email }, { $set: { name: req.body.name, phone: req.body.phone } })
        req.session.logged.name = req.body.name;
        res.send({ profileEdited: true })
    } catch (err) {
    }
}


const addAddress = async (req, res) => {
    try {
        res.render('userPages/addAddress', { userLogged: req.session.logged })
    } catch (err) {
        console.log(err);
    }
}

const addAddressPost = async (req, res) => {
    try {
        const userDet = await userCollection.findOne({ email: req.session.logged.email })
        console.log(userDet._id)
        const addAddress = new addressCollection({
            userId: userDet._id,
            username: req.body.name,
            address1: req.body.address1,
            address2: req.body.address2,
            addressTitle: req.body.title,
            phone: req.body.phone,
            alternatePhone: req.body.altphone,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode
        })

        await addAddress.save()
        res.send({ addressSaved: true })


        console.log(userDet)
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    account, editProfile, addAddress, addAddressPost
}