module.exports=function (req,res,next){
    try{
        if(req.session.logged){
            next()
        }else{
           res.redirect('/login')
        }
    }catch(err){
        console.log(err);
    }
}