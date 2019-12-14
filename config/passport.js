const LocalStrategy= require('passport-local').Strategy;
const mongoose= require('mongoose');
const bcrypt = require('bcryptjs');

//Load User Module
const User = require('../models/User');

module.exports = function(passport) {
    passport.use(
        new LocalStrategy({usernameField: 'email'}, (email,password,done)=>{
            //match user
            User.findOne({email:email})
                .then(user => {
                    if(!user)
                    {
                        return done(null, false, 'That Email is not registered');
                    }
                    //match password
                    bcrypt.compare(password, user.password, (err,isMatch)=>{
                        if(err) throw err;
                        if(isMatch) {
                            return done(null, user);
                        }
                        else{
                            return done(null, false, 'Password Incorrect');
                        }
                    });
                })
                .catch(err => console.log(err));
        })
    );
    //serializing and deserializing users

    passport.serializeUser((user,done)=>{
        done(null,user.id);
    });

    passport.deserializeUser((id,done)=>{
        User.findById(id, (err,user)=> {
            done(err, user);
        });
    });
}