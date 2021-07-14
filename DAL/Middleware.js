const { validation } = require("./validation")
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/images/`)
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype === 'image/jpeg' ? 'jpg' : 'png'}`)
  }
})

const upload = multer({storage:storage})
const cpUpload = upload.single('product')



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


function checkAdminUser(req, res, next){
    [userDetails] = req.body
    if(userDetails.admin === 1){
        next()
    } else {
        res.json({status:"failed", message:"משתמש לא חוקי"})
    }
}


module.exports = {validationInupts, checkAdminUser, cpUpload}