var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var bcrypt = require('bcrypt');
var middleware = require('./middleware.js')(db);

var app = express();
var PORT = process.env.PORT || 3000;
var todos = [];
var todoNextID = 1;

app.use(bodyParser.json());

// GET /todos

app.get('/todos', middleware.requireAuthentication, function(req, res) {

	var query = req.query;
	var where = {
		userId: req.user.get('id')
	};

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

app.get('/todos/:id', middleware.requireAuthentication, function(req, res) {
	var todoId = parseInt(req.params.id, 10);

	db.todo.findOne({
			where: {
				userId: req.user.get('id'),
				id: todoId
			}
		})
		.then(function(todo) {
			if (todo) {
				res.json(todo.toJSON());
			} else {
				res.status(404).send();
			}
		}, function(e) {
			res.status(500).send();
		});
});

// POST
app.post('/todos', middleware.requireAuthentication, function(req, res) {
	var body = _.pick(req.body, 'description', 'completed');

	db.todo.create(body)
		.then(function(todo) {
			req.user.addTodo(todo).then(function() {
				return todo.reload();
			}).then(function(todo) {
				res.json(todo.toJSON());
			})
		}, function(e) {
			res.status(400).json(e)
		});

});

// DELETE
app.delete('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoID = parseInt(req.params.id, 10);

	db.todo.destroy({
			where: {
				userId: req.user.get('id'),
				id: todoID
			}
		})
		.then(function(rowsDeleted) {
			if (rowsDeleted === 0) {
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
app.put('/todos/:id', middleware.requireAuthentication, function(req, res) {

	var todoID = parseInt(req.params.id, 10);

	var body = _.pick(req.body, 'description', 'completed');
	var attributes = {};

	if (body.hasOwnProperty('completed')) {
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')) {
		attributes.description = body.description;
	}

	db.todo.findOne({
			where: {
				userId: req.user.get('id'),
				id: todoID
			}
		})
		.then(function(todo) {
			if (todo) {
				return todo.update(attributes)
			} else {
				res.status(404).send();
			}
		}, function() {
			res.status(500).send;
		})
		.then(function(todo) {
			res.json(todo.toJSON());
		}, function(e) {
			res.status(400).send(e);
		});

});

app.post('/users', function(req, res) {
	var body = _.pick(req.body, 'email', 'password')

	db.user.create(body)
		.then(function(user) {
			res.json(user.toPublicJSON());
		}, function(e) {
			res.status(400).json(e);
		})
})

app.post('/users/login', function(req, res) {
	var body = _.pick(req.body, 'email', 'password')

	db.user.authenticate(body)
		.then(function(user) {
			var token = user.generateToken('authentication');

			if (token) {
				res.header('auth', token).json(user.toPublicJSON());
			} else {
				res.status(401).send();
			};
		}, function() {
			res.status(401).send();
		});
})

db.sequelize.sync({force = true}).then(function() {
	app.listen(PORT, function() {
		console.log('Express listening on port' + PORT + '!');
	});
});