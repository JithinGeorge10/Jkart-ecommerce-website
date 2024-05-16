const dashboardHelper = require("../helper/dashboardHelper");
const orderCollection = require('../model/ordersModel')
const productCollection = require('../model/productModel')
const dashboardData = async (req, res) => {
  try {
    const [
      productsCount,
      categoryCount,
      pendingOrdersCount,
      completedOrdersCount,
      currentDayRevenue,
      fourteenDaysRevenue,
      categoryWiseRevenue,
      TotalRevenue,
      MonthlyRevenue,
      Activeuser
    ] = await Promise.all([
      dashboardHelper.productsCount(),
      dashboardHelper.categoryCount(),
      dashboardHelper.pendingOrdersCount(),
      dashboardHelper.completedOrdersCount(),
      dashboardHelper.currentDayRevenue(),
      dashboardHelper.fourteenDaysRevenue(),
      dashboardHelper.categoryWiseRevenue(),
      dashboardHelper.Revenue(),
      dashboardHelper.MonthlyRevenue(),
      dashboardHelper.Activeuser()

    ]);

    const data = {
      productsCount,
      categoryCount,
      pendingOrdersCount,
      completedOrdersCount,
      currentDayRevenue,
      fourteenDaysRevenue,
      categoryWiseRevenue,
      TotalRevenue,
      MonthlyRevenue,
      Activeuser

    };

    res.json(data);
  } catch (error) {
    console.log(error);
  }
};


const topProduct = async (req, res) => {
  try {
    const topProducts = await orderCollection.aggregate([
      {
        $match: { orderStatus: 'Delivered' }
      },
      {
        $unwind: '$cartData'
      },
      {
        $group: {
          _id: '$cartData.productId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          count: 1,
          productName: '$product.productName',
          productPrice: '$product.offerPrice'
        }
      }
    ]);

 res.render('adminPages/topProducts',{topProducts})
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};


module.exports = {
  dashboardData, topProduct
}