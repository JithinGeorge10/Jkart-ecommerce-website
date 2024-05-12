
const userCollection = require("../model/userModel");
const wallet = require("../model/walletModel");

module.exports = async (referralCode) => {
  try {
    let referralCodeExists = await userCollection.findOne({ referralCode });

    if (referralCodeExists) {
      await wallet.updateOne(
        { userId: referralCodeExists._id },
        {
          $inc: {
            walletBalance: 500,
          },
          $push: {
            walletTransaction: {
                transactionDate: Date.now(),
                transactionAmount: 500,
                transactionType: "Credit on referral code",
            },
          },
        }
      );
      console.log("Referral Applied");
    }
  } catch (error) {
    console.error(error);
  }
};
