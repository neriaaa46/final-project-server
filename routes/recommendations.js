const {getUsersRecommendations, addRecommendation, deleteRecommendation, changeActiveRecommendation} = require("../DAL/api") 
const {validationInupts, validateCookieUser, validateCookieAdmin} = require("../utils/Middleware") 
const {recommendationValidation} = require("../utils/Middleware") 

var express = require('express');
var router = express.Router();


router.route("/")
  .get(async function(req, res, next) {
    const recommendations = await getUsersRecommendations(false)
    res.json(recommendations)}) //get recommendations
    

  .post(validateCookieUser, validationInupts(recommendationValidation), async function(req, res, next) {
    try{
      [{text}, userId] = req.body
      const addRecommendationResponse = await addRecommendation(text, userId)
      res.send(addRecommendationResponse)

    }catch (error){
      console.log(error.message)
      res.send({status:"failed", message:"שגיאת מערכת בהוספת המלצה"})
    }
  })

  .put(validateCookieAdmin, async function(req, res, next) {
    try{
      [recommendationId, active] = req.body
      const changeRecommendationResponse = await changeActiveRecommendation(recommendationId, active)
      res.send(changeRecommendationResponse)

    }catch (error){
      console.log(error.message)
      res.send({status:"failed", message:"שגיאת מערכת בעדכון פעילות"})
    }
  })

  .delete(validateCookieAdmin, async function(req, res, next){
    try{
      const [userDetails, recommendationId] = req.body
      const deleteRecommendationResponse = await deleteRecommendation(recommendationId)
      res.send(deleteRecommendationResponse)
    }
    catch(error){
      console.log(error)
      res.send({status:"failed", message: "שגיאת מערכת המלצה לא נמחקה"})
    }
  })

  router.route("/admin")
  .get(validateCookieAdmin, async function(req, res, next) {
    const recommendations = await getUsersRecommendations(true)
    res.json(recommendations)
  }) //get recommendations
  
  
  
module.exports = router
