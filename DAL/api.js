const fs = require("fs")
const path = require("path")
const sgMail = require("@sendgrid/mail")
const db = require("../utils/dbConnection")

sgMail.setApiKey(process.env.EMAIL_KEY_SEND_GRID)




//users

async function register(userDetails) {
  const connector = await db
  const query = `select email from user
                  where email = ? `
  const [[emailRecived]] = await connector.query(query, [userDetails.email])

  if (!emailRecived) {
    const sql = "insert into user set ?"
    connector.query(sql, [userDetails], function (err) {
      if (err) throw err
    })
    return { status: "ok", message: "הרשמה בוצעה בהצלחה" }
  }
  return { status: "failed", message: "אימייל זה קיים במערכת" }
}


async function login(email, password) {
  const connector = await db
  const query = `select userId as id, firstName, lastName, email, admin, password
                  from user
                  where email = ? `

  const [[user]] = await connector.query(query, [email])

  if (!user) {
    return { status: "failed", message: "אימייל לא קיים במערכת" }

  } else {

    if (user.email === email && user.password === password) {
      const { password, ...userDetails } = user
      return { status: "ok", userDetails, message: "התחברות הצליחה" }
    }

    return { status: "failed", message: "סיסמא זו אינה נכונה" }

  }
}


async function updateDetails(
  { firstName, lastName, email, password },
  userId,
  userEmail
) {
  const connector = await db
  const query = `select email from user
                  where email = ? `
  const [[emailRecived]] = await connector.query(query, [email])

  if (!emailRecived || emailRecived.email === userEmail) {
    const sql = `update user set firstName = ?, lastName = ?, email = ?,password = ?
                  where userId = ?`
    connector.query(
      sql,
      [firstName, lastName, email, password, userId],
      function (err) {
        if (err) throw err
      }
    )
    return { status: "ok", message: "עדכון פרטים בוצעה בהצלחה" }
  }
  return { status: "failed", message: "אימייל זה קיים במערכת" }
}










//products

async function getProducts(isAdmin) {
  const connector = await db
  if (isAdmin) {
    const query =
      "select productId, name, size, price, image, active from products"
    const [products] = await connector.query(query)
    return products
  } else {
    const query = `select productId, name, size, price, image, active from products 
                   where active = ? `
    const [products] = await connector.query(query, [1])
    return products
  }
}

async function getProductId(id) {
  const connector = await db
  const query = `select productId, name, size, description, price, quantityImages, image, active, categoryId 
                from products where productId = ?`
  const [[product]] = await connector.query(query, [id])
  return product
}

async function addProduct(product) {
  const connector = await db
  const sql = "insert into products set ?"
  connector.query(sql, [product], function (err) {
    if (err) throw err
  })
  return { status: "ok", message: "מוצר חדש נוסף בהצלחה" }
}

async function editProduct({ productId, ...product }) {
  const connector = await db
  const sql = `update products 
               set ? 
               where productId = ?`
  connector.query(sql, [product, productId], function (err) {
    if (err) throw err
  })
  return { status: "ok", message: "עריכה בוצעה בהצלחה" }
}

async function getCategorys() {
  const connector = await db
  const query = "select categoryId, name from category"
  const [categorys] = await connector.query(query)
  return categorys
}

async function changeAcitveProduct(active, id) {
  const connector = await db
  const sql = "update products set active = ? where productId = ?"

  connector.query(sql, [active, id], function (err) {
    if (err) throw err
  })
  return { status: "ok", message: "שינוי פעילות המוצר בוצעה בהצלחה" }
}







// orders

async function sendNewOrder(
  { address, zip, phone },
  userId,
  totalPrice,
  products
) {
  const connector = await db
  const sql1 =
    "insert into address set userId = ? , address = ? , phone = ? , zip = ? "
  const addressId = await connector.query(
    sql1,
    [userId, address, phone, zip],
    function (err) {
      if (err) throw err
    }
  )

  const sql2 =
    "insert into orders set userId = ? , addressId = ? , totalPrice = ?"
  const orderId = await connector.query(
    sql2,
    [userId, addressId[0].insertId, totalPrice],
    function (err) {
      if (err) throw err
    }
  )

  for (let i = 0; i < products.length; i++) {
    const sql3 = "insert into orders_products set orderId = ? , productId = ?"
    const ordersProductsId = await connector.query(
      sql3,
      [orderId[0].insertId, products[i].productId],
      function (err) {
        if (err) throw err
      }
    )

    for (let j = 0; j < products[i].images.length; j++) {
      const sql4 =
        "insert into orders_images set ordersProductsId = ? , images = ?"
      connector.query(
        sql4,
        [ordersProductsId[0].insertId, products[i].images[j]],
        function (err) {
          if (err) throw err
        }
      )

      let currentPath = path.join(
        "public/",
        "imagesCart",
        `${products[i].images[j]}`
      )
      let destinationPath = path.join(
        "public/",
        "imagesOrders",
        `${products[i].images[j]}`
      )

      fs.rename(currentPath, destinationPath, function (err) {
        if (err) {
          throw err
        }
      })
    }
  }

  return {
    status: "ok",
    message: "ההזמנה בוצעה בהצלחה",
    orderId: orderId[0].insertId,
  }
}



