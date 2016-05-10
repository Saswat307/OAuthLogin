/**
 * Created by lenovo on 5/5/2016.
 */

var User=require('../model/users.js').User;

module.exports=function(app,passport){

    app.get('/',function(req,res){
        res.render('index.ejs');
    });


    app.get('/login',function(req,res){
        res.render('login.ejs',{'message':req.flash('signupMessage')});
    });

    app.post('/login',passport.authenticate('local-login',{
        successRedirect: '/profile',
        failureRedirect: '/login',
        failureFlash: true
    }));

    app.get('/signup',function(req,res){
       res.render('singup.ejs',{'message':req.flash('signupMessage')});
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));



    app.get('/auth/facebook',
        passport.authenticate('facebook',{ scope: ['email']}));

    app.get('/auth/facebook/callback',
        passport.authenticate('facebook',
            {
                successRedirect: '/profile',
                failureRedirect: '/'
            }
        ));

    app.get('/auth/google',
        passport.authenticate('google', {scope: ['profile', 'email']}));

    app.get('/auth/google/callback',
        passport.authenticate('google',
            { successRedirect: '/profile',
            failureRedirect: '/' }));


    app.get('/connect/facebook',
            passport.authorize('facebook',{scope:['email']}));
    app.get('/connect/google',
            passport.authorize('google',{scope:['profile','email']}));

    app.get('/connect/local',function(req,res){
        res.render('connect-local.ejs', { message: req.flash('signupMessage')});
    });

    app.post('/connect/local',passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/connect/local',
        failureFlash: true
    }));


    app.get('/unlink/facebook', function(req, res){
        var user = req.user;

        user.facebook.token = null;

        user.save(function(err){
            if(err)
                throw err;
            res.redirect('/profile');
        })
    });

    app.get('/unlink/local', function(req, res){
        var user = req.user;

        user.local.username = null;
        user.local.password = null;

        user.save(function(err){
            if(err)
                throw err;
            res.redirect('/profile');
        });

    });

    app.get('/unlink/google', function(req, res){
        var user = req.user;
        user.google.token = null;

        user.save(function(err){
            if(err)
                throw err;
            res.redirect('/profile');
        });
    });

    app.get('/profile',isLoggedIn,function(req,res){
        res.render('profile.ejs',{user:req.user});
    });

    app.get('/logout',function(req,res){
        req.logout();
        res.redirect('/');
    });


    app.get('/:username/:password',function(req,res){
        var newUser=new User();

        newUser.local.username=req.params.username;
        newUser.local.password=req.params.password;
        console.log(newUser.local.username);
        console.log(newUser.local.password);


        newUser.save(function(err){
            if(err){
                throw err;
            }

            res.send("success");
        })
    });
};

function isLoggedIn(req,res,next){
    console.log("is logged in ");
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect('/login');
}