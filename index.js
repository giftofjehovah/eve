const express = require('express')
const app = express()
const port = process.env.PORT || 3000
const mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost:27017/eve'
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cookieParser = require('cookie-parser')
const ejsLayouts = require('express-ejs-layouts')
const methodOverride = require('method-override')
require('ejs')

mongoose.connect(mongoUri)
app.listen(port, function () {
  console.log('server listening on port ' + port)
})

// Setup middleware
// Express settings
app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


app.use(ejsLayouts);
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));

app.use(methodOverride(function(request, response) {
  if(request.body && typeof request.body === 'object' && '_method' in request.body) {
    var method = request.body._method;
    delete request.body._method;
    return method;
  }
}));



const routes = require(__dirname + "/config/routes");
app.use(routes);
