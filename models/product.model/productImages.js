const sql = require("../db.js");

// constructor
const ProductImages = function (productImage) {
    this.productId = productImage.productId
    this.image = productImage.image
    this.priority = productImage.priority
};

ProductImages.initTable = (result) => {
    sql.query(
        "CREATE TABLE IF NOT EXISTS `productImages` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`productId` INT NOT NULL, "
        + "`image` VARCHAR(100) NOT NULL, "
        + "`priority` INT DEFAULT 0, "
        + "KEY `product_id` (`productId`), "
        + "FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE)",
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            
            result(null, true);
        }
    );
}

ProductImages.create = (result) => {
    sql.query("INSERT INTO productImages VALUES (NULL)", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, { id: res.insertId});
    });
};

ProductImages.createMulti = (images, productId, result) => {
    if(!images.length){
        return result(null, true);
    }
    let vals = [] 
    let keys = []
    images.forEach(obj => {
        vals.push(productId, 
                    obj.image,
                    obj.priority                
                )
        keys.push("(?, ?, ?)")
    });

    sql.query(`INSERT INTO productImages (productId, image, priority) 
                VALUES ${keys.join()}`, vals, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

ProductImages.removeByProductId = (id, result) => {
    sql.query("DELETE FROM productImages WHERE productId = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

ProductImages.remove = (id, result) => {
    sql.query("DELETE FROM productImages WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found ProductImages with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

ProductImages.removeAll = result => {
    sql.query("DELETE FROM productImages", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = ProductImages;