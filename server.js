var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: 'finish resume but differently',
	completed: false
}, {
	id: 2,
	description: 'Go to market',
	completed: false
}, {
	id: 3,
	description: 'run errands',
	completed: true
}];

app.get('/', function (req, res) {
	res.send('Todo API Root');
});

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

app.listen(PORT, function () {
	console.log('Express listening on port' + PORT + '!');
})