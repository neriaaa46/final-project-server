const { validation } = require("./validation")


function validationInupts(objectValidation){

    return function (req, res, next) {

        const [dataValidation,...others] = req.body
        
        let inValid = false
        for (const key in objectValidation) {
            objectValidation[key].value = dataValidation[key]
            if(validation(dataValidation[key],key,objectValidation)) {
                inValid = true
            }
        } 
        if(inValid){
            res.json({status:"failed", inputValidation: objectValidation})
        } else {
            next()
        }
    }
}

function validateCookieUser(req, res, next){
    const {cookies} = req

    if("user" in cookies){
        next()

      } else {
        res.json({status: "failed", message: "Unauthorized"})
      }
}

function validateCookieAdmin(req, res, next){
    const {cookies} = req
    if("admin" in cookies){
        next()

      } else {
        res.json({status: "failed", message: "Unauthorized"})
      }
}


module.exports = {validationInupts, validateCookieUser, validateCookieAdmin}