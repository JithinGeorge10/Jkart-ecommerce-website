

module.exports=function (req,res,next){
    try{
        if(req.session.admin){
            next()
        }else{
            res.redirect('/admin')
        }
    }catch(err){
        console.log(err);
    }
}