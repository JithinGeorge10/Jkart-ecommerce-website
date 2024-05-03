
const walletCollection = require('../model/walletModel')
const wallet = async (req, res) => {
    try {
        const walletDet=await walletCollection.findOne({userId:req.session.logged._id})
      res.render('userPages/wallet',{userLogged:req.session.logged,walletDet})
    } catch (err) {
        console.log(err);
    }
}
module.exports = {
    wallet
}