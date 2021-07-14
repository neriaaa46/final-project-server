const { query } = require("express")
const fs = require("fs")
const path = require("path")
const mysql = require("mysql2/promise")
const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "465691",
  database: "project_store",
})



//users

async function register(userDetails) {
  const connector = await con
  const query = `select email from user
                  where email = ? `
  const [[emailRecived]] = await connector.query(query, [userDetails.email])

  if (!emailRecived) {
    const sql = "insert into user set ?"
    connector.query(sql, [userDetails], function (err) {
      if (err) throw err
    })
    return {status:"ok", message:"הרשמה בוצעה בהצלחה"}
  }
  return {status:"failed", message:"אימייל זה קיים במערכת"}
}


async function login(email, password) {
  const connector = await con
  const query = `select userId as id, firstName, lastName, email, admin, password
                  from user
                  where email = ? `
  const [[user]] = await connector.query(query, [email])

  if (!user) {
    return {status:"failed", message:"אימייל לא קיים במערכת"}

  } else {

    if (user.email === email && user.password === password) {
      const {password, ...userDetails} = user
      return {status:"ok", userDetails, message:"התחברות הצליחה"}
    }
    return  {status:"failed", message:"סיסמא זו אינה נכונה"}
  }
}


async function updateDetails({firstName, lastName, email, password}, userId, userEmail) {
  const connector = await con
  const query = `select email from user
                  where email = ? `
  const [[emailRecived]] = await connector.query(query, [email])
 
  if (!emailRecived || emailRecived.email === userEmail) {
  
    const sql = `update user set firstName = ?, lastName = ?, email = ?,password = ?
                  where userId = ?`
    connector.query(sql, [firstName, lastName, email, password, userId], function (err) {
      if (err) throw err
    })
    return {status:"ok", message:"עדכון פרטים בוצעה בהצלחה"}
  } 
  return {status:"failed", message:"אימייל זה קיים במערכת"}
}






//products

async function getProducts(isAdmin) {
  const connector = await con 
  if(isAdmin){
    const query = "select productId, name, size, price, image, active from products"
    const [products] = await connector.query(query)
    return products

  } else{
    const query = `select productId, name, size, price, image, active from products 
                   where active = ? `
    const [products] = await connector.query(query, [1])
    return products
  }
}

async function getProductId(id) {
  const connector = await con
  const query =`select productId, name, size, description, price, quantityImages, image, active, categoryId 
                from products where productId = ?`
  const [[product]] = await connector.query(query, [id])
  return product
}

async function addProduct(product){
  const connector = await con
  const sql = "insert into products set ?"
  connector.query(sql, [product], function (err) {
      if (err) throw err
    })
    return {status:"ok", message:"מוצר חדש נוסף בהצלחה"}
}


async function editProduct({productId, ...product}){
  const connector = await con
  const sql = `update products 
               set ? 
               where productId = ?`
  connector.query(sql, [product, productId], function (err) {
      if (err) throw err
    })
    return {status:"ok", message:"מוצר חדש התעדכן בהצלחה"}
}

async function getCategorys(){
  const connector = await con
  const query = "select categoryId, name from category"
  const [categorys] = await connector.query(query)
  return categorys
}

async function changeAcitveProduct(active, id){
  const connector = await con
  const sql = "update products set active = ? where productId = ?"

  connector.query(sql, [active, id], function (err) {
    if (err) throw err
  })
  return {status:"ok", message:"שינוי פעילות המוצר בוצעה בהצלחה"}
}





// orders

async function sendNewOrder({address, zip, phone} , userId, totalPrice, products){
  const connector = await con
  const sql1 = "insert into address set userId = ? , address = ? , phone = ? , zip = ? "
  const addressId = await connector.query(sql1, [userId, address, phone, zip], function (err) {
      if (err) throw err
    })

  const sql2 = "insert into orders set userId = ? , addressId = ? , totalPrice = ?"
  const orderId =  await connector.query(sql2, [userId, addressId[0].insertId, totalPrice], function (err) {
      if (err) throw err
    })

    for(let i = 0 ; i < products.length ; i++ ){
      const sql3 = "insert into orders_products set orderId = ? , productId = ?"
      const ordersProductsId = await connector.query(sql3, [orderId[0].insertId,products[i].productId], function (err) {
        if (err) throw err 
      })
      
        for(let j = 0 ; j < products[i].images.length ; j++){
          const sql4 = "insert into orders_images set ordersProductsId = ? , images = ?"
          connector.query(sql4, [ordersProductsId[0].insertId,  products[i].images[j]], function (err) {
          if (err) throw err 
          })

          let currentPath = path.join("C:/Users/נריה/Desktop/project-store/server/public/", "imagesOrders", `${products[i].images[j]}`)
          let destinationPath = path.join("C:/Users/נריה/Desktop/project-store/server/public/", "imagesDataBase", `${products[i].images[j]}`)

          fs.rename(currentPath, destinationPath, function (err) {
              if (err) {
                  throw err
              } else {
                  console.log("Successfully moved the file!");
              }
          });
        }
  } 

  return {status:"ok", message:"ההזמנה בוצעה בהצלחה"}
}



async function getOrdersByUser(userId) {
  const connector = await con
  const query1 =`select *
                from orders join user on orders.userId = user.userId
                join address on address.addressId = orders.addressId 
                join order_status on order_status.statusId = orders.statusId where orders.userId = ?`

  const query2 = `select orders_products.orderId, products.productId, products.name, products.size, products.quantityImages, products.price, products.image 
                from orders_products join products on orders_products.productId = products.productId
                where orders_products.orderId  in (select orderId from orders where userId =?)`

  const [orderOfUser] = await connector.query(query1, [userId])
  const [productsOforder] = await connector.query(query2, [userId])

  addProductsToOrders(orderOfUser, productsOforder)
  return orderOfUser
}


async function getOrders() {
  const connector = await con
  const query1 =`select orders.orderId, user.userId, date, totalPrice, firstName, lastName, email, address, phone, zip, status
                from orders join user on orders.userId = user.userId
                join address on address.addressId = orders.addressId 
                join order_status on order_status.statusId = orders.statusId`

  const query2 = `select orders_products.orderId, orders_products.ordersProductsId, products.productId, products.name, products.size, products.quantityImages, products.price, products.image 
                from orders_products join products on orders_products.productId = products.productId
                where orders_products.orderId in (select orderId from orders)`

  const query3 = `select orders_images.ordersProductsId , orders_images.images
                 from orders_images join orders_products on orders_products.ordersProductsId = orders_images.ordersProductsId`

  const [orders] = await connector.query(query1)
  const [products] = await connector.query(query2)
  const [imagesOfProduct] = await connector.query(query3)

  addImagesToProduct(products, imagesOfProduct)
  addProductsToOrders(orders, products, imagesOfProduct)
  return orders
}

function addImagesToProduct(productsOforder, imagesOfProduct){
  for(let i = 0 ; i < productsOforder.length ; i++){
    let imagesProduct = []
    for (let j = 0; j < imagesOfProduct.length; j++) {

      if (productsOforder[i].ordersProductsId === imagesOfProduct[j].ordersProductsId) {
        imagesProduct.push(imagesOfProduct[j].images)
      }
      productsOforder[i]["imagesProduct"] = imagesProduct
    }
  }
}

function addProductsToOrders(orders, productsOforder) {

  for (let i = 0; i < orders.length; i++) {
    let product = []
    for (let j = 0; j < productsOforder.length; j++) {
      if (orders[i].orderId === productsOforder[j].orderId) {
        product.push(productsOforder[j])
      }
    }
    orders[i]["products"] = product
  }

}



async function updateStatusOrder(orderId, statusId){
  const connector = await con
  const sql = `update orders set statusId = ? 
                where orderId = ? `
  connector.query(sql, [statusId, orderId], function (err) {
    if (err) throw err
  })
  return {status:"ok", message:"סטאטוס עודכן בהצלחה"}
}

async function getStatusOrder(orderId) {
  const connector = await con
  const query = `select status 
                 from orders 
                 join order_status on orders.statusId = order_status.statusId
                 where orders.orderId = ?`
  const [[statusOrder]] = await connector.query(query, [orderId])
  status = whichClassStatus(statusOrder.status)
  return status
}

function whichClassStatus(status) {
  switch (status) {
    case "ממתין":
      status = "pending"
      break
    case "בהכנה":
      status = "inProgress"
      break
    case "מוכן":
      status = "ready"
      break
    case "נשלח":
      status = "sent"
      break
    default:
      status = "pending"
      break
  }
  return status
}

async function getLastUserAddress(userId) {
  const connector = await con
  const query = `select address, phone, zip 
                from orders 
                join address on orders.userId = address.userId
                where orders.userId = ? 
                order by date desc 
                limit 1`
  const [[address]] = await connector.query(query, [userId])
  return address
}






// recommendations

async function getUsersRecommendations() {
  const connector = await con
  const query = `select recommendationId, firstName, lastName, text 
                  from user 
                  join recommendation on user.userId = recommendation.userId`
  const [recommendation] = await connector.query(query)
  console.log(recommendation);
  return recommendation
}

async function addRecommendation(text, userId){
  const connector = await con
  const sql = "insert into recommendation set text = ? , userId = ?"

  connector.query(sql, [text, userId], function (err) {
    if (err) throw err
  })

  return {status:"ok", message:"המלצה נוספה בהצלחה"}
} 

async function deleteRecommendation(recommendationId){
  const connector = await con
  const sql = "delete from recommendation where recommendationId = ?"

  connector.query(sql, [recommendationId], function (err) {
    if (err) throw err
  })
  return {status:"ok", message:"המלצה נמחקה בהצלחה"}
}

module.exports = {
  getProducts,
  getProductId,
  addProduct,
  editProduct,
  changeAcitveProduct,
  getCategorys,
  getOrdersByUser,
  sendNewOrder,
  getOrders,
  getStatusOrder,
  getLastUserAddress,
  getUsersRecommendations,
  login,
  register,
  updateDetails,
  updateStatusOrder,
  addRecommendation,
  deleteRecommendation, 
}
