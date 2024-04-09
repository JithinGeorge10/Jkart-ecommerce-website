const nodemailer=require('nodemailer')

const transpoter=  nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth:{
        user:process.env.MAILID,
        pass:process.env.MAILPASSWORD
    }
})

module.exports=transpoter