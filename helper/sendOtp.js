
const transpoter = require('../services/sendOTP')

let sendotp = async (user,otp) => {
    try {
        await transpoter.sendMail({
            from: process.env.MAILID,
            to: user.email,
            subject: 'Registration OTP for J-Kart',
            text: `Here is your One Time Password for registration: ${otp}`
        })
    } catch (err) {
        console.log(err);
    }
}

module.exports=sendotp