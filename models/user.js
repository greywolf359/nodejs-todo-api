var bcrypt = require('bcryptjs');
var _ = require('underscore');
module.exports = function(sequelize, DataTypes){
	var user = sequelize.define('user', {
		email: {
			type: DataTypes.STRING,
			allowNull: false,
			unique: true,
			validate: {
				isEmail: true
			}
		},

		salt:{
			type: DataTypes.STRING
		},

		password_hash: {
			type: DataTypes.STRING
		},

		//this is a virtual type meaning it is not passed to the db until operations 
		//are performed on it
		password: {
			type: DataTypes.VIRTUAL,
			allowNull: false,
			validate: {
				len: [7,100]
			},
			set: function(value){//value here would be whatever value was passed from the client in password
				//salt adds random chars to the end of the hash
				var salt = bcrypt.genSaltSync(10);
				//brcrypt takes the password, hashes it, then adds the 'salt' to the end
				hashedPassword = bcrypt.hashSync(value, salt);
				//each component is now set into its corresponding column
				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
			}
		}
	},
	{	//hooks fire before or after an event takes place
		//this reduces any capitals in an email value to all lowercase
		hooks: {
			beforeValidate: (user, options)=>{
				if (typeof user.email === 'string'){
					user.email = user.email.toLowerCase();
				}
			}
		},
		//this will strip off any fields you dont want to send the user - you specify which fields to send
		instanceMethods: {
			toPublicJSON: function(){
				var json = this.toJSON();
				return _.pick(json, "id","email", "createdAt", "updatedAt");
			}
		},
		classMethods: {
			authenticate: function(body){
				return new Promise((resolve,reject)=>{


					//if the user inputs are not both strings then reject
					if(typeof body.email !== 'string' || typeof body.password !== 'string'){
						return reject();
						//return res.status(400).send("email or password is not a string");
					}
				//find the user in the db
				user.findOne({where: {email: body.email}}).then((user)=>{
				//if exists then get the datafields and compare the password entered with the hash in db
				if(user){
					//var dataToSend = _.pick(user, "id", "email", "createdAt", "updatedAt");
					//if password comparison fails then reject
					if(!bcrypt.compareSync(body.password, user.get('password_hash'))){
						return reject();
						//return res.status(401).send('unauthorized');
					}
					//send data
					resolve(user);
					//res.status(200).json(dataToSend);
				}else{
					//if no match is found then inform user
					res.status(400).send('no user found');
				}
				}).catch((error)=>{
					//if there is a server error
					res.status(500).send('server error ' + error);
				})
				
				});//close promise
			}//close authenticate
		}
	});//closer for sequelize.define
	return user;
}//closer for module.exports

//look into checking for unique isntances in mongo such as checking a db for an existing email
/*

The takeaway here is to make the password a virtual and not commit it to the db until 
somme operations have been done on it, such as hashing and salting.  You would have to use a 
library such as bycrypt to create the hash and salt.  

You also need to guard against unexpected data appearing in your query string.  Always sanitize any 
data from the user and allow only expected data into your database and always make sure the db knows
what type of data to put in a field.
*/