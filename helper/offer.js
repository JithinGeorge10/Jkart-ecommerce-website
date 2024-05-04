const ProductModel = require("../model/productModel");
const ProductOfferModel = require("../model/productOfferModel");


const applyProductOffer = async () => {
    try {
      const today = new Date();
  
      const offers = await ProductOfferModel.find().populate("productId");
      console.log(offers);
  
      offers.forEach(async (offer) => {
        if (offer.productId.offerPrice  === offer.productId.productPrice) {
          if (
            offer.startDate <= today &&
            offer.endDate >= today &&
            offer.currentStatus
          ) {
            await ProductModel.findByIdAndUpdate(offer.productId, {
              offerPrice: Math.floor(
                offer.productId.productPrice -
                  (offer.productId.productPrice * offer.productOfferPercentage) / 100
              ),
            });
          } else {
            await ProductModel.findByIdAndUpdate(offer.productId, {
              offerPrice: offer.productId.productPrice,
            });
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };


module.exports =  applyProductOffer ;