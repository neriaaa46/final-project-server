const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const productsRouter = require('./routes/products')
const ordersRouter = require('./routes/orders')
const recommendationsRouter = require('./routes/recommendations')
const categorysRouter = require('./routes/categorys')
const imagesRouter = require('./routes/images')
const emailRouter = require('./routes/email')
const db = require("./utils/dbConnection")

const app = express();
const cors = require("cors");

app.use(cors({
  credentials: true,
  origin: 'http://localhost:3000'
}))


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/orders', ordersRouter);
app.use('/recommendations', recommendationsRouter);
app.use('/categorys', categorysRouter);
app.use('/images', imagesRouter);
app.use('/email', emailRouter);


db.getConnection(function(err, connection){
  if(err){
      return cb(err);
  }
  connection.changeUser({database: 'project_store'});
  connection.query("SELECT * from user", function(err, data){
      connection.release();
      cb(err, data);
  });
});

module.exports = app;
