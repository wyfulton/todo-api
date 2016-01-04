var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js')

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextID = 1;

app.use(bodyParser.json());

// GET /todos

app.get('/todos', function(req, res) {

	var query = req.query;
	var where = {};

	if (query.hasOwnProperty('completed') && query.completed === "true") {
		where.completed = true;
	} else if (query.hasOwnProperty('completed') && query.completed === "false") {
		where.completed = false;
	}

	if (query.hasOwnProperty('q') && query.q.length > 0) {
		where.description = {
			$like: '%' + query.q + '%'
		}
	}

	db.todo.findAll({
			where: where
		})
		.then(function(todos) {
			if (todos) {
				res.json(todos);
			}
		})
		.catch(function(e) {
			res.status(500).send();
		});
})

// GET by ID

app.get('/todos/:id', function(req, res) {
	var todoID = parseInt(req.params.id, 10);

	db.todo.findById(todoID)
		.then(function(todo) {
			if (todo) {
				res.json(todo.toJSON())
			} else {
				res.status(404).send(todo)
			}
		}, function(e) {
			res.status(500).send();
		});

	// var matchToDo = _.findWhere(todos, {
	// 	id: todoID
	// });

	// if (matchToDo) {
	// 	res.json(matchToDo);
	// } else {
	// 	res.status(404).send();
	// };
});

// POST
app.post('/todos', function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body)
		.then(function(todo) {
			res.json(todo.toJSON());
		}, function(e) {
			res.status(400).json(e)
		});

});

// DELETE
app.delete('/todos/:id', function(req, res) {

	var todoID = parseInt(req.params.id, 10);

	// db.todo.findById(todoID)
	// 	.then(function(todo) {
	// 		if (todo) {
	// 			todo.destroy();
	// 			res.json(todo);
	// 		} else {
	// 			res.status(404);
	// 		}
	// 	})
	// 	.catch(function(e) {
	// 		res.status(500).send()
	// 	})

	db.todo.destroy({
		where: {
			id: todoID
		}
	})
	.then(function (rowsDeleted) {
		if (rowsDeleted === 0){
			error: 'No todo with id';
		} else {
			res.status(204).send();
		}
	})
	.catch(function(e) {
		res.status(500).send()
	})

// Old version

	// var matchToDo = _.findWhere(todos, {
	// 	id: todoID
	// });

	// if (matchToDo) {
	// 	todos = _.without(todos, matchToDo);
	// 	res.json(matchToDo);
	// } else {
	// 	return res.status(400).json({
	// 		"error": "No todo found with that id"
	// 	});
	// }


	// res.status(200).send();
	// res.json(matchToDo);
});

// PUT
app.put('/todos/:id', function(req, res) {

	var todoID = parseInt(req.params.id, 10);
	var matchToDo = _.findWhere(todos, {
		id: todoID
	});
	var body = _.pick(req.body, 'description', 'completed');
	var validAttributes = {};

	if (!matchToDo) {
		return res.status(404).send();
	}

	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)) {
		validAttributes.completed = body.completed;
	} else if (body.hasOwnProperty('completed')) {
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString(body.description) && body.description.trim().length === 0) {
		validAttributes.description = body.description;
	} else if (body.hasOwnProperty('description')) {
		return res.status(400).send();
	}

	_.extend(matchToDo, validAttributes);
	res.json(matchToDo);

});

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port' + PORT + '!');
	});
});