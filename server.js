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

	// validate query data
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

	// find in database and return res
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
});

// PUT
app.put('/todos/:id', function(req, res) {

	var todoID = parseInt(req.params.id, 10);

	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	} 

	db.todo.findById(todoID)
		.then(function (todo) {
			if (todo) {
				return todo.update(attributes)
			} else {
				res.status(404).send();
			}
		}, function () {
			res.status(500).send;
		})
		.then(function (todo) {
			res.json(todo.toJSON());
		}, function (e) {
			res.status(400).send(e);
		});

});

app.post('/users', function (req, res) {
	var body = _.pick(req.body, 'email', 'password')

	db.user.create(body)
		.then(function (user) {
			res.json(user.toJSON());
		}, function (e) {
			res.status(400).json(e);
		})
})

db.sequelize.sync().then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port' + PORT + '!');
	});
});