// External module imports
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const expressValidator = require('express-validator')
// Node & Express imports
const createError = require('http-errors');

// App imports
const winston = require('./config/winston');
const sectionsRoutes = require('./routes/sections');
const tasksRoutes = require('./routes/tasks');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');

// Application
const app = express();

// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares - body-parser
app.use(bodyParser.json());

// Middlewares - express-validator
app.use(expressValidator());

// Middlewares - morgan - Apache format
app.use(morgan('combined', { stream: winston.stream }));

// Database
mongoose.Promise = global.Promise;
mongoose
    .connect('mongodb://user:password@mongo_host:27017/db_name', { useNewUrlParser: true })
    .then(db => console.log("Connected to DB"))
    .catch(err => console.log(err));

// Routes
app.use('/sections', sectionsRoutes);
app.use('/tasks', tasksRoutes);
app.use('/users', usersRoutes);
app.use('/auth', authRoutes);

// Error handlers
app.use(function(req, res, next) {
    next(createError(404));
});
app.use(function(err, req, res, next) {
    // Set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // This line to include winston logging
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
  
    // Response with the error
    res.status(err.status || 500);
    res.json({ error: err });
});

// Start the server
app.listen(app.get('port'), () => {
    console.log('Started server on port ', app.get('port'));
});
