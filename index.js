const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/eve'
const mongoose = require('mongoose')

mongoose.connect(mongoUri)
app.listen(port, function () {
  console.log('server listening on port ' + port)
})
