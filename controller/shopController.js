const productCollection = require('../model/productModel')
const categoryCollection = require('../model/categoryModel')
const cartCollection = require('../model/cartModel')



const shopPage = async (req, res) => {
    try {
        // pagination
        let query = { isListed: true };
        let limit = 6
        let pageNo = req.query.pageId
        let skip = (pageNo - 1) * limit
        let paginationProducts = await productCollection.find({ isListed: true }).skip(skip).limit(limit)
        let productIds = paginationProducts.map(product => product._id)
        query._id = { $in: productIds }
        let totalPages = Math.ceil(await productCollection.countDocuments() / limit)
        /////////////////////////////////
        const categoryDetails = await categoryCollection.find({ isListed: true })

        if (req.query.searchId) {
            query.productName = { $regex: req.query.searchId, $options: 'i' };
        } else if (req.query.id) {
            query.parentCategory = req.query.id;
        } else if (req.session.startPrice == 0) {
            query.productPrice = { $gte: 0, $lte: req.session.endPrice }
        } else if (req.session.startPrice && req.session.startPrice) {
            query.productPrice = { $gte: req.session.startPrice, $lte: req.session.endPrice }
        }
        //////////////////////////////////
        const { nameSort } = req.session
        const { priceAsc } = req.session
        const { priceDes } = req.session
        const { prodNew } = req.session
        req.session.nameSort = null
        req.session.priceAsc = null
        req.session.priceDes = null
        req.session.startPrice = null
        req.session.endPrice = null
        req.session.prodNew = null
        const productDetails = await productCollection.find(query);
        res.render('userPages/shop', { userLogged: req.session.logged, productDet: prodNew || priceDes || priceAsc || nameSort || productDetails, categoryDetails, totalPages });
    } catch (err) {
        console.log(err);
    }
}

const singleProduct = async (req, res) => {
    try {
        let maxStock=0
        let cartProduct = await cartCollection.findOne({ productId: req.query.id })
        const productDetails = await productCollection.findOne({ _id: req.query.id })
        const categoryDetails = await categoryCollection.findOne({ _id: req.query.id })
        if (req.session.logged) {
            if (cartProduct) {
                 maxStock = productDetails.productStock - cartProduct.productQuantity
            } else {
                 maxStock = productDetails.productStock 
            }
        } else {
             maxStock = productDetails.productStock 
        }
        res.render('userPages/singleProduct', { userLogged: req.session.logged, maxStock, productDet: productDetails, categoryDet: categoryDetails, cartDet: req.session.cartProduct })
    } catch (err) {
        console.log(err);
    }
}

const searchProducts = async (req, res) => {
    try {
        const searchedProduct = await productCollection.find({
            productName: { $regex: req.body.searchElement, $options: 'i' }
        })
        if (searchedProduct.length > 0) {

            res.send({ searchProduct: true })
        } else {
            res.send({ searchProduct: false })
        }
    } catch (err) {
        console.log(err);
    }
}

const filterByPrice = async (req, res) => {
    try {
        let startPrice, endPrice
        if (req.query.priceRange == 0) {
            startPrice = 0
            endPrice = 499
        } else if (req.query.priceRange == 1) {
            startPrice = 500
            endPrice = 1000
        } else if (req.query.priceRange == 2) {
            startPrice = 1000
            endPrice = 1500
        } else if (req.query.priceRange == 3) {
            startPrice = 1500
            endPrice = 100000
        }
        req.session.startPrice = startPrice
        req.session.endPrice = endPrice
        res.redirect('/shop')

    } catch (err) {
        console.log(err);
    }
}

const shopSortName = async (req, res) => {
    try {
        if (req.query.sortId == 1) {
            const sortedProducts = await productCollection.find().sort({ productName: 1 })
            req.session.nameSort = sortedProducts
            res.send({ nameSort: true })
        } else if (req.query.sortId == 2) {
            const sortedProductsAsc = await productCollection.find().sort({ productPrice: 1 })
            req.session.priceAsc = sortedProductsAsc
            res.send({ priceAsc: true })
        } else if (req.query.sortId == 3) {
            const sortedProductsDes = await productCollection.find().sort({ productPrice: -1 })
            req.session.priceDes = sortedProductsDes
            res.send({ priceDes: true })
        } else if (req.query.sortId == 4) {
            const sortedNewest = await productCollection.find().sort({ _id: -1 })
            req.session.prodNew = sortedNewest
            res.send({ prodNew: true })
        }
    } catch (err) {
        console.log(err)
    }
}


module.exports = {
    shopPage, singleProduct, searchProducts, filterByPrice, shopSortName
}