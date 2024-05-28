
const orderCollection = require('../model/ordersModel')
const dateFormat = require("../services/formatDateHelper.js");
const puppeteer = require('puppeteer-core');
const exceljs = require("exceljs");

const salesReport = async (req, res) => {
    try {

        const salesDet = req.session.admin.salesDetails || await orderCollection
            .find({ paymentId: { $ne: null }, orderStatus: 'Delivered' })
            .sort({ _id: -1 })
            .populate({
                path: 'userId',
                select: 'name email' // Select fields from the 'users' collection
            })
            .populate({
                path: 'cartData.productId',
                model: 'products', // Model name of the Product collection
                select: 'productName productPrice offerPrice' // Select the 'name' field from the 'Product' collection
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
        res.render('adminPages/salesReport', { salesDetails, totalPages, dateValues: req.session.admin.dateValues })
    } catch (err) {
        console.log(err);
    }
}

const salesReportDownloadPDF = async (req, res) => {
    try {
        let startDate, endDate;


        if (req.query.startDate && req.query.endDate) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
        } else {
            startDate = new Date(0); // Start date set to the beginning of Unix time
            endDate = new Date();   // End date set to the current date
        }
        endDate.setHours(23, 59, 59, 999);

        const salesData = await orderCollection.find({
            orderDate: { $gte: startDate, $lte: endDate },
            orderStatus: "Delivered", paymentId: { $ne: null }
        }).sort({ _id: -1 }).populate('userId') // Make sure to use .toArray() if you're using MongoDB


        const browser = await puppeteer.launch({
            // Specify the correct executablePath if needed
            executablePath: '/home/ubuntu/.cache/puppeteer/chrome/linux-125.0.6422.60/chrome-linux64/chrome',
            channel: 'chrome'
        });

        const page = await browser.newPage();

        let htmlContent = `
            <h1 style="text-align: center;">Sales Report</h1>
            <table style="width:100%; border-collapse: collapse;" border="1">
              <tr>
                <th>Order Number</th>
                <th>Name</th>
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
                <td>${order.userId.name}</td>
                <td>${formatDate(order.orderDate)}</td>
                <td>${order.cartData.map((item) => item.productName).join(", ")}</td>
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

const salesReportDownload = async (req, res) => {
    try {


        const workBook = new exceljs.Workbook();
        const sheet = workBook.addWorksheet("book");
        sheet.columns = [
            { header: "Order No", key: "no", width: 25 },
            { header: "Name", key: "username", width: 25 },
            { header: "Order Date", key: "orderDate", width: 25 },
            { header: "Products", key: "products", width: 35 },
            { header: "No of items", key: "noOfItems", width: 35 },
            { header: "Price before offer in dollars", key: "beforeOffer", width: 35 },
            { header: "Total Cost after Offer(if applied)", key: "totalCost", width: 25 },
            { header: "Payment Method", key: "paymentMethod", width: 25 },
            { header: "Status", key: "status", width: 20 },
        ];

        let startDate, endDate;


        if (req.query.startDate && req.query.endDate) {
            startDate = new Date(req.query.startDate);
            endDate = new Date(req.query.endDate);
        } else {
            startDate = new Date(0); // Start date set to the beginning of Unix time
            endDate = new Date();   // End date set to the current date
        }
        endDate.setHours(23, 59, 59, 999);

        const salesData = await orderCollection.find({
            orderDate: { $gte: startDate, $lte: endDate },
            orderStatus: "Delivered", paymentId: { $ne: null }
        }).sort({ _id: -1 }).populate({
            path: 'userId',
            select: 'name email' // Select fields from the 'users' collection
        }).populate({
            path: 'cartData.productId',
            model: 'products', // Model name of the Product collection
            select: 'productName productPrice offerPrice' // Select the 'name' field from the 'Product' collection
        })
            .exec(); // Make sure to use .toArray() if you're using MongoDB

console.log(salesData)

        salesData.forEach((v) => {
            sheet.addRow({
                no: v._id,
                username: v.userId.name,
                orderDate: v.orderDate,
                products: v.cartData.map((v) => v.productName).join(", "),
                noOfItems: v.cartData.map((v) => v.productQuantity).join(", "),
                beforeOffer: v.cartData.map((v) => v.productId.productPrice).join(", "),
                totalCost: "$" + v.grandTotalCost,
                paymentMethod: v.paymentType,
                status: v.orderStatus,
            });
        });

        const totalOrders = salesData.length;
        const totalSales = salesData.reduce(
            (total, sale) => total + sale.grandTotalCost,
            0
        );
        const totalDiscount = salesData.reduce((total, sale) => {
            let discountAmount = sale.cartData.reduce((discount, cartItem) => {
                let productPrice = cartItem.productId.productPrice;
                let priceBeforeOffer = cartItem.productId.priceBeforeOffer;
                let discountPercentage = cartItem.productId.productOfferPercentage || 0;
                let actualAmount = productPrice * cartItem.productQuantity;
                let paidAmount =
                    actualAmount - (actualAmount * discountPercentage) / 100;
                return discount + (actualAmount - paidAmount);
            }, 0);
            return total + discountAmount;
        }, 0);

        sheet.addRow({});
        sheet.addRow({ "Total Orders": totalOrders });
        sheet.addRow({ "Total Sales": "₹" + totalSales });
        sheet.addRow({ "Total Discount": "₹" + totalDiscount });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            "attachment; filename=salesReport.xlsx"
        );

        await workBook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.log(error);
        res.status(500).send("Error generating sales report");
    }
};

const salesReportFilterCustom = async (req, res) => {
    try {

        const startOfDay = (date) => {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
        };

        const endOfDay = (date) => {
            return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
        };


        let { startDate, endDate } = req.body;

        startDate = startOfDay(new Date(startDate));
        endDate = endOfDay(new Date(endDate));


        let salesDataFiltered = await orderCollection
            .find({
                orderStatus: 'Delivered', paymentId: { $ne: null },
                orderDate: { $gte: startDate, $lte: endDate },
                orderStatus: "Delivered",
            }).sort({ _id: -1 })
            .populate({
                path: 'userId',
                select: 'name email' // Select fields from the 'users' collection
            })
            .populate({
                path: 'cartData.productId',
                model: 'products', // Model name of the Product collection
                select: 'productName productPrice offerPrice' // Select the 'name' field from the 'Product' collection
            })


        salesData = salesDataFiltered.map((v) => {
            v.orderDateFormatted = dateFormat(v.orderDate);
            return v;
        });

        req.session.admin = {};
        req.session.admin.dateValues = req.body;
        req.session.admin.salesDetails = JSON.parse(JSON.stringify(salesData));



        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
    }
};


const clearFilter = async (req, res) => {
    try {
        req.session.admin.salesDetails = null
        req.session.admin.dateValues = null

        res.redirect('/salesReport')
    } catch (error) {
        console.error(error);
    }
};


const salesReportFilter = async (req, res) => {
    try {
        let { filterOption } = req.body;
        let startDate, endDate;

        if (filterOption === "month") {
            startDate = new Date();
            startDate.setDate(1);
            endDate = new Date();
            endDate.setMonth(endDate.getMonth() + 1, 0);
        } else if (filterOption === "week") {
            let currentDate = new Date();
            let currentDay = currentDate.getDay();
            let diff = currentDate.getDate() - currentDay - 7;
            startDate = new Date(currentDate.setDate(diff));
            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);
        } else if (filterOption === "year") {
            let currentYear = new Date().getFullYear();
            startDate = new Date(currentYear, 0, 1);
            endDate = new Date(currentYear, 11, 31);
        }

        let salesDataFiltered = await orderCollection
            .find({
                orderStatus: 'Delivered', paymentId: { $ne: null },
                orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) },
                orderStatus: "Delivered",
            }).sort({ _id: -1 })
            .populate({
                path: 'userId',
                select: 'name email' // Select fields from the 'users' collection
            })
            .populate({
                path: 'cartData.productId',
                model: 'products', // Model name of the Product collection
                select: 'productName productPrice offerPrice' // Select the 'name' field from the 'Product' collection
            })

        req.session.admin = {};
        req.session.admin.dateValues = { startDate, endDate };
        req.session.admin.salesDetails = JSON.parse(JSON.stringify(salesDataFiltered));

        res.status(200).json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: "Internal server error" });
    }
};


module.exports = {
    salesReport, salesReportDownloadPDF, salesReportDownload, salesReportFilterCustom, clearFilter, salesReportFilter
}