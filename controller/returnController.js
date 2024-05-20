const orderCollection = require('../model/ordersModel');

const returnManagement = async (req, res) => {
    try {
        let orderDet = req.session.searchOrder || await orderCollection.find({
            paymentId: { $ne: null },
            $or: [
                { orderStatus: 'Request Return' }, // Orders with 'Return Request' status
                { cartData: { $elemMatch: { status: 'Request Return' } } } // Orders with any product having 'Return Request' status
            ]
        }).populate('userId').sort({ _id: -1 });

        const ordersPerPage = 10;
        const totalPages = Math.ceil(orderDet.length / ordersPerPage);
        const pageNo = req.query.pageNo || 1;
        const start = (pageNo - 1) * ordersPerPage;
        const end = start + ordersPerPage;
        orderDet = orderDet.slice(start, end);

        res.render('adminPages/returnManagement', { orderDet, totalPages });
    } catch (err) {
        console.log(err);
    }
};

module.exports = {
    returnManagement
};
