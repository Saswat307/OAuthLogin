var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy=require('passport-facebook').Strategy;
var GoogleStrategy=require('passport-google-oauth').OAuth2Strategy;
var BearerStrategy=require('passport-http-bearer').Strategy;


var User= require('../model/users').User;
var Token=require('../model/users').Token;
var configAuth=require('../config/auth');

module.exports = function(passport) {


    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.findById(id, function(err, user){
            done(err, user);
        });
    });


    passport.use('local-signup', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done){
            process.nextTick(function(){
                console.log("inside signup ");
                User.findOne({'local.username': email}, function(err, user){
                    if(err)
                        return done(err);
                    else if(user){
                        return done(null, false, req.flash('signupMessage', 'That email already taken'));
                    } else if(!req.user) {
                        var newUser = new User();
                        newUser.local.username = email;
                        newUser.local.password = newUser.genearteHash(password);

                        newUser.save(function(err){
                            if(err)
                                throw err;
                            return done(null, newUser);
                        })
                    }else{
                        var user =req.user;
                        user.local.username = email;
                        user.local.password = user.genearteHash(password);

                        user.save(function(err,user){
                            if(err)
                                throw err;
                            return done(null, user);
                        })
                    }
                })

            });
        }));

    passport.use('local-login', new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password',
            passReqToCallback: true
        },
        function(req, email, password, done){
            process.nextTick(function(){
                User.findOne({'local.username': email}, function(err, user){
                    if(err)
                        return done(err);
                    else if(!user){
                        return done(null, false, req.flash('signupMessage', 'User Not Found'));
                    }
                    else if(!user.validPassword(password)){
                        return done(null, false, req.flash('signupMessage', 'Password is Incorrect'));
                    }

                    return done(null, user);
                })

            });
        }));

    passport.use(new FacebookStrategy({
            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true,
            profileFields: ['id', 'emails', 'name','displayName'] //This
        },
        function(req,accessToken, refreshToken, profile, done) {

            process.nextTick(function(){
                //user is not logged in.
                if(!req.user){
                    User.findOne({'facebook.id': profile.id},function(err,user){
                        if(err){
                            done(err);
                        }else if(user){

                            if(!user.facebook.token){
                                user.facebook.token=accessToken;
                                user.facebook.name=profile.displayName;
                                user.facebook.email=profile.emails[0].value;

                                user.save(function(err){
                                    if(err){
                                        throw err;
                                    }
                                })
                            }
                            done(null,user);
                        }else{
                            var newUser=new User();
                            newUser.facebook.id=profile.id;
                            newUser.facebook.token=accessToken;
                            newUser.facebook.name=profile.displayName;
                            newUser.facebook.email=profile.emails[0].value;
                            newUser.save(function(err,user){
                                if(err){
                                    throw err;
                                }
                                return done(null,user);
                            });
                        }
                    });
                }else{// user is logged already logged in.
                    var user=req.user;
                    user.facebook.id=profile.id;
                    user.facebook.token=accessToken;
                    user.facebook.name=profile.displayName;
                    user.facebook.email=profile.emails[0].value;
                    user.save(function(err,user){
                        if(err){
                            throw err;
                        }
                        return done(null,user);
                    });
                }

            });


            /*User.findOrCreate({ facebookId: profile.id }, function (err, user) {
                return cb(err, user);
            });*/
        }
    ));

    passport.use(new GoogleStrategy({
            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true
        },
        function(req,accessToken, refreshToken, profile, done) {
            process.nextTick(function(){
                // if user is not logged in
                if(!req.user){
                    console.log("user is not logged in ");

                    User.findOne({'google.id': profile.id}, function(err, user){
                        if(err)
                            return done(err);
                        else if(user){

                            if(!user.google.token){
                                user.google.token=accessToken;
                                user.google.name=profile.displayName;
                                user.google.email=profile.emails[0].value;

                                user.save(function(err){
                                    if(err){
                                        throw err;
                                    }
                                })
                            }
                            return done(null, user);
                        }
                        else {
                            var newUser = new User();
                            newUser.google.id = profile.id;
                            newUser.google.token = accessToken;
                            newUser.google.name = profile.displayName;
                            newUser.google.email = profile.emails[0].value;

                            newUser.save(function(err){
                                if(err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });
                }else{
                    var user=req.user;
                    user.google.id = profile.id;
                    user.google.token = accessToken;
                    user.google.name = profile.displayName;
                    user.google.email = profile.emails[0].value;
                    console.log("user is logged in ")
                    console.log(user);
                    user.save(function(err,user){
                        if(err)
                            throw err;
                        return done(null, user);
                    });

                }


            });
        }

    ));


    passport.use(new BearerStrategy(
        function(token, done) {
            /*User.findOne({ _id: token }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                return done(null, user, { scope: 'all' });
            });*/

            Token.findOne({value:token}).populate('user').exec(function(err,token){
                if(!token){
                    return done(null,false);
                }
                return done(null,token.user);
            })
        }
    ));

}