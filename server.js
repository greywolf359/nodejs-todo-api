var express = require('express');
var app = express();
const PORT = process.env.PORT || 3000;

var todos = [
	{
		id: 1,
		description: "meet for lunch",
		completed: false
	},
	{
		id: 2,
		description: "go shopping",
		completed: false
	},
	{
		id: 3,
		description: "feed dog",
		completed: true
	}
];

app.get('/', (req, res)=>{
	res.send('todo api');
})

app.get('/todos', (req,res)=>{
	res.json(todos);
})

app.get('/todos/:id', (req,res)=>{
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

	//if not found send a 404
})

app.listen(PORT,()=>{
	console.log('Listening on port: ', PORT);
})

