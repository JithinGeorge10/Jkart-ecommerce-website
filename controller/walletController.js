
const walletCollection = require('../model/walletModel')
const wallet = async (req, res) => {
    try {
        let walletBal=await walletCollection.findOne({ userId: req.session.logged._id })
        let walletDet = await walletCollection.findOne({ userId: req.session.logged._id })
    
        const walletPerPage = 15
        const totalPages = walletDet.walletTransaction.length / walletPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * walletPerPage
        const end = start + walletPerPage
        walletDet = walletDet.walletTransaction.slice(start, end)
        
        res.render('userPages/wallet', { userLogged: req.session.logged, walletDet,totalPages ,walletBal})
    } catch (err) {
        console.log(err);
    }
}
module.exports = {
    wallet
}