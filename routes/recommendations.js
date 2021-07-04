var express = require('express');
var router = express.Router();


router.route("/")
  .get(function(req, res, next) {
    res.send()}) //get recommendations
  .post(function(req, res, next) {
    res.send()}) //add new recommendations
  
  
router.route("/:recommendationsId")
  .delete(function(req, res, next) {
    res.send()}) // delete recommendationsId
  
  
module.exports = router
