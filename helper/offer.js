const ProductModel = require("../model/productModel");
const ProductOfferModel = require("../model/productOfferModel");
const CategoryOfferModel = require("../model/categoryOfferModel");
const applyProductOffer = async () => {
    try {
        const today = Date.now();

        const offers = await ProductOfferModel.find().populate("productId");
        console.log(offers);
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

const applyCategoryOffer = async () => {
    try {
        const today = new Date();

        const offers = await CategoryOfferModel.find({ currentStatus: true });
        console.log('offers123'+offers);
        const allProducts = await ProductModel.find();

        for (const prod of allProducts) {
            const currentOffer = offers.find(
                (offer) => String(offer.categoryId) === String(prod.parentCategory)
            );

            if (
                currentOffer &&
                currentOffer.startDate <= today &&
                currentOffer.endDate >= today
            ) {
                await ProductModel.findByIdAndUpdate(prod._id, {
                    offerPrice: Math.floor(
                        prod.productPrice - (prod.productPrice * currentOffer.productOfferPercentage) / 100
                    ),
                });
            } else {
                await ProductModel.findByIdAndUpdate(prod._id, {
                    offerPrice: prod.price,
                });
            }
        }
    } catch (error) {
        console.log(error);
    }
};



module.exports = { applyProductOffer, applyCategoryOffer };