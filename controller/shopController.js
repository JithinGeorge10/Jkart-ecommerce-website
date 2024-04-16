const productCollection = require('../model/productModel')
const categoryCollection = require('../model/categoryModel')
const cartCollection = require('../model/cartModel')



const shopPage = async (req, res) => {
    try {
        console.log('productId' + req.query.id)
        const catProducts=await productCollection({parentCategory:req.query.id,isListed:true})
        console.log(catProducts)
        let productDet = req.session.productDetail || await productCollection.find({ isListed: true }) ||catProducts
        const categoryDetails = await categoryCollection.find({ isListed: true })
        const productsPerPage = 6
        const totalPages = productDet.length / productsPerPage
        const pageNo = req.query.pageNo || 1
        const start = (pageNo - 1) * productsPerPage
        const end = start + productsPerPage
        productDet = productDet.slice(start, end)


        res.render('userPages/shop', { userLogged: req.session.logged, productDet, categoryDetails, totalPages })
    } catch (err) {
        console.log(err);
    }
}

const singleProduct = async (req, res) => {
    try {
        let maxStock = 0
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
            req.session.productDetail = searchedProduct
            res.send({ searchProduct: true })
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
        let productDetail = req.session.productDetail || await productCollection.find({ isListed: true })
        let start = 0, end = Infinity
        if (req.params.by === 'byPrice') {

            switch (req.query.priceRange) {
                case '0': {
                    start = 0; end = 500
                    break
                }
                case '1': {
                    start = 500; end = 1000
                    break
                }
                case '2': {
                    start = 1000; end = 1500
                    break
                }
                case '3': {
                    start = 1500; end = Infinity
                    break
                }
            }
        } else {
            productDetail = await productCollection.find({ isListed: true, parentCategory: req.query.id })
        }

        productDetail = productDetail.filter((val) => {
            console.log(start, end)
            return val.productPrice > start && val.productPrice < end
        })

        req.session.productDetail = productDetail

        res.redirect('/shop')

    } catch (err) {
        console.log(err);
    }
}

const shopSort = async (req, res) => {
    try {
        let productDetail = req.session.productDetail || await productCollection.find({ isListed: true })
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