const productCollection = require('../model/productModel')
const categoryCollection = require('../model/categoryModel')
const cartCollection = require('../model/cartModel')
const wishlistCollection = require('../model/wishlistModel')
const { applyProductOffer, applyCategoryOffer } = require("../helper/offer");

const shopPage = async (req, res) => {
    try {


        const catProducts = await productCollection({ parentCategory: req.query.id, isListed: true, isDeleted: false })

        let productDet = req.session.productDetail || await productCollection.find({ isListed: true, isDeleted: false }) || catProducts

        const categoryDetails = await categoryCollection.find({ isListed: true })
        const productsPerPage = 6
        const totalPages = productDet.length / productsPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        productDet = productDet.slice(start, end)


        //wishlist if any users logged in
        if (req.session.logged) {
            const { _id } = req.session?.logged;
            let wishlistDet = await wishlistCollection.find({ userId: _id })
            let wishlistArr = []
            
            for (let i = 0; i < wishlistDet.length; i++) {
                wishlistArr.push(wishlistDet[i].productId.toString())
            }

            for (let i = 0; i < productDet.length; i++) {
                productDet[i].isWishlisted = wishlistArr.includes(productDet[i]._id.toString());
            }
        }


   
        res.render('userPages/shop', { userLogged: req.session.logged, productDet, categoryDetails, totalPages })
    } catch (err) {
        console.log(err);
    }
}

const singleProduct = async (req, res) => {
    try {
        let maxStock = 0
        let cartProduct = await cartCollection.findOne({ productId: req.query.id })
        const productDetails = await productCollection.findOne({ _id: req.query.id, isDeleted: false })

        const categoryDet = await categoryCollection.findOne({ _id: productDetails.parentCategory })
        const relatedProducts = await productCollection.find({ parentCategory: categoryDet._id, isDeleted: false })

        if (req.session.logged) {
            if (cartProduct) {
                maxStock = productDetails.productStock - cartProduct.productQuantity
            } else {
                maxStock = productDetails.productStock
            }
        } else {
            maxStock = productDetails.productStock
        }
        res.render('userPages/singleProduct', { userLogged: req.session.logged, maxStock, relatedProducts, productDet: productDetails, cartDet: req.session.cartProduct })
    } catch (err) {
        console.log(err);
    }
}

const searchProducts = async (req, res) => {
    try {
        let productDetail = req.session.productDetail || await productCollection.find({ isListed: true, isDeleted: false })
        const searchedProduct = await productCollection.find({
            productName: { $regex: req.body.searchElement, $options: 'i' }, isDeleted: false
        })
        
        if (searchedProduct.length > 0) {
            let filteredSearchResults = searchedProduct

            if (productDetail) {
                // Filter searched products based on existing filter
                filteredSearchResults = searchedProduct.filter(product => productDetail.some(filtered => filtered._id.toString() === product._id.toString()))
            }
            
            if (filteredSearchResults.length > 0) {
                productDetail = filteredSearchResults
                req.session.productDetail = productDetail
                res.send({ searchProduct: true })
            } else {
                res.send({ searchProduct: false })
            }
        } else {
            req.session.productDetail = null
            res.send({ searchProduct: false })
        }

    } catch (err) {
        console.log(err);
    }
}



const filter = async (req, res) => {
    try {
        let productDetail = req.session.productDetail || await productCollection.find({ isListed: true, isDeleted: false })
        let start = 0, end = Infinity
        if (req.params.by === 'byPrice') {

            switch (req.query.priceRange) {
                case '0': {
                    start = 0; end = 50
                    break
                }
                case '1': {
                    start = 50; end = 100
                    break
                }
                case '2': {
                    start = 100; end = 150
                    break
                }
                case '3': {
                    start = 150; end = Infinity
                    break
                }
            }
        } else {
            productDetail = await productCollection.find({ isListed: true, parentCategory: req.query.id, isDeleted: false })
        }

        productDetail = productDetail.filter((val) => {
           
            return val.offerPrice > start && val.offerPrice < end
        })

        req.session.productDetail = productDetail

        res.redirect('/shop')

    } catch (err) {
        console.log(err);
    }
}

const shopSort = async (req, res) => {
    try {
        let productDetail = req.session.productDetail || await productCollection.find({ isListed: true, isDeleted: false })
        switch (req.query.sortBy) {
            case 'priceAsc': {
                productDetail = productDetail.sort((a, b) => a.productPrice - b.productPrice)
                break;
            }
            case 'priceDes': {
                productDetail = productDetail.sort((a, b) => b.productPrice - a.productPrice)
                break;
            }
            case 'nameAsc': {
                productDetail = productDetail.sort((a, b) => a.productName.localeCompare(b.productName))
                break;
            }
            case 'nameDes': {
                productDetail = productDetail.sort((a, b) => b.productName.localeCompare(a.productName))
                break;
            }
            case 'newProduct': {
                productDetail = productDetail.sort((a, b) => b._id - a._id)
                break;
            }
        }
        req.session.productDetail = productDetail
        res.send({ success: true })
    } catch (err) {
        console.log(err)
    }
}

const clearFilter = async (req, res) => {
    try {
        req.session.productDetail = null
        res.send({ success: true })
    } catch (err) {
        console.log(err)
    }
}


module.exports = {
    shopPage, singleProduct, searchProducts, filter, shopSort, clearFilter
}