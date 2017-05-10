var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

jsonParser = bodyParser.json();
app.use(jsonParser);

app.get('/', (req, res)=>{
	res.send('todo api');
})

app.get('/todos', (req,res)=>{
	//res.json(todos);
	res.send('wtf');
})

app.get('/todos/:id', (req,res)=>{
	//this is where you got hung up
	//remember that params are always strings
	//you tried to compre a number to a string in an === comparison
	var id = parseInt(req.params.id);
	console.log('id: ', id, typeof id)
	//iterate over array and find the id
	var todo = todos.find((element)=>{
		console.log(element.id);
			return element.id === id			
		}
	)
	console.log(todo);
	if(todo){
		//res.status(200).send(todo);
		res.status(200).json(todo);
	}else{
		res.status(404).send('Todo Not found');
	}
});

app.post('/todos', (req,res)=>{
	var body = req.body;
	console.log('description:', body);

	var todo = {
		id: todoNextId,
		description: body.description,
		completed: body.completed
	}

	todos.push(todo);
	todoNextId += 1;
	//push body into array
	res.json(todos);
})

app.listen(PORT,()=>{
	console.log('Listening on port: ', PORT);
})

