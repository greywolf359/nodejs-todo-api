module.exports = function(db){
	return {
		requireAuthentication: (req,res,next)=>{
			var token = req.get('Auth');
			db.user.findByToken(token).then((user)=>{
				req.user = user;
				next();
			}, (e)=>{
				res.status(500).send('require authentication encountered an error ' + e);
			})
		}
	}
}