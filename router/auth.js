/**
 * Created by lenovo on 5/8/2016.
 */

module.exports=function(router,passport){
    router.get('/',function(req,res){
        res.render('index.ejs');
    });


    router.get('/login',function(req,res){
        res.render('login.ejs',{'message':req.flash('signupMessage')});
    });

    router.post('/login',passport.authenticate('local-login',{
        successRedirect: '/profile',
        failureRedirect: '/auth/login',
        failureFlash: true
    }));

    router.get('/signup',function(req,res){
        res.render('singup.ejs',{'message':req.flash('signupMessage')});
    });

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/',
        failureRedirect: '/signup',
        failureFlash: true
    }));


    router.get('/facebook',
        passport.authenticate('facebook',{ scope: ['email']}));

    router.get('/facebook/callback',
        passport.authenticate('facebook',
            {
                successRedirect: '/profile',
                failureRedirect: '/'
            }
        ));

    router.get('/google',
        passport.authenticate('google', {scope: ['profile', 'email']}));

    router.get('/google/callback',
        passport.authenticate('google',
            { successRedirect: '/profile',
                failureRedirect: '/' }));


    router.get('/connect/facebook',
        passport.authorize('facebook',{scope:['email']}));
    router.get('/connect/google',
        passport.authorize('google',{scope:['profile','email']}));

    router.get('/connect/local',function(req,res){
        res.render('connect-local.ejs', { message: req.flash('signupMessage')});
    });

    router.post('/connect/local',passport.authenticate('local-signup', {
        successRedirect: '/profile',
        failureRedirect: '/connect/local',
        failureFlash: true
    }));


    router.get('/unlink/facebook', function(req, res){
        var user = req.user;

        user.facebook.token = null;

        user.save(function(err){
            if(err)
                throw err;
            res.redirect('/profile');
        })
    });

    router.get('/unlink/local', function(req, res){
        var user = req.user;

        user.local.username = null;
        user.local.password = null;

        user.save(function(err){
            if(err)
                throw err;
            res.redirect('/profile');
        });

    });

    router.get('/unlink/google', function(req, res){
        var user = req.user;
        user.google.token = null;

        user.save(function(err){
            if(err)
                throw err;
            res.redirect('/profile');
        });
    });

    /*app.get('/profile',isLoggedIn,function(req,res){
        res.render('profile.ejs',{user:req.user});
    });*/

    router.get('/logout',function(req,res){
        req.logout();
        res.redirect('/');
    });


};
