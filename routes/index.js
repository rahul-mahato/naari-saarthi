const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../config/auth');
//welcome
router.get('/', (req, res) => {
    res.render('welcome');
});
//redirect 
router.get('/index', (req, res) => {
    res.render('welcome');
})
//explore-us

//loggedin home
// router.get('/index-loggedin', (req, res) => {
//     console.log(req.user);
//     res.render('index-loggedin', {
//         name: req.user.name,
//         email: req.user.email
//     });
// });
router.get('/sectors',(req,res)=> res.render('sectors'));
router.get('/training',(req,res)=> res.render('training'));
router.get('/seller-zone',(req,res)=>res.render('seller-zone'));
router.get('/e-corner',(req,res)=>res.render('e-corner'));

//Dashboard
router.get('/dashboard', (req, res) => {
    console.log(req.user);
    res.render('dashboard', {
        name: req.user.name,
        email: req.user.email
    });
});



module.exports = router;