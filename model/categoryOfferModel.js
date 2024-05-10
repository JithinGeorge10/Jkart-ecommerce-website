const mongoose= require('mongoose')

const categoryOfferSchema= new mongoose.Schema({
    categoryId: { type: mongoose.Types.ObjectId, required: true, ref:'category' },
    categoryName: { type: String, required: true},
    productOfferPercentage: { type: Number, min: 5, max: 90, required: true},
    startDate: { type: Date, required: true, default: new Date().toLocaleString() },
    endDate: { type: Date, required: true },
    currentStatus: { type: Boolean, required: false, default: true }
},{ timestamps: true})

module.exports=mongoose.model('categoryOffer',categoryOfferSchema)