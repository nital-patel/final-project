const express = require('express');
// const logger = require('morgan');
const path = require('path');
const bodyParser = require('body-parser');
const passport = require('passport');
const app = express();
const passportConfig = require('./config/passport');

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "http://localhost:3000");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
};

app.use(allowCrossDomain);
// app.use(logger('dev'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});

passportConfig(passport);

app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
    passport.authenticate('google', { scope: ['profile', 'email']}),
    function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('http://localhost:3000');
    }
);

app.get('/me',
    (req, res) => {
        if (req.user) {
            res.json(req.user);
        } else {
            res.status(401).json({message: 'not authorized'});
        }

    }
);

const productRoutes = require('./routes/product-routes');

app.use('/product', productRoutes);

app.use('*', (req, res) => {
    res.status(400).json({
        message: 'Endpoint not found!',
    });
});