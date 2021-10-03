const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/imagesCart/`)
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype === 'image/jpeg' ? 'jpg' : 'png'}`)
  }
})

const upload = multer({storage:storage})
const ordersProductImages = upload.array('image',5)


router.route("/")
  .post(ordersProductImages,async function(req, res, next) {
    try{
        const imagesName = []
        const imagesOrder = req.files
        for(let i = 0 ; i < imagesOrder.length; i++){
            imagesName.push(imagesOrder[i].filename)
        }
        res.json({status:"ok", images: imagesName})
    }
    catch(error){
      console.log(error.message);
      res.json({status:"failed", message:"שגיאת מערכת בהעלת הקבצים"})
    }
  })
  
module.exports = router