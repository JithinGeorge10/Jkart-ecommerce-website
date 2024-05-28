const express = require('express')
const session = require('express-session')
require('dotenv').config()
require('./middleware/googleAuth.js')
const path = require('path')
const app = express()

require('./config/dbConnect.js')
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
});

app.use(session({
    secret: process.env.SESSIONSECRET,
    resave: true,
    saveUninitialized: true
}))


app.set('view engine', 'ejs')

const userRouter = require('./routes/userRoute')
const adminRouter=require('./routes/adminRoute.js')

app.use(userRouter)
app.use(adminRouter)

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const status = err.status || 'error';
    res.status(statusCode).render('userPages/error', { statusCode, status, message: err.message });
  })

app.listen(process.env.PORT, () => {
    console.log('port started');
})