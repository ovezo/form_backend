const sql = require("../db.js");
const languages = require("../../config/language.config")

// constructor
const ProductTranslations = function (translation) {
    this.title = translation.title
    this.description = translation.description
    this.code = translation.code
    this.productId = translation.productId
};

ProductTranslations.initTable = (result) => {
    sql.query(
        "CREATE TABLE IF NOT EXISTS `productTranslations` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`code` VARCHAR(2) DEFAULT NULL, "
        + "`productId` INT NOT NULL, "
        + "`title` NVARCHAR(100) NOT NULL, "
        + "`description` NVARCHAR(2000) DEFAULT NULL, "
        + "KEY `translation_id` (`productId`),"
        + "KEY `language_code` (`code`), "
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

ProductTranslations.create = (newProductTranslation, result) => {
    sql.query("INSERT INTO productTranslations set ?", newProductTranslation, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, { id: res.insertId, ...newProductTranslation });
    });
};

ProductTranslations.createMulti = (translations, productId, result) => {
    let vals = [] 
    let keys = []
    languages.forEach(elem => {
        vals.push(elem.code, productId, 
                    translations.title[elem.code], 
                    translations.description[elem.code],
                )
        keys.push("(?, ?, ?, ?)")
    });

    sql.query(`INSERT INTO productTranslations (code, productId, title, description) VALUES 
                ${keys.join()}`, vals, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

ProductTranslations.findById = (id, result) => {
    sql.query("SELECT * FROM productTranslations WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        // not found ProductTranslations with the id
        result({ kind: "not_found" }, null);
    });
};

ProductTranslations.getAll = result => {
    sql.query("SELECT * FROM productTranslations", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

ProductTranslations.updateMultiById = (productTranslations, result) => {
    let queries = []
    let vars = []
    Object.values(productTranslations).forEach((e)=>{
        queries.push("WHEN id=? THEN ?")
        vars.push(e.id, e.title)
    })
    sql.query(
        `UPDATE productTranslations SET title = CASE ${queries.join(" ")} ELSE title END`,
        vars,
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found ProductTranslations with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, res);
        }
    );
};

ProductTranslations.updateById = (id, title, result) => {
    sql.query(
        "UPDATE productTranslations SET title = ? WHERE id = ?",
        [title, id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found ProductTranslations with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id, title });
        }
    );
};

ProductTranslations.remove = (id, result) => {
    sql.query("DELETE FROM productTranslations WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found ProductTranslations with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

ProductTranslations.removeAll = result => {
    sql.query("DELETE FROM productTranslations", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = ProductTranslations;