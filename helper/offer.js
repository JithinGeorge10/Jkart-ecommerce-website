const ProductModel = require("../model/productModel");
const ProductOfferModel = require("../model/productOfferModel");
const CategoryOfferModel = require("../model/categoryOfferModel");
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
                    await applyProductOfferToProduct(offer.productId, offer.productOfferPercentage);
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

        const productOffers = await ProductOfferModel.find({ currentStatus: true }).populate("productId");
        const categoryOffers = await CategoryOfferModel.find({ currentStatus: true });

        const allProducts = await ProductModel.find();

        for (const prod of allProducts) {
            const currentProductOffer = productOffers.find(offer => String(offer.productId._id) === String(prod._id));
            const currentCategoryOffer = categoryOffers.find(offer => String(offer.categoryId) === String(prod.parentCategory));

            let highestOfferPercentage = 0;

            if (currentProductOffer && currentProductOffer.startDate <= today && currentProductOffer.endDate >= today) {
                highestOfferPercentage = Math.max(highestOfferPercentage, currentProductOffer.productOfferPercentage);
            }

            if (currentCategoryOffer && currentCategoryOffer.startDate <= today && currentCategoryOffer.endDate >= today) {
                highestOfferPercentage = Math.max(highestOfferPercentage, currentCategoryOffer.productOfferPercentage);
            }

            if (highestOfferPercentage > 0) {
                await applyProductOfferToProduct(prod._id, highestOfferPercentage);
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

const applyProductOfferToProduct = async (productId, offerPercentage) => {
    const product = await ProductModel.findById(productId);
    const newOfferPrice = Math.floor(product.productPrice - (product.productPrice * offerPercentage) / 100);

    await ProductModel.findByIdAndUpdate(productId, {
        offerPrice: newOfferPrice,
    });
};

module.exports = { applyProductOffer, applyCategoryOffer };




