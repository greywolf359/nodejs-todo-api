//intro to sql lite and sequelize
var Sequelize = require('sequelize');
var sequelize = new Sequelize(undefined, undefined, undefined,{
	'dialect': 'sqlite',
	'storage': __dirname + '/basic-sqlite-database.sqlite'
});

var Todo = sequelize.define('todo',{
	description: {
		type: Sequelize.STRING,
		allowNull: false,
		validate:{
			len: [1,250] //no empty strings allowed
		}
	},
	completed: {
		type: Sequelize.BOOLEAN,
		allowNull: false,
		defaultValue: false
	}
})

sequelize.sync().then(()=>{
	console.log('everything is synced');

	Todo.create({
		description: "rake leaves",
		completed: true
	}).then((todo)=>{
		console.log("THIS WAS INSERTED INTO DATABSE", todo.toJSON());
	})

	Todo.create({
		description: "blow leaves",
		completed: true
	}).then((todo)=>{
		console.log("THIS WAS INSERTED INTO DATABSE", todo.toJSON());
	})

	Todo.create({
		description: "vacumm everything",
		completed: false
	}).then((todo)=>{
		console.log("THIS WAS INSERTED INTO DATABSE", todo.toJSON());
	})

	Todo.findAll({
		where: {
			description: {
				$like: '%leaves%'
			}
		}
	}).then((todos)=>{
		console.log("this was found with findall", todos);
	})

	/*
	Todo.create({
		description: 'walk dog',
		completed: true
	}).then((todo)=>{
		return Todo.create({
			description: "clean room"
		}).then(()=>{
			//return Todo.findById(1);
			return Todo.findAll({
				where:{
					description: {
						$like: '%room%'
					}
				}
			})
		}).then((todos)=>{
			if(todos){
				todos.forEach((todo)=>{
					console.log(todo.toJSON())
				})
			}else{
				console.log('no todo found');
			}
		})
	}).catch((e)=>{
	console.log(e);

})

*/
})