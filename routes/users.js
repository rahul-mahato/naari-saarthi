const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');




//User Model
const User = require('../models/User');

//login page
router.get('/login', (req, res) => {
    res.render('login');
})

//redirect 
router.get('/index', (req, res) => {
    res.render('welcome');
})

//Register page
router.get('/register', (req, res) => {
    res.render('register');
})

//Register Post Request
router.post('/register', async(req, res) => {
    console.log(req.body);
    const {
        name,
        email,
        password,
        password2,
        education,
        interestInEntp,
        interestSectors,
        location,
        working,
        gender,
        age
    } = req.body;

    let errors = [];

    if (!name || !email || !password || !education || !gender || !interestInEntp || !interestSectors || !location || !working || !age ) {
        errors.push({ msg: 'Please Fill in all the fields ' })
    }
    if (password !== password2) {
        errors.push({ msg: "Passwords do not match" });
    }
    if(gender != 'female'){
        errors.push({ msg: "Gender can only be female" });

    }
    if (errors.length > 0) {
        console.log(errors);
        res.render('register',{


            errors,
            name,
            email,
            location,
            age
        }        )
    }
    else {

        User.findOne({ email: req.body.email }).then(user => {
            if (user) {
                errors.email = 'Email already exists';
                console.log("ERROR");
                res.render('register',errors);
            } else {

                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password,
                    education: req.body.education,
                    gender: req.body.gender,
                    interestInEntp: req.body.interestInEntp,
                    interestSectors: req.body.interestSectors,
                    location: req.body.location,
                    working: req.body.working,
                    age: req.body.age,

                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if (err) throw err;
                        newUser.password = hash;
                        newUser
                            .save()
                            .then(user =>{
                                console.log(user);
                                req.flash('success_msg','Details Registered and Successfully Sent For Verification..');
                                res.redirect('/users/login');}
                                )
                            .catch(err => console.log(err));
                    });
                });
            }
        });
    }
});
//login handle
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});
//logout handle
router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success_msg', 'You Are Logged Out');
    res.redirect('/users/login');
});
module.exports = router;