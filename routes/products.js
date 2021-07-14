const {getProducts, getProductId, addProduct, changeAcitveProduct, editProduct} = require("../DAL/api") 
const express = require('express');
const router = express.Router();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `public/imagesProduct/`)
  },
  filename: function (req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}.${file.mimetype === 'image/jpeg' ? 'jpg' : 'png'}`)
  }
})

const upload = multer({storage:storage})
const productImageUplod = upload.single('product')




  router.route("/")
  .get(async function(req, res, next) {
    try{
      const products = await getProducts(false)
      res.json(products)
    }
    catch(error){
      res.send(error.message)
    }
  })

  
  .post(productImageUplod, async function(req, res, next) {
    try{
      const product = req.body
      product["image"] = `${req.file.filename}`
      const addProductResponse = await addProduct(product)
      res.send(addProductResponse)
    }
    catch(error){
      console.log(error.message)
      res.send({status:"failed", message: "שגיאת מערכת בהוספת מוצר"})
    }
  })
  
  .put(productImageUplod, async function(req, res, next) {
    try{
      const product = req.body
      if(req.file){
        product["image"] = `${req.file.filename}`
      }
      const editProductResponse = await editProduct(product)
      res.send(editProductResponse)
    }
    catch(error){
      console.log(error.message)
      res.send({status:"failed", message: "שגיאת מערכת בעריכת מוצר"})
    }
   })


    router.get("/admin", async function(req, res, next) {
      try{
        const products = await getProducts(true)
        res.json(products)
      }
      catch(error){
        console.log(error.message);
        res.send(error.message)
      }
    })
  

  router.route("/:id")
  .get(async function(req, res, next) {
    try{
      const {id} = req.params
      const product = await getProductId(id)
      res.json(product)
    }
    catch(error){
      console.log(error.message);
      res.send(error.message)
    }
  })

  .put(async function(req, res, next) {
      try{
        const {active} = req.body
        const {id} = req.params
        const activeProductResponse = await changeAcitveProduct(!active, id)
        res.json(activeProductResponse)
      }
      catch(error){
        console.log(error.message)
        res.send({status:"failed", message: "שגיאת מערכת בשינוי פעילות המוצר"})
      }
    })


module.exports = router