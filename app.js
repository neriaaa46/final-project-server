const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const ordersRouter = require('./routes/orders');
const recommendationsRouter = require('./routes/recommendations');
const categorysRouter = require('./routes/categorys');
const imagesRouter = require('./routes/images');

const app = express();
const cors = require("cors");
app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/recommendations', recommendationsRouter);
app.use('/categorys', categorysRouter);
app.use('/images', imagesRouter);


const mysql = require('mysql2');

    const con = mysql.createConnection({
      host: "localhost",
      user: "root",
      password: "465691",
      database: "project_store"
    })
    
    con.connect(function(err) {
      if (err) throw err;
      console.log("Connected!");
    });

module.exports = app;
