var express = require('express');
var bodyParser = require('body-parser')

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextID = 1;

app.use(bodyParser.json());

app.get('/todos', function (req, res) {
	res.json(todos);
})

app.get('/todos/:id', function (req, res) {
	var todoID = parseInt(req.params.id, 10);
	var matchToDo;
	todos.forEach(function (todo) {
		if (todo.id === todoID) {
			matchToDo = todo;
		}
	})
	if (matchToDo){
		res.json(matchToDo);
	} else {
		res.status(404).send();
	};
});

app.post('/todos', function (req, res) {
	var body = req.body;
	body.id = todoNextID;
	todos.push(body);

	todoNextID += 1;
	res.json(body);
});


app.listen(PORT, function () {
	console.log('Express listening on port' + PORT + '!');
})