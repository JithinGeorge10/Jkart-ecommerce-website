module.exports=function (req,res,next){
    try{
        if(req.session.logged){
            next()
        }else{
           res.send({userNotLogged:true})
        }
    }catch(err){
        console.log(err);
    }
}