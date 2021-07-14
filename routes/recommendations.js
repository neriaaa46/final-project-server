const {getUsersRecommendations, addRecommendation, deleteRecommendation} = require("../DAL/api") 
const {validationInupts, checkAdminUser} = require("../DAL/Middleware") 
const {recommendationValidation} = require("../DAL/validation") 

var express = require('express');
var router = express.Router();


router.route("/")
  .get(async function(req, res, next) {
    const recommendations = await getUsersRecommendations()
    res.json(recommendations)}) //get recommendations
    

  .post(validationInupts(recommendationValidation), async function(req, res, next) {
    try{
      [{text}, userId] = req.body
      const addRecommendationResponse = await addRecommendation(text, userId)
      res.send(addRecommendationResponse)

    }catch (error){
      console.log(error.message)
      res.send({status:"failed", message:"שגיאת מערכת בהוספת המלצה"})
    }
  })

  .delete(checkAdminUser, async function(req, res, next){
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
  
  
module.exports = router
