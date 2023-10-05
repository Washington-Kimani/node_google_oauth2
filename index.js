const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const methodOverride = require('method-override');
const app = express();
require('dotenv').config();
require('./auth')

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));
app.set('view engine', 'hbs');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());


function isLoggedIn(req, res, next) {
    req.user ? next() : res.redirect('/');
}

function isLoggedOut(req, res, next) {
    !req.user ? next() : res.redirect('/auth/google/success')
}

app.get('/', isLoggedOut, (req, res) => {
    res.render('index');
});

app.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));

app.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth/google/success',
        failureRedirect: '/auth/google/failure'
    }));

app.get('/auth/google/success', isLoggedIn, (req, res) => {
    let user = req.user
    res.render('home', { user: user });
});

app.get('/auth/google/failure', (req, res) => {
    res.send(`Something went wrong!!!`);
});

app.delete('/logout', async (req, res) => {
    req.logout(function (err) {
        err ? res.send(err) : res.redirect('/');
    })
})

app.listen(process.env.PORT, () => console.log(`Server is running on port ${process.env.PORT}`));