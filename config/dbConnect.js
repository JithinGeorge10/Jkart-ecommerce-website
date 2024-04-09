const mongoose = require('mongoose')

module.exports = mongoose.connect(process.env.MONGOURL)
.then(() => { console.log('mongodb connected') })
.catch((error) => { console.log(error) }) 