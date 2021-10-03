const {getOrdersByUser, getOrders, getStatusOrder, getLastUserAddress, updateStatusOrder, sendNewOrder, searchOrdersBy} = require("../DAL/api") 
const {validationInupts, validateCookieUser, validateCookieAdmin} = require("../utils/Middleware") 
const {addressValidation} = require("../utils/validation") 

var express = require('express')
var router = express.Router()


  router.route("/")
  .get(validateCookieUser, async function(req, res, next) {
  try{
      const {ordersUser,statusOrder,userAddress} = req.query
      const {admin} = req.cookies

      if(admin&&statusOrder){
        const status = await getStatusOrder(statusOrder)
        res.json(status)

      } else if(admin&&!statusOrder){
        const orders = await getOrders()
        res.json(orders)

      }else if(ordersUser){
        const order = await getOrdersByUser(ordersUser)
        res.json(order)
        
      } else {
        const address = await getLastUserAddress(userAddress)
        res.json(address)
      }
    
  }
  catch(error){
    res.send(error.message)
  }
})

  .post(validateCookieUser, validationInupts(addressValidation), async function(req, res, next) {
    try{
      const [orderCompletionDetails, userId, totalPrice, products] = req.body
      const sendNewOrderResponse = await sendNewOrder(orderCompletionDetails, userId, totalPrice, products)
      res.json(sendNewOrderResponse)
    }
    catch(error){
      console.log(error.message);
      res.send({status:"failed", message:"שגיאת מערכת בביצוע הזמנה"})
    }
  }) // new order


  .put(validateCookieAdmin, async function(req, res, next) {
    try{
      const [orderId, statusId] = req.body
      const statusResponse = await updateStatusOrder(orderId, statusId)
      res.json(statusResponse)
    }
    catch(error){
      console.log(error.mesage)
      res.json({status:"failed", message:"שגיאת מערכת בעדכון סטאטוס הזמנה"})
    }
  }) // edit status
  
  
  router.route("/search")
  .post(validateCookieAdmin, async function(req, res, next) {
  try{
      const [searchby, searchValue] = req.body
      const searchResponse = await searchOrdersBy(searchby, searchValue)
      res.json(searchResponse)
  }
  catch(error){
    res.send(error.message)
  }
})
module.exports = router