async function sendOrderEmail(user, cart) {
  const totalPrice = cart.reduce((sum, item) => {
    return sum + item.price
  }, 0)
  const orderProducts = cart.map((product, index) => {
    return `<tr style="background-color: #9e9e9e;">
            <td style="border: 1px solid #dddddd; padding: 8px;">${
              index + 1
            }</td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${
              product.name
            }</td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${
              product.size
            } ס"מ</td>
            <td style="border: 1px solid #dddddd; padding: 8px;">${
              product.price
            } שח</td>
        </tr>`
  })

  const msg = {
    to: `${user.email}`,
    from: "neriaaa46@gmail.com",
    subject: "BLOCK PIC - Order Details",
    html: `<h1 style="width: 60%;">שלום ${user.firstName} ${user.lastName}</h1>
          <br>
          <table style="border-collapse: collapse; width: 60%;">
            <tr>
              <th style ="border: 1px solid #dddddd; padding: 8px;">מספר</th>
              <th style ="border: 1px solid #dddddd; padding: 8px;">שם</th>
              <th style ="border: 1px solid #dddddd; padding: 8px;">גודל</th>
              <th style ="border: 1px solid #dddddd; padding: 8px;">מחיר</th>
            </tr>
            ${[orderProducts]}
          </table>
          <br>
          <h3 style="width: 40%;">מחיר כולל ${totalPrice} שח</h3>`,
  }
  sgMail
    .send(msg)
    .then(() => {})
    .catch((error) => {
      console.error(error)
    })

  return { statusMail: "ok", message: "פרטי ההזמנה נשלחו אליך למייל" }
}


async function getOrdersByUser(userId) {
  const connector = await db
  const query1 = `select *
                from orders join user on orders.userId = user.userId
                join address on address.addressId = orders.addressId 
                join order_status on order_status.statusId = orders.statusId where orders.userId = ?`

  const query2 = `select orders_products.orderId, products.productId, products.name, products.size, products.quantityImages, products.price, products.image 
                from orders_products join products on orders_products.productId = products.productId
                where orders_products.orderId in (select orderId from orders where userId =?)`

  const [orderOfUser] = await connector.query(query1, [userId])
  const [productsOforder] = await connector.query(query2, [userId])

  addProductsToOrders(orderOfUser, productsOforder)
  return orderOfUser
}


async function getOrders() {
  const connector = await db
  const query1 = `select orders.orderId, user.userId, date, totalPrice, firstName, lastName, email, address, phone, zip, status
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
  addProductsToOrders(orders, products)
  return orders
}


async function searchOrdersBy(searchby, searchValue) {
  const connector = await db
  let query1, query2, query3

  if (searchby === "1") {
    query1 = `select orders.orderId, user.userId, date, totalPrice, firstName, lastName, email, address, phone, zip, status
          from orders join user on orders.userId = user.userId
          join address on address.addressId = orders.addressId 
          join order_status on order_status.statusId = orders.statusId
          where order_status.statusId = ?`

    query2 = `select orders_products.orderId, orders_products.ordersProductsId, products.productId, products.name, products.size, products.quantityImages, products.price, products.image 
            from orders_products join products on orders_products.productId = products.productId
            where orders_products.orderId in (select orderId from orders 
            join order_status on order_status.statusId = orders.statusId 
            where orders.statusId  =  ? ) ; `

    query3 = `select orders_images.ordersProductsId , orders_images.images
            from orders_images join orders_products on orders_products.ordersProductsId = orders_images.ordersProductsId
            join orders on orders_products.orderId = orders.orderId
            where orders.statusId  =  ?`

  } else if (searchby === "2") {
    query1 = `select orders.orderId, user.userId, date, totalPrice, firstName, lastName, email, address, phone, zip, status
            from orders join user on orders.userId = user.userId
            join address on address.addressId = orders.addressId 
            join order_status on order_status.statusId = orders.statusId
            where orders.orderId = ? `

    query2 = `select orders_products.orderId, orders_products.ordersProductsId, products.productId, products.name, products.size, products.quantityImages, products.price, products.image 
            from orders_products join products on orders_products.productId = products.productId
            where orders_products.orderId = ?`

    query3 = `select orders_images.ordersProductsId , orders_images.images
            from orders_images join orders_products on orders_products.ordersProductsId = orders_images.ordersProductsId
            where orders_products.orderId = ?`

  } else if (searchby === "3") {
    query1 = `select orders.orderId, user.userId, date, totalPrice, firstName, lastName, email, address, phone, zip, status
          from orders join user on orders.userId = user.userId
          join address on address.addressId = orders.addressId 
          join order_status on order_status.statusId = orders.statusId
          where email = ?`

    query2 = `select orders_products.orderId, orders_products.ordersProductsId, products.productId, products.name, products.size, products.quantityImages, products.price, products.image 
            from orders_products join products on orders_products.productId = products.productId
            join orders on orders.orderId = orders_products.orderId 
            join user on user.userId = orders.userId
            where email  =  ? `

    query3 = `select orders_images.ordersProductsId , orders_images.images
            from orders_images join orders_products on orders_products.ordersProductsId = orders_images.ordersProductsId
            join orders on orders_products.orderId = orders.orderId
            join user on user.userId = orders.userId
            where email  =  ?`
  }

  const [orders] = await connector.query(query1, [searchValue])
  const [products] = await connector.query(query2, [searchValue])
  const [imagesOfProduct] = await connector.query(query3, [searchValue])
  addImagesToProduct(products, imagesOfProduct)
  addProductsToOrders(orders, products)
  return orders
}


function addImagesToProduct(productsOforder, imagesOfProduct) {
  for (let i = 0; i < productsOforder.length; i++) {
    let imagesProduct = []
    for (let j = 0; j < imagesOfProduct.length; j++) {
      if (
        productsOforder[i].ordersProductsId ===
        imagesOfProduct[j].ordersProductsId
      ) {
        imagesProduct.push(imagesOfProduct[j].images)
      }
      productsOforder[i]["images"] = imagesProduct
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


async function updateStatusOrder(orderId, statusId) {
  const connector = await db
  const sql = `update orders set statusId = ? 
                where orderId = ? `
  connector.query(sql, [statusId, orderId], function (err) {
    if (err) throw err
  })
  return { status: "ok", message: "סטאטוס עודכן בהצלחה" }
}


async function getStatusOrder(orderId) {
  const connector = await db
  const query = `select status 
                 from orders 
                 join order_status on orders.statusId = order_status.statusId
                 where orders.orderId = ?`
  const [[statusOrder]] = await connector.query(query, [orderId])
  statusClassName = whichClassStatus(statusOrder.status)
  return statusClassName
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
  const connector = await db
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

async function getUsersRecommendations(isAdmin) {
  const connector = await db
  if (isAdmin) {
    const query = `select recommendationId, firstName, lastName, text , active
    from user 
    join recommendation on user.userId = recommendation.userId`
    const [recommendation] = await connector.query(query)
    return recommendation
    
  } else {
    const query = `select recommendationId, firstName, lastName, text , active
    from user 
    join recommendation on user.userId = recommendation.userId
    where active = ? `
    const [recommendation] = await connector.query(query, [1])
    return recommendation
  }
}

async function addRecommendation(text, userId) {
  const connector = await db
  const sql = "insert into recommendation set text = ? , userId = ?"

  connector.query(sql, [text, userId], function (err) {
    if (err) throw err
  })

  return { status: "ok", message: "קיבלנו את המלצתך תודה !" }
}

async function changeActiveRecommendation(recommendationId, active) {
  const connector = await db
  const sql = `update recommendation set active = ? 
              where recommendationId = ?`
  connector.query(sql, [active, recommendationId], function (err) {
    if (err) throw err
  })
  return { status: "ok" }
}

async function deleteRecommendation(recommendationId) {
  const connector = await db
  const sql = "delete from recommendation where recommendationId = ?"

  connector.query(sql, [recommendationId], function (err) {
    if (err) throw err
  })
  return { status: "ok", message: "המלצה נמחקה בהצלחה" }
}


/*contact us*/


async function contactUsEmail({
  firstName,
  lastName,
  email,
  phone,
  subject,
  text,
}) {

  const msg = {
    to: "neriaaa46@gmail.com",
    from: "neriaaa46@gmail.com",
    subject: `BLOCK PIC - ${subject}`,
    html: `<h1 style="width: 80%;">פנייה חדשה מ ${firstName} ${lastName}</h1>
          <br>
          <table style="border-collapse: collapse; width: 60%;">
            <tr>
              <th style ="border: 1px solid #dddddd; padding: 8px;">אימייל</th>
              <th style ="border: 1px solid #dddddd; padding: 8px;">טלפון</th>
              <th style ="border: 1px solid #dddddd; padding: 8px;">פרטי פנייה</th>
            </tr>
            <tr style="background-color: #9e9e9e;">
              <td style ="border: 1px solid #dddddd; padding: 8px;">${email}</td>
              <td style ="border: 1px solid #dddddd; padding: 8px;">${phone}</td>
              <td style ="border: 1px solid #dddddd; padding: 8px;">${text}</td>
            </tr>
          </table>`
  }
  sgMail
    .send(msg)
    .then(() => {})
    .catch((error) => {
      console.error(error)
    })

  return { status: "ok", message: "הפניה נשלחה בהצלחה" }
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
  sendOrderEmail,
  getOrders,
  searchOrdersBy,
  getStatusOrder,
  getLastUserAddress,
  getUsersRecommendations,
  changeActiveRecommendation,
  login,
  register,
  updateDetails,
  updateStatusOrder,
  addRecommendation,
  deleteRecommendation,
  contactUsEmail,
}
