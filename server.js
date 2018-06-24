//Imports
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');

//Set port to 8081
var port = 8081;

//Initialize app
var app = express();
app.set('port', port);
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "jade");
app.use(express.static(__dirname + '/public'));

//Create cookies
app.use(session({
    key: 'user_sid',
    secret: 'someSecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: 6000000,
        httpOnly: false
    }
}));

//Set the routes
require("./node/routes.js")(app);

//Open the app to the port
console.log(app.get('port'));
app.listen(8081, () => console.log(`App started on port ${app.get('port')}`));