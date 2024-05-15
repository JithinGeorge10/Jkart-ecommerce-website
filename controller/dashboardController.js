const dashboardHelper = require("../helper/dashboardHelper");

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
        Activeuser,
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
        dashboardHelper.Activeuser(),
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
        Activeuser,
      };
  
      res.json(data);
    } catch (error) {
      console.log(error);
    }
  };
  

  module.exports = {
    dashboardData
}