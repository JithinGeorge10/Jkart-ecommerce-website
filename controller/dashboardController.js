const dashboardHelper = require("../helper/dashboardHelper");
const orderCollection = require('../model/ordersModel')
const productCollection = require('../model/productModel')
const AppError = require("../middleware/errorHandlingMiddleware.js")
const dashboardData = async (req, res,next) => {
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
    next(new AppError('Sorry...Something went wrong', 500));
  }
};


const topProduct = async (req, res,next) => {
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

    res.render('adminPages/topProducts', { topProducts })
  } catch (err) {
    next(new AppError('Sorry...Something went wrong', 500));
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};




const topCategory = async (req, res,next) => {
  try {
    const topCategories = await orderCollection.aggregate([
      {
        $match: { orderStatus: 'Delivered' }
      },
      {
        $unwind: '$cartData'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'cartData.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.parentCategory',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: '$category'
      },
      {
        $group: {
          _id: '$category.categoryName',
          quantity: { $sum: 1 }
        }
      },
      {
        $sort: { quantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.render('adminPages/topCategory', { topCategories });
  } catch (err) {
    // Consider using a centralized error handler
    next(new AppError('Sorry...Something went wrong', 500));
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};





const topSellingBrands = async (req, res,next) => {
  try {
    const topBrands = await orderCollection.aggregate([
      {
        $match: { orderStatus: 'Delivered' }
      },
      {
        $unwind: '$cartData'
      },
      {
        $lookup: {
          from: 'products',
          localField: 'cartData.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      {
        $unwind: '$product'
      },
      {
        $addFields: {
          brand: { $arrayElemAt: [{ $split: ['$product.productName', ' '] }, 0] }
        }
      },
      {
        $group: {
          _id: '$brand',
          quantity: { $sum: 1 }
        }
      },
      {
        $sort: { quantity: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.render('adminPages/topBrand', { topBrands });
  } catch (err) {
    // Consider using a centralized error handler
    next(new AppError('Sorry...Something went wrong', 500));
    res.status(500).send({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  dashboardData, topProduct,topCategory,topSellingBrands
}