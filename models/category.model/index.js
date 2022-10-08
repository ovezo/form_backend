const sql = require("../db.js");

// constructor
const Categories = function (category) {
    this.parentId = category.parentId
    this.image = category.image
    this.priority = category.priority
    this.isVisible = category.isVisible
    this.type = category.type
};

Categories.initTable = (result) => {
    sql.query(
        "CREATE TABLE IF NOT EXISTS `categories` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`parentId` INT DEFAULT NULL, "
        + "`image` VARCHAR(100) DEFAULT NULL, "
        + "`priority` INT NOT NULL DEFAULT 100, "
        + "`isVisible` TINYINT NOT NULL DEFAULT 1, "
        + "`type` TINYINT NOT NULL DEFAULT 0, "
        + "FOREIGN KEY (parentId) REFERENCES categories(id) ON DELETE CASCADE)", 
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            
            result(null, true);
        }
    );
}

Categories.create = (newCategories, result) => {
    sql.query("INSERT INTO categories SET ?", newCategories, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, { id: res.insertId, ...newCategories });
    });
};

Categories.findById = (categoryId, result) => {
    var trans = []
    var cols = []
    var joins = []
    languages.forEach((e)=>{
        trans.push(`translation.title_${e.code}, translation.id_${e.code}`)
        cols.push(`ct_${e.code}.title_${e.code}, ct_${e.code}.id_${e.code}`)
        joins.push(`INNER JOIN (SELECT id AS id_${e.code}, categoryId, title AS title_${e.code} FROM categoryTranslations WHERE code = "${e.code}") ct_${e.code} ON ct_${e.code}.categoryId = ct.categoryId`)
    })
    sql.query( `SELECT DISTINCT(categories.id), categories.priority, image, parentId, isVisible, type, ${trans.join()} FROM categories LEFT JOIN ( 
                    SELECT ct.categoryId, ${cols.join()} FROM categoryTranslations ct ${joins.join(" ")}
                ) translation ON translation.categoryId = categories.id WHERE categories.id = ?;`,        
    categoryId, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.length) {
            result(null, res[0]);
            return;
        }

        // not found Categories with the id
        result({ kind: "not_found" }, null);
    });
};

Categories.getAll = result => {
    var trans = []
    var cols = []
    var joins = []
    languages.forEach((e)=>{
        trans.push(`translation.title_${e.code}, translation.id_${e.code}`)
        cols.push(`ct_${e.code}.title_${e.code}, ct_${e.code}.id_${e.code}`)
        joins.push(`INNER JOIN (SELECT id AS id_${e.code}, categoryId, title AS title_${e.code} FROM categoryTranslations WHERE code = "${e.code}") ct_${e.code} ON ct_${e.code}.categoryId = ct.categoryId`)
    })

    let totalQuery = `(SELECT COUNT(productId) FROM categoryInter LEFT JOIN products ON productId = products.id WHERE categoryId = categories.id AND products.inStock > 0)`

    sql.query( `SELECT 
                    DISTINCT(categories.id), 
                    categories.priority, 
                    image, 
                    parentId, 
                    type, 
                    ${totalQuery} as total,
                    ${trans.join()} 
                FROM categories 
                LEFT JOIN ( 
                    SELECT ct.categoryId, ${cols.join()} FROM categoryTranslations ct ${joins.join(" ")}
                ) translation ON translation.categoryId = categories.id 
                
                WHERE isVisible = 1 ORDER BY priority DESC;`, 
    (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};


Categories.getAllForAdmin = result => {
    var trans = []
    var cols = []
    var joins = []
    languages.forEach((e)=>{
        trans.push(`translation.title_${e.code}, translation.id_${e.code}`)
        cols.push(`ct_${e.code}.title_${e.code}, ct_${e.code}.id_${e.code}`)
        joins.push(`INNER JOIN (SELECT id AS id_${e.code}, categoryId, title AS title_${e.code} FROM categoryTranslations WHERE code = "${e.code}") ct_${e.code} ON ct_${e.code}.categoryId = ct.categoryId`)
    })
    sql.query( `SELECT DISTINCT(categories.id), categories.priority, image, parentId, type, isVisible, ${trans.join()} FROM categories LEFT JOIN ( 
                    SELECT ct.categoryId, ${cols.join()} FROM categoryTranslations ct ${joins.join(" ")}
                ) translation ON translation.categoryId = categories.id ORDER BY priority DESC;`, 
    (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};


Categories.updateById = (id, categoryObj, result) => {
    sql.query(
        "UPDATE categories SET ? WHERE id = ?",
        [categoryObj, id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Categories with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated category: ", { id: id, ...categoryObj });
            result(null, { id: id, ...categoryObj });
        }
    );
};

Categories.remove = (id, result) => {
    sql.query("DELETE FROM categories WHERE id = ?", id, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Categories with the id
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("deleted category with id: ", id);
        result(null, res);
    });
};

Categories.removeAll = result => {
    sql.query("DELETE FROM categories", (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        console.log(`deleted ${res.affectedRows} categories`);
        result(null, res);
    });
};

module.exports = Categories;