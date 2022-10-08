const sql = require("../db.js");
const languages = require('../../config/language.config')

// constructor
const Order = function (order) {
    this.userId = order.userId
    this.address = order.address
    this.phoneNumber = order.phoneNumber
    this.name = order.name
    this.email = order.email
    this.order_comment = order.order_comment
    this.payment = product.payment // null: cash, else: credit
};

Order.initTable = (result) => {
    sql.query(
        "CREATE TABLE IF NOT EXISTS `orders` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`userId` INT DEFAULT NULL, "
        + "`phoneNumber` VARCHAR(12) DEFAULT NULL, "
        + "`address` NVARCHAR(200) DEFAULT NULL, "
        + "`payment` NVARCHAR(500), "
        + "`order_comment` NVARCHAR(500), "
        + "`name` NVARCHAR(50) DEFAULT NULL, "
        + "`email` NVARCHAR(50) DEFAULT NULL, "
        + "`status` TINYINT NOT NULL DEFAULT 1, "
        + "`createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
        + "`updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "
        + "KEY `user_id` (`userId`), "
        + "FOREIGN KEY (userId) REFERENCES users(id) )", 
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            result(null, true);
        }
    );
}

Order.create = (newOrder, result) => {
    sql.query(`INSERT INTO orders SET createdAt=${+new Date()}, ?`, newOrder, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }
        result(null, {...newOrder, id: res.insertId });
    });
};

Order.findById = (orderId, result) => {
    sql.query("SELECT * FROM `orders` WHERE id = ?", orderId, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        // not found Order with the id
        result({ kind: "not_found" }, null);
    });
};


Order.getAll = result => {
    
    let imgQuery = `SELECT image FROM productImages WHERE productId = orderProductInter.productId ORDER BY priority DESC LIMIT 1`
    let titleQuery = `SELECT title FROM productTranslations WHERE productId = orderProductInter.productId AND code = "${languages[0].code}"`
    
    let productsQuery = `
        SELECT 
            CONCAT('[', 
                GROUP_CONCAT(
                    '{"id": ', productId,', ', 
                    '"price": ', IFNULL(price, 'null'),', ',
                    '"image": "', IFNULL((${imgQuery}), 'null'),'", ',
                    '"title": "', IFNULL((${titleQuery}), 'null'),'", ',
                    '"quantity": ', IFNULL(quantity, 'null'), '}'
                ),
                "]"
            ) as products
        FROM orderProductInter 
        WHERE orders.id = orderId 
        GROUP BY orderId`
    
    sql.query(`
            SELECT 
                DISTINCT(orders.id),
                orders.*, 
                (${productsQuery}) as products
            FROM orders 
            ORDER BY orders.createdAt DESC
        `, (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            console.log(res)
            
            res.forEach( e => {
                console.log(e)
                try {
                    e.products = JSON.parse(e.products)
                } catch(e){
                    console.error(e)
                }
            })

            result(null, res);
        }
    );
};


Order.getById = (id, result) => {
    
    let imgQuery = `SELECT image FROM productImages WHERE productId = orderProductInter.productId ORDER BY priority DESC LIMIT 1`
    let titleQuery = `SELECT title FROM productTranslations WHERE productId = orderProductInter.productId AND code = "${languages[0].code}"`
    
    let productsQuery = `
        SELECT 
            CONCAT('[', 
                GROUP_CONCAT(
                    '{"id": ', productId,', ', 
                    '"price": ', IFNULL(price, 'null'),', ',
                    '"image": "', IFNULL((${imgQuery}), 'null'),'", ',
                    '"title": "', IFNULL((${titleQuery}), 'null'),'", ',
                    '"quantity": ', IFNULL(quantity, 'null'), '}'
                ),
                "]"
            ) as products
        FROM orderProductInter 
        WHERE orders.id = orderId 
        GROUP BY orderId`
    
    sql.query(`
            SELECT 
                DISTINCT(orders.id),
                orders.*, 
                (${productsQuery}) as products
            FROM orders 
            WHERE id = ?
            ORDER BY orders.createdAt DESC
        `, id, (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }
            
            res.forEach( e => {
                console.log(e)
                try {
                    e.products = JSON.parse(e.products)
                } catch(e){
                    console.error(e)
                }
            })

            result(null, res[0]);
        }
    );
};

Order.getUserOrders = (userId, result) => {
    const noprod = {}
    languages.forEach( e => noprod[e.code] = "[no longer exists]")

    let imgQuery = `SELECT image FROM productImages WHERE productId = orders.productId ORDER BY priority DESC LIMIT 1`
    
    const transQuery = ` 
        SELECT 
            CONCAT( '{',
                GROUP_CONCAT('"', code, '": ', IFNULL( CONCAT('"', title, '"'), 'null') ),
            '}') as title
        FROM productTranslations WHERE productId = orders.productId
    `
    sql.query(`
            SELECT 
                orders.id, orders.productId, orders.price, orders.quantity, orders.status, orders.filterIds, orders.createdAt,
                (IFNULL((${transQuery}), '${JSON.stringify(noprod)}')) as title,
                (${imgQuery}) as image
            FROM orders WHERE orders.userId = ? ORDER BY orders.createdAt DESC
        `, userId, (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            res.forEach( e => {
                try{
                    e.filterIds = JSON.parse(e.filterIds)
                }catch(e){
                }
                try{
                    e.title = JSON.parse(e.title)
                }catch(e){
                }
            })

            result(null, res);
        }
    );
};

Order.updateById = (id, order, result) => {
    sql.query(
        "UPDATE orders SET updatedAt = CURRENT_TIMESTAMP, status = ? WHERE id = ?",
        [order.status, id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Order with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...order });
        }
    );
};

Order.cancelById = (id, result) => {
    sql.query(
        "UPDATE orders SET updatedAt = CURRENT_TIMESTAMP, status = -1 WHERE id = ?",
        [id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Order with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id });
        }
    );
};

Order.remove = (id, result) => {
    sql.query("DELETE FROM orders WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Order with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

Order.removeAll = result => {
    sql.query("DELETE FROM orders", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Order;