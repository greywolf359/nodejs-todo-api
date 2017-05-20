var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore'); //for refactoring
var db = require('./db.js');
var bcrypt = require('bcryptjs');
var middleware = require('./middleware')(db);


var app = express();
const PORT = process.env.PORT || 3000;
var todos = [];
var todoNextId = 1;

jsonParser = bodyParser.json();
app.use(jsonParser);

app.get('/', (req, res)=>{
	res.send(todos);
})

//get all todos
app.get('/todos', middleware.requireAuthentication, (req,res)=>{
	console.log('execute todos');
	var query = req.query;
	var where = {};

	//determine if completed query is true or false
	if(query.hasOwnProperty('completed') && query.completed === 'true'){
		where.completed = true;
	}else if(query.hasOwnProperty('completed') && query.completed === 'false'){
		where.completed = false
	}

	//determine if theres is a search query
	if(query.hasOwnProperty('q') && query.q.length > 0){
		where.description = {
			$like: `%${query.q}%`
		}
	}

	//pass the query args to the db 
	db.todo.findAll({where: where}).then((todos)=>{
		if(todos){
			res.json(todos);
		}else{
			res.status(400).send('no matching todos found');
		}
		
	}, (error)=>{
		res.status(500).send("error retrieving...");

	})
	
	/********REFACTORED FOR SEQUELIZE********
	var filteredTodos = todos;
	if(queryParams.completed === 'true'){
		filteredTodos = _.where(todos, {completed: true})
	}else if(queryParams.completed === 'false'){
		filteredTodos = _.where(todos, {completed: false});
	}
	if(queryParams.q && queryParams.q.length > 0){
		filteredTodos = _.filter(filteredTodos,(todo)=>{
			return todo.description.indexOf(queryParams.q) >= 0;
		})
	}
	res.json(filteredTodos);
	*****************************************/
	
})

//get individual todo
app.get('/todos/:id', middleware.requireAuthentication, (req,res)=>{
	//this is where you got hung up
	//remember that params are always strings
	//you tried to compre a number to a string in an === comparison
	var id = parseInt(req.params.id);

	//-----------REFACTORED AGAIN TO SUPPORT SQLITE
	//matchedTodo = _.findWhere(todos, {id})
	/*---CODE REFACTORED TO USE UNDERSCORE
	KEPT THIS IN CASE IT'S NEEDED FOR REFERENCE
	console.log('id: ', id, typeof id)
	//iterate over array and find the id
	var todo = todos.find((element)=>{
		console.log(element.id);
			return element.id === id			
		}
	)
	------------------------------------
	*/
	
	db.todo.findById(id).then((todo)=>{
		if(todo){
			res.status(200).json(toJSON(todo));
		}else{
			res.status(404).send("nothing found");
		}
	}).catch((e)=>{
		console.log('error',e);
		res.status(500).send("server error");
	})
	
	
	
	
});

//posting a todo 
app.post('/todos', middleware.requireAuthentication, (req,res)=>{
	//screen unexpected key:value pairs using underscore
	var body = _.pick(req.body, "description", "completed");
	
	//call create on db.todo
	db.todo.create({
		description: body.description,
		completed: body.completed
	}).then((todo)=>{
		req.user.addTodo(todo).then(()=>{
			return todo.reload();
		}).then((todo)=>{
			res.json(todo.toJSON());
		});
	}).catch((e)=>{
		res.status(400).send("there was an error or bad requrest");

	})

	/*****REFACTORED TO USE SQLITE DATABASE****
	******LEFT THIS CODE IN FOR REFERENCE IF NEEDED
	THIS WAS JUST USING AN AN ARRAY TO ADD TO
	if(!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0){
		return res.status(400).send();
	}
	//trim body.description using trim()
	var todo = {
		id: todoNextId,
		description: body.description.trim(),
		completed: body.completed
	}

	todos.push(todo);
	todoNextId += 1;
	//push body into array
	res.json(todos);
	*******************************************/
});

//delete method
app.delete('/todo/:id', middleware.requireAuthentication, (req,res)=>{
	var id = parseInt(req.params.id);

	db.todo.destroy({
		where: {id}
	}).then((todo)=>{

		if(todo){
			res.status(200).send('todo deleted');
		}else{
			res.status(204).send('no todo found for deletion.');
		}
	},(err)=>{
		res.status(500).send('internal error');
	})


	/******REFACTORED CODE TO USE SEQUELIZE AND SQLITE******
	LEFT IN FOR REFERENCE IF NEEDED
	var todoToDelete = _.findWhere(todos, {id})
	if(!todoToDelete){
		console.log("todo not found");
		res.status(404).send('todo not found');
	}
	todos = _.without(todos,todoToDelete);
	res.status(200).send(todoToDelete);
	********************************************************/
})

//edit an entry
app.put('/todo/:id', (req,res)=>{
	var id = parseInt(req.params.id);
	var body = _.pick(req.body, "description", "completed");//strip unexpected key:values
	var attributes = {};
	
	
	//find todo by id if it exists
	if(body.hasOwnProperty('completed')){
		attributes.completed = body.completed;
	}
	
	if(body.hasOwnProperty('description')){
		attributes.description = body.description;
	}

	db.todo.findById(id).then((todo)=>{
		if(todo){
			//returns to the chained promise below
			todo.update(attributes).then((todo)=>{//fires if todo.update is successful
			res.status(400).json(todo.toJSON());
	},(e)=>{
		res.status(400).json(e)
	})
		}else{
			res.status(404).send();//if not nothing found by update then return 404 to the user
		}
	}, ()=>{
		res.status(500).send();
	})
})

//create new user
app.post('/user', (req,res)=>{
	//strip unexpected key:value pairs
	var body = _.pick(req.body, "email", "password");
	console.log(body);
	//sequelize uses create to create the entry using the object {body}
	//then sends the data back to the user
	db.user.create(body).then((userObj)=>{
		//send the user back the data
		//toPublicJSON is on the user object defined by sequelize.define
		//topublicjson strips off the what user should not see and converts it to json
		res.json(userObj.toPublicJSON())
	}).catch((e)=>{
		res.status(404).send(e);
	})
})

//existing user logs in
app.post('/users/login',(req,res)=>{
	var body = _.pick(req.body, "email", "password");
	//pass user inputed data to authenticate method on user class
	db.user.authenticate(body).then((user)=>{
		//if the user is found in the database and the password is correct then generate a token
		var token = user.generateToken('authentication');
		//if token exists then build an auth header and give it the value of the token and send it to the user
		if (token){
			res.header('Auth', token).json(user.toPublicJSON());
		}else{
			res.status(401).send()
		}
		
	},(e)=>{
		res.status(401).send()
	})

	//*************************************************************************
})

db.sequelize.sync({force: true}).then(()=>{
	app.listen(PORT,()=>{
		console.log('Listening on port: ', PORT);
})
})