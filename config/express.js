const express = require('express');
const handlebars = require('express-handlebars');
// const bodyParser = require('body-parser');
const routes = require('../routes')
const cookieParser = require('cookie-parser');

module.exports = (app) => {

    //TODO: Setup the view engine
    app.engine('.hbs', handlebars({
        extname: '.hbs'
    }));
    app.set('view engine', '.hbs');
    //TODO: Setup the body parser
    app.use(express.urlencoded({ extended: true })); //to recognize req.body in post request
    app.use(cookieParser());

    //TODO: Setup the static files
    app.use('/static', express.static('static'));
    app.use('/', routes);
};