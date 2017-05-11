var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore'); //for refactoring
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
app.get('/todos', (req,res)=>{
	var queryParams = req.query;
	//var filteredTodos = todos;
	var filteredTodos = todos;

	if(queryParams.completed === 'true'){
		filteredTodos = _.where(todos, {completed: true})
	}else if(queryParams.completed === 'false'){
		filteredTodos = _.where(todos, {completed: false});
	}

	if(queryParams.q && queryParams.q.length > 0){
		filteredTodos = _.filter(filteredTodos,(todo)=>{
			return todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) >= 0;
		})
	}
	res.json(filteredTodos);
})

//get individual todo
app.get('/todos/:id', (req,res)=>{
	//this is where you got hung up
	//remember that params are always strings
	//you tried to compre a number to a string in an === comparison
	var id = parseInt(req.params.id);
	matchedTodo = _.findWhere(todos, {id})

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
	if(matchedTodo){
		res.status(200).json(matchedTodo);
	}else{
		res.status(404).send('Todo Not found');
	}
});

//posting a todo 
app.post('/todos', (req,res)=>{
	//screen unexpected key:value pairs using underscore
	var body = _.pick(req.body, "description", "completed");
	

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
});

//delete method
app.delete('/todo/:id', (req,res)=>{
	var id = parseInt(req.params.id);
	var todoToDelete = _.findWhere(todos, {id})
	if(!todoToDelete){
		console.log("todo not found");
		res.status(404).send('todo not found');
	}
	todos = _.without(todos,todoToDelete);
	res.status(200).send(todoToDelete);
})

app.put('/todo/:id', (req,res)=>{
	
	var id = parseInt(req.params.id);
	var matchedTodo = _.findWhere(todos, {id});//find a match, if any
	var body = _.pick(req.body, "description", "completed");//strip unexpected key:values
	var validAttributes = {};
	if (!matchedTodo){//if not found return a 404
		return res.status(404).send();
	}
	
	//find todo by id if it exists
	if(body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	}else if(body.hasOwnProperty('completed')){//if exists but not a boolean
		return res.status(400).send("completed exists but not bool");
	}
	
	if(body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length > 0){
		validAttributes.description = body.description;
	}else{
		return res.status(400).send("description error");
	}
	_.extend(matchedTodo, validAttributes)
	res.json(matchedTodo);

})

app.listen(PORT,()=>{
	console.log('Listening on port: ', PORT);
})

