var cryptojs = require('crypto-js');
module.exports = function(db){
	return {
		requireAuthentication: (req,res,next)=>{
			var token = req.get('Auth') || '';
			console.log("token", token);
			db.token.findOne({
				where: {
					tokenHash: cryptojs.MD5(token).toString()
				}
			}).then((tokenInstance)=>{
				if(!tokenInstance){
					throw new Error();
				}

				req.token = tokenInstance;
				return db.user.findByToken(token);
			}).then((user)=>{
				req.user = user;
				next();
			}).catch((e)=>{
				console.log("error in require authentication: ", e);
				res.status(401).send(e);
			});
			/*
			db.user.findByToken(token).then((user)=>{
				req.user = user;
				next();
			}, (e)=>{
				res.status(500).send('require authentication encountered an error ' + e);
			})
			*/
		}
	}
}