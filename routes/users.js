var express = require('express');
var router = express.Router();


router.route("/")
  .get(function(req, res, next) {
    res.send()}) //get users
  .post(function(req, res, next) {
    res.send()}) //add new user
  
router.route("/:userId")
  .get(function(req, res, next) {
    res.send()}) // get user by id
  .put(function(req, res, next) {
    res.send()}) // edit user details
  

module.exports = router;
