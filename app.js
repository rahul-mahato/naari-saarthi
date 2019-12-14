const express = require('express');
const secure = require('express-force-https');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const requestIp = require('request-ip');

var app = express();
//Secure https

app.enable('trust proxy');
app.use(secure);
//passport config
require('./config/passport')(passport);


/////find ip
// app.use(requestIp.mw())

// app.use(function(req, res, next) {
//     const ip = req.clientIp;
//     console.log(ip);
//     next();

// });

//database
const db = require('./config/keys').MongoURI;
//connect to mongo
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongodbConnected...'))
    .catch(err => console.log(err));

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//Handling Images
app.use(express.static("public"));

//bodyparser
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));

//express session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));
//serializing sessions Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global vars 
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

//Handling Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));




const PORT = process.env.PORT || 3000;
app.listen(PORT, console.log(`server started on ${PORT}`));