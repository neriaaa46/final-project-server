const {login,register,updateDetails} = require("../DAL/api") 
const {validationInupts, validateCookieUser} = require("../DAL/Middleware") 
const {userValidation, loginValidation} = require("../DAL/validation") 
var express = require('express');
var router = express.Router();


router.route("/")
  .post(validationInupts(userValidation),async function(req, res, next) {
    try{
      const [{confirmPassword,...user}] = req.body
      const registerResponse = await register(user)
      res.json(registerResponse)

    }catch(error){
      console.log(error.message)
      res.json({status:"failed", message:"שגיאת מערכת בהרשמה לאתר"})
    }
  }) // register

    
  .put(validateCookieUser, validationInupts(userValidation),async function(req, res, next) {
    try{
      const [detailsUpdate, userId, userEmail] = req.body
      const updateResponse = await updateDetails(detailsUpdate, userId, userEmail)
      res.json(updateResponse)

    }catch(error){
      console.log(error.message)
      res.json({status:"failed", message:"שגיאת מערכת בעדכון פרטים"})
    }
    res.send()}) // update user details
  



router.route("/login")
  .post(validationInupts(loginValidation),async function(req, res, next) {
    try{
      const [{email, password}] = req.body
      const loginResponse = await login(email, password)
      
      if(loginResponse.userDetails.admin===1){
        res.cookie('admin', `${loginResponse.userDetails.admin}`)
        res.cookie('user', `${loginResponse.userDetails.id}`)
      } else {
        res.cookie('user', `${loginResponse.userDetails.id}`)
      }
      res.json(loginResponse)

    }catch(error){
      console.log(error.message)
      res.json({status:"failed", message:"שגיאת מערכת בהתחברות לאתר"})
    }
  }) // login


module.exports = router
