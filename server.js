var express = require('express');
var app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res)=>{
	res.send('todo api');
})

app.listen(PORT,()=>{
	console.log('Listening on port: ', PORT);
})

