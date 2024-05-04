const ProductModel = require("../model/productModel");
const ProductOfferModel = require("../model/productOfferModel");

const applyProductOffer = async () => {
    try {
        const today = Date.now();
  
        const offers = await ProductOfferModel.find().populate("productId");
  
        for (const offer of offers) {
            if (offer.productId.offerPrice === offer.productId.productPrice) {
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
        }
    } catch (error) {
        console.log(error);
    }
};


module.exports =  applyProductOffer ;