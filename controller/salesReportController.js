
const orderCollection = require('../model/ordersModel')
const salesReport = async (req, res) => {
    try {
        const salesDet = req.session.salesReport || await orderCollection
            .find({ paymentId: { $exists: true }, orderStatus: 'Delivered' })
            .sort({ _id: -1 })
            .populate({
                path: 'userId',
                select: 'name email' // Select fields from the 'users' collection
            })
            .populate({
                path: 'cartData.productId',
                model: 'products', // Model name of the Product collection
                select: 'productName' // Select the 'name' field from the 'Product' collection
            })
            .exec();
        let salesDetails = salesDet.filter((val) => {
            return val.userId != null
        })
        const productsPerPage = 10
        const totalPages = salesDetails.length / productsPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        salesDetails = salesDetails.slice(start, end)
        res.render('adminPages/salesReport', { salesDetails, totalPages })
    } catch (err) {
        console.log(err);
    }
}

const salesReportFilter = async (req, res) => {
    try {
     
        const salesReport = await orderCollection.find({
            orderDate: { $gte: req.body.fromDate, $lte: req.body.toDate }, paymentId: { $exists: true }, orderStatus: 'Delivered'
        }).sort({ _id: -1 })
            .populate({
                path: 'userId',
                select: 'name email' // Select fields from the 'users' collection
            })
            .populate({
                path: 'cartData.productId',
                model: 'products', // Model name of the Product collection
                select: 'productName' // Select the 'name' field from the 'Product' collection
            })
            .exec();
        console.log('ssalesddfgdfgdfg' + salesReport)
        req.session.salesReport = salesReport
        res.send({ success: true })
       
        
    } catch (err) {
        console.log(err);
    }
}



module.exports = {
    salesReport, salesReportFilter
}