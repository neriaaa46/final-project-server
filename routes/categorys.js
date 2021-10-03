const {getCategorys} = require("../DAL/api") 
const {validateCookieAdmin} = require("../DAL/Middleware") 

var express = require('express');
var router = express.Router();


router.route("/")
  .get(validateCookieAdmin, async function(req, res, next) {
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