const sql = require("../db.js");
const languages = require('../../config/language.config')

// constructor
const OrderProductInter = function (order) {
    this.orderId = order.orderId
    this.productId = order.productId
    this.price = order.price
    this.quantity = order.quantity
};

OrderProductInter.initTable = (result) => {
    sql.query(
        "CREATE TABLE IF NOT EXISTS `orderProductInter` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`orderId` INT NOT NULL, "
        + "`productId` INT NOT NULL, "
        + "`price` DOUBLE NOT NULL, "
        + "`quantity` INT NOT NULL, "
        + "KEY `order_id` (`orderId`), "
        + "FOREIGN KEY (orderId) REFERENCES orders(id) )", 
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            result(null, true);
        }
    );
}

OrderProductInter.createMulti = (orderId, orderInters, result) => {
    if (!orderInters.length){
        result(null, {});
        return;
    }
    let vals = [] 
    let keys = []
    orderInters.forEach(elem => {
        vals.push(
            orderId, 
            elem.id, 
            elem.price, 
            elem.quantity
        )
        keys.push("(?, ?, ?, ?)")
    });

    sql.query(`INSERT INTO orderProductInter (orderId, productId, price, quantity) VALUES 
                ${keys.join()}`, vals, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};


// OrderProductInter.findById = (orderId, result) => {
//     sql.query("SELECT * FROM `orders` WHERE id = ?", orderId, (err, res) => {
//         if (err) {
//             console.error("error: ", err);
//             result(err, null);
//             return;
//         }

//         if (res.length) {
//             result(null, res[0]);
//             return;
//         }

//         // not found OrderProductInter with the id
//         result({ kind: "not_found" }, null);
//     });
// };

// OrderProductInter.getAll = result => {
    
//     let imgQuery = `SELECT image FROM productImages WHERE productId = products.id ORDER BY priority DESC LIMIT 1`

//     sql.query(`
//             SELECT 
//                 DISTINCT(orders.id),
//                 users.phoneNumber, users.id as userId, users.firstName,
//                 address, orders.productId, orders.price, orders.originalPrice, orders.quantity, orders.status, orders.filterIds, orders.createdAt,
//                 pt.title as title,
//                 products.id as productDBId,
//                 (${imgQuery}) as image
//             FROM orders 
//             LEFT JOIN products ON products.id = orders.productId
//             LEFT JOIN productTranslations pt ON pt.productId = products.id AND pt.code = '${languages[0].code}'
//             LEFT JOIN users ON users.id = orders.userId
//             ORDER BY orders.createdAt DESC
//         `, (err, res) => {
//             if (err) {
//                 console.error("error: ", err);
//                 result(err, null);
//                 return;
//             }

//             result(null, res);
//         }
//     );
// };

// OrderProductInter.getUserOrderProductInters = (userId, result) => {
//     const noprod = {}
//     languages.forEach( e => noprod[e.code] = "[no longer exists]")

//     let imgQuery = `SELECT image FROM productImages WHERE productId = orders.productId ORDER BY priority DESC LIMIT 1`
    
//     const transQuery = ` 
//         SELECT 
//             CONCAT( '{',
//                 GROUP_CONCAT('"', code, '": ', IFNULL( CONCAT('"', title, '"'), 'null') ),
//             '}') as title
//         FROM productTranslations WHERE productId = orders.productId
//     `
//     sql.query(`
//             SELECT 
//                 orders.id, orders.productId, orders.price, orders.quantity, orders.status, orders.filterIds, orders.createdAt,
//                 (IFNULL((${transQuery}), '${JSON.stringify(noprod)}')) as title,
//                 (${imgQuery}) as image
//             FROM orders WHERE orders.userId = ? ORDER BY orders.createdAt DESC
//         `, userId, (err, res) => {
//             if (err) {
//                 console.error("error: ", err);
//                 result(err, null);
//                 return;
//             }

//             res.forEach( e => {
//                 try{
//                     e.filterIds = JSON.parse(e.filterIds)
//                 }catch(e){
//                 }
//                 try{
//                     e.title = JSON.parse(e.title)
//                 }catch(e){
//                 }
//             })

//             result(null, res);
//         }
//     );
// };

// OrderProductInter.updateById = (id, order, result) => {
//     sql.query(
//         "UPDATE orders SET updatedAt = CURRENT_TIMESTAMP, status = ? WHERE id = ?",
//         [order.status, id],
//         (err, res) => {
//             if (err) {
//                 console.error("error: ", err);
//                 result(err, null);
//                 return;
//             }

//             if (res.affectedRows == 0) {
//                 // not found OrderProductInter with the id
//                 result({ kind: "not_found" }, null);
//                 return;
//             }

//             result(null, { id: id, ...order });
//         }
//     );
// };

// OrderProductInter.cancelById = (id, result) => {
//     sql.query(
//         "UPDATE orders SET updatedAt = CURRENT_TIMESTAMP, status = -1 WHERE id = ?",
//         [id],
//         (err, res) => {
//             if (err) {
//                 console.error("error: ", err);
//                 result(err, null);
//                 return;
//             }

//             if (res.affectedRows == 0) {
//                 // not found OrderProductInter with the id
//                 result({ kind: "not_found" }, null);
//                 return;
//             }

//             result(null, { id: id });
//         }
//     );
// };

// OrderProductInter.remove = (id, result) => {
//     sql.query("DELETE FROM orders WHERE id = ?", id, (err, res) => {
//         if (err) {
//             console.error("error: ", err);
//             result(err, null);
//             return;
//         }

//         if (res.affectedRows == 0) {
//             // not found OrderProductInter with the id
//             result({ kind: "not_found" }, null);
//             return;
//         }

//         result(null, res);
//     });
// };

// OrderProductInter.removeAll = result => {
//     sql.query("DELETE FROM orders", (err, res) => {
//         if (err) {
//             console.error("error: ", err);
//             result(err, null);
//             return;
//         }

//         result(null, res);
//     });
// };

module.exports = OrderProductInter;
