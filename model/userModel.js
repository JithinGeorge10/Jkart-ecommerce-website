const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    name:{
        required:true,
        type:String
    },
    email:{
        required:true,
        type:String
    },
    password:{
        required:true,
        type:String
    },
    phone:{
        required:true,
        type:Number
    },
    isBlocked:{
        required:true,
        type:Boolean,
        default:false
    },
    referralCode:{
        required:false,
        type:String,
    },
    referralUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    isVerified:{
        required:true,
        type:Boolean,
        default:false,
    }
})
const users=mongoose.model('users',userSchema)
module.exports=users