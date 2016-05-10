/**
 * Created by lenovo on 5/8/2016.
 */
var fs=require('fs');

module.exports=function(router,passport){

    router.use(function(req,res,next){
        console.log("inside append file");
       fs.appendFile('log.txt',req.path+" token : "+req.query.access_token +"\n",function(err){
           if(err){
               next();
           }
           next();
       });
    });



   router.get('/testApi',function(req,res,next){
        if(req.query.access_token){
            next();
        }else{
            next('route');
        }
    },passport.authenticate('bearer', { session: false }),function(req,res){
        res.send({"secreteDate":"Hello World",'Authenticated':true});
    });

    router.get('/testApi',function(req,res){
        console.log("inside test Api");
        res.send({'secreteDate':"Hello World",'Authenticated':false});
    });
};