const sql = require("../db.js");

// constructor
const CategoryTranslations = function (translation) {
    this.title = translation.title
    this.code = translation.code
    this.categoryId = translation.categoryId
};

CategoryTranslations.initTable = (result) => {
    sql.query(
        "CREATE TABLE IF NOT EXISTS `categoryTranslations` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`code` VARCHAR(2) DEFAULT NULL, "
        + "`categoryId` INT NOT NULL, "
        + "`title` NVARCHAR(45) NOT NULL, "
        + "KEY `translation_id` (`categoryId`),"
        + "KEY `language_code` (`code`), "
        + "FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE)", 
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            
            result(null, true);
        }
    );
}

CategoryTranslations.create = (newCategoryTranslation, result) => {
    sql.query("INSERT INTO categoryTranslations set ?", newCategoryTranslation, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, { id: res.insertId, ...newCategoryTranslation });
    });
};

CategoryTranslations.createMulti = (translations, categoryId, result) => {
    let vals = [] 
    let keys = []
    Object.keys(translations).forEach(element => {
        vals.push(element, translations[element], categoryId)
        keys.push("(?, ?, ?)")
    });

    sql.query(`INSERT INTO categoryTranslations (code, title, categoryId) VALUES ${keys.join()}`, vals, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

CategoryTranslations.findById = (id, result) => {
    sql.query("SELECT * FROM categoryTranslations WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        // not found CategoryTranslations with the id
        result({ kind: "not_found" }, null);
    });
};

CategoryTranslations.getAll = result => {
    sql.query("SELECT * FROM categoryTranslations", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

CategoryTranslations.updateMultiById = (categoryTranslations, result) => {
    let queries = []
    let vars = []
    Object.values(categoryTranslations).forEach((e)=>{
        queries.push("WHEN id=? THEN ?")
        vars.push(e.id, e.title)
    })
    sql.query(
        `UPDATE categoryTranslations SET title = CASE ${queries.join(" ")} ELSE title END`,
        vars,
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found CategoryTranslations with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, res);
        }
    );
};

CategoryTranslations.updateById = (id, title, result) => {
    sql.query(
        "UPDATE categoryTranslations SET title = ? WHERE id = ?",
        [title, id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found CategoryTranslations with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id, title });
        }
    );
};

CategoryTranslations.remove = (id, result) => {
    sql.query("DELETE FROM categoryTranslations WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found CategoryTranslations with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

CategoryTranslations.removeAll = result => {
    sql.query("DELETE FROM categoryTranslations", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

module.exports = CategoryTranslations;