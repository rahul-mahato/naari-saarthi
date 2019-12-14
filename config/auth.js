
var ensureAnthentiacted= function(req,res,next){
        if(req.isAnthentiacted){
            return next();
        }
        req.flash('error_msg', 'Please Log In To View');
        res.redirect('/users/login');
    }
    module.exports = ensureAnthentiacted;