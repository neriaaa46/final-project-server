var express = require('express');
var router = express.Router();


  router.route("/")
  .get(function(req, res, next) {
    res.send()}) // all orders
  .post(function(req, res, next) {
    res.send()}) // new order
  

  router.route("/:ordersId")
  .get(function(req, res, next) {
    res.send()}) // order of user
  .put(function(req, res, next) {
    res.send()}) // edit status
  

module.exports = router