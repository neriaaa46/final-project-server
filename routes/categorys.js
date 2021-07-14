const {getCategorys} = require("../DAL/api") 
var express = require('express');
var router = express.Router();


router.route("/")
  .get(async function(req, res, next) {
    try{
      const categorys = await getCategorys()
      res.json(categorys)
    }
    catch(error){
      console.log(error.message);
      res.send(error.message)
    }
  })
  
module.exports = router