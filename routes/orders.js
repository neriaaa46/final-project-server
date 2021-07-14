const {getOrdersByUser, getOrders, getStatusOrder, getLastUserAddress, updateStatusOrder, sendNewOrder} = require("../DAL/api") 
const {validationInupts} = require("../DAL/Middleware") 
const {addressValidation} = require("../DAL/validation") 

var express = require('express');
var router = express.Router();


  router.route("/")
  .get(async function(req, res, next) {
  try{
      const {ordersUser,statusOrder,userAddress} = req.query

      if(ordersUser){
        const order = await getOrdersByUser(ordersUser)
        res.json(order)

      } else if(statusOrder){
        const status = await getStatusOrder(statusOrder)
        res.json(status)

      } else if(userAddress){
        const address = await getLastUserAddress(userAddress)
        res.json(address)

      } else {
        const orders = await getOrders()
        res.json(orders)
      }
  }
  catch(error){
    res.send(error.message)
  }
})


  .post(validationInupts(addressValidation), async function(req, res, next) {
    try{
      const [orderCompletionDetails, userId, totalPrice, products] = req.body
      const sendNewOrderResponse = await sendNewOrder(orderCompletionDetails, userId, totalPrice, products)
      res.json(sendNewOrderResponse)
    }
    catch(error){
      console.log(error.message);
      res.send({status:"failed", message:"שגיאת מערכת בהוספת הזמנה"})
    }
  }) // new order




  .put(async function(req, res, next) {
    try{
      const [orderId, statusId] = req.body
      const statusResponse = await updateStatusOrder(orderId, statusId)
      res.json(statusResponse)
    }
    catch(error){
      console.log(error.mesage)
      res.json({status:"failed", message:"שגיאת מערכת בעדכון סטאטוס הזמנה"})
    }
     
      
    res.send()}) // edit status
  
  
  



module.exports = router