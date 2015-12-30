var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');

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
	var matchToDo = _.findWhere(todos, {id: todoID});

	// origional matchToDo
		// todos.forEach(function (todo) {
		// 	if (todo.id === todoID) {
		// 		matchToDo = todo;
		// 	}
		// })

	if (matchToDo){
		res.json(matchToDo);
	} else {
		res.status(404).send();
	};
});

app.post('/todos', function (req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) { 
		return res.status(400).send();
	};

	body.description = body.description.trim();
	body.id = todoNextID;

	todos.push(body);

	todoNextID += 1;
	res.json(body);
});

app.delete('/todos/:id', function (req, res) {

	var todoID = parseInt(req.params.id, 10);
	var matchToDo = _.findWhere(todos, {id: todoID});

	if (matchToDo) {
		todos = _.without(todos, matchToDo);
		res.json(matchToDo);
	} else {
		return res.status(400).json({"error": "No todo found with that id"});
	}


	res.status(200).send();
	res.json(matchToDo);
});


app.listen(PORT, function () {
	console.log('Express listening on port' + PORT + '!');
});