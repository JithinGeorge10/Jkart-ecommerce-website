const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema({
    couponCode: { type: String, required: true },
    isListed:{default:true,required:true,type:Boolean},
    couponAmount: {
        type: Number,
        required: true
    },
    startDate: { type: Date, required: true, default: new Date().toLocaleString() },
    expiryDate: { type: Date, required: true },
    minimumPurchase: { type: Number, required: true },
    status: {
        type: String,
        default: 'available'
    }, usedUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
            ref: "user",
        },
    ]
}
)

module.exports = mongoose.model('coupon', couponSchema)