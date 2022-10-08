const sql = require("../db.js");

// constructor
const CategoryInter = function (categoryInter) {
    this.productId = categoryInter.productId
    this.categoryId = categoryInter.categoryId
};

CategoryInter.initTable = (result) => {
    sql.query(
        "CREATE TABLE IF NOT EXISTS `categoryInter` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`productId` INT NOT NULL, "
        + "`categoryId` INT NOT NULL, "
        + "KEY `product_id` (`productId`),"
        + "KEY `category_id` (`categoryId`),"
        + "CONSTRAINT productCategory UNIQUE (productId, categoryId),"
        + "FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE, " 
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

CategoryInter.createMulti = (categoryInters, productId, result) => {
    if(!categoryInters.length){
        return result(null, true);
    }
    let vals = [] 
    let keys = []
    categoryInters.forEach(obj => {
        vals.push(obj.categoryId, productId)
        keys.push("(?, ?)")
    });

    sql.query(`INSERT IGNORE INTO categoryInter (categoryId, productId) VALUES ${keys.join()}`, vals, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

CategoryInter.findById = (id, result) => {
    sql.query("SELECT * FROM categoryInter WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        // not found CategoryInter with the id
        result({ kind: "not_found" }, null);
    });
};

CategoryInter.getAll = result => {
    sql.query("SELECT * FROM categoryInter", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

CategoryInter.updateMultiById = (categoryInter, result) => {
    let queries = []
    let vars = []
    Object.values(categoryInter).forEach((e)=>{
        queries.push("WHEN id=? THEN ?")
        vars.push(e.id, e.title)
    })
    sql.query(
        `UPDATE categoryInter SET title = CASE ${queries.join(" ")} ELSE title END`,
        vars,
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found CategoryInter with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, res);
        }
    );
};

CategoryInter.updateById = (id, title, result) => {
    sql.query(
        "UPDATE categoryInter SET title = ? WHERE id = ?",
        [title, id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found CategoryInter with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id, title });
        }
    );
};

CategoryInter.remove = (id, result) => {
    sql.query("DELETE FROM categoryInter WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found CategoryInter with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};


CategoryInter.removeByProductId = (id, result) => {
    sql.query("DELETE FROM categoryInter WHERE productId = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

CategoryInter.removeAll = result => {
    sql.query("DELETE FROM categoryInter", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = CategoryInter;