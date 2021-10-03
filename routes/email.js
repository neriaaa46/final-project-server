const express = require("express")
const router = express.Router()
const {validationInupts, validateCookieUser} = require("../DAL/Middleware") 
const {contactUsValidation} = require("../DAL/validation") 
const { sendOrderEmail, contactUsEmail } = require("../DAL/api")

router.route("/")
.post(validateCookieUser, async function (req, res, next) {
  try {
    const [user, cart] = req.body
    const responseEmail = await sendOrderEmail(user, cart)
    res.json(responseEmail)

  } catch (error) {
    console.log(error.message)
    res.json({statusMail:"failed", message:"שגיאת מערכת בשליחת אימייל"})
  }
})

router.route("/contact")
.post(validationInupts(contactUsValidation), async function (req, res, next) {
  try {
    const [contactUsDetails] = req.body
    const responseEmail = await contactUsEmail(contactUsDetails)
    res.json(responseEmail)

  } catch (error) {
    console.log(error.message)
    res.json({statusMail:"failed", message:"שגיאת מערכת בשליחת אימייל"})
  }
})

module.exports = router
