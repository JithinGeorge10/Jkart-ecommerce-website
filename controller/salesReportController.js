
const orderCollection = require('../model/ordersModel')
const puppeteer = require('puppeteer-core');

const salesReport = async (req, res) => {
    try {
        const salesDet = req.session.salesReport || await orderCollection
            .find({ paymentId: { $ne: null }, orderStatus: 'Delivered' })
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
const salesReportDownloadPDF = async (req, res) => {
    try {
        let startDate, endDate;

        if (req.body.startDate && req.body.endDate) {
            startDate = new Date(req.body.startDate);
            endDate = new Date(req.body.endDate);
        } else {
            startDate = new Date();
            startDate.setDate(startDate.getDate() - 7);
            endDate = new Date();
        }

        const salesData = await orderCollection.find({
            orderDate: { $gte: startDate, $lte: endDate },
            orderStatus: "Delivered"
        }).sort({_id:-1}) // Make sure to use .toArray() if you're using MongoDB

        const browser = await puppeteer.launch({
            // Specify the correct executablePath if needed
            // executablePath: '/path/to/your/chrome'
            channel: 'chrome'
        });

        const page = await browser.newPage();

        let htmlContent = `
            <h1 style="text-align: center;">Sales Report</h1>
            <table style="width:100%; border-collapse: collapse;" border="1">
              <tr>
                <th>Order Number</th>
                <th>Order Date</th>
                <th>Products</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>`;

        salesData.forEach((order) => {
            htmlContent += `
              <tr>
                <td>${order._id}</td>
                <td>${formatDate(order.orderDate)}</td>
                <td>${order.cartData.map((item) => item .productName).join(", ")}</td>
                <td>${order.cartData.map((item) => item.productQuantity).join(", ")}</td>
                <td>Rs.${order.grandTotalCost}</td>
                <td>${order.paymentType}</td>
                <td>${order.orderStatus}</td>
              </tr>`;
        });

        htmlContent += '</table>';

        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({ format: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=salesReport.pdf");
        res.send(pdfBuffer);

        await browser.close();
    } catch (error) {
        console.error("Error generating PDF:", error);
        res.status(500).send("Internal Server Error");
    }
};

const formatDate = (date) => {
    // Implement your date formatting function here
    return date.toISOString().split('T')[0]; // Example implementation
};


module.exports = {
    salesReport, salesReportFilter,salesReportDownloadPDF
}