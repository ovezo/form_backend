const sql = require("../db.js");
const languages = require('../../config/language.config');

// constructor
const Products = function (product) {
    this.id = product.id
    this.price = product.price
    this.salePrice = product.salePrice
    this.priority = product.priority
    this.quantity = product.quantity
};

Products.initTable = (result) => {
    sql.query('SET SESSION group_concat_max_len = 99999999', (err, res)=>{
        if (err) {
            result(err, null);
            return;
        }
        sql.query(
            "CREATE TABLE IF NOT EXISTS `products` ("
            + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
            + "`createdAt` DATETIME DEFAULT CURRENT_TIMESTAMP, "
            + "`quantity` INT NOT NULL DEFAULT 0, "
            + "`views` INT NOT NULL DEFAULT 0, "
            + "`price` DOUBLE NOT NULL, "
            + "`inStock` TINYINT NOT NULL DEFAULT 0, "
            + "`salePrice` DOUBLE DEFAULT NULL, "
            + "`priority` INT DEFAULT 100)", 
            (err, res) => {
                if (err) {
                    result(err, null);
                    return;
                }

                result(null, true);
            }
        );
    });
}

Products.create = (newProducts, result) => {
    sql.query("INSERT INTO products SET ?", newProducts, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, { ...newProducts, id: res.insertId });
    });
};

Products.getBasicInfoByIds = (ids, result) => {
    if (!ids.length)
    {
        result(null, []);
        return;
    }
    sql.query("SELECT * FROM products WHERE id in (?)", [ids], (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

Products.findById = (productId, result) => {
    const transQuery = ` 
        SELECT 
            CONCAT( '{',
                GROUP_CONCAT('"', code, '": {',
                    '"title": ', IFNULL( CONCAT('"', title, '"'), 'null'), ',',
                    '"description": ', IFNULL( CONCAT('"', description, '"'), 'null'),
                '}'), 
            '}') as translation
        FROM productTranslations WHERE productId = products.id
    `

    const imageQuery = `
        SELECT 
            CONCAT('[', 
                GROUP_CONCAT(
                    '{"priority": ', IF( priority IS NULL, '0', priority),', ', 
                    '"image": ', IF( image IS NULL, 'null', CONCAT('"',image,'"')), '}'
                ),
                "]"
            ) as images
        FROM productImages WHERE productImages.productId = products.id GROUP BY productImages.productId
    `

    const categoryQuery = `
        SELECT 
            CONCAT("[", GROUP_CONCAT(categoryId), "]") as categories
        FROM categoryInter WHERE productId = products.id GROUP BY productId
    `
    
    sql.query( `SELECT 
                    (${imageQuery}) as images,
                    (${transQuery}) as translation,
                    (${categoryQuery}) as categories,
                    products.*
                FROM products 
                WHERE products.id = ?;`,        
        productId, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        res.forEach( e => {
            e.categories = JSON.parse(e.categories)
            e.translation = JSON.parse(e.translation.replace(/\n/g, "\\n"))
            e.images = JSON.parse(e.images)
        })

        if (res.length) {
            console.log(res[0])
            result(null, res[0]);
            return;
        }

        // not found Products with the id
        result({ kind: "not_found" }, null);
    });
};

Products.findAllByCategory = (categoryIds, sort, skip, limit, result) => {
    const transQuery = ` 
        SELECT 
            CONCAT( '{',
                GROUP_CONCAT('"', code, '": {',
                    '"title": ', IFNULL( CONCAT('"', title, '"'), 'null'), ',',
                    '"description": ', IFNULL( CONCAT('"', description, '"'), 'null'),
                '}'), 
            '}') as translation
        FROM productTranslations WHERE productId = products.id
    `

    const imageQuery = `
        SELECT 
            CONCAT('[', 
                GROUP_CONCAT(
                    '{"priority": ', IF( priority IS NULL, '0', priority),', ', 
                    '"image": ', IF( image IS NULL, 'null', CONCAT('"',image,'"')), '}'
                ),
                "]"
            ) as images
        FROM productImages WHERE productImages.productId = products.id GROUP BY productImages.productId
    `

    const categoryQuery = `
        SELECT 
            CONCAT("[", GROUP_CONCAT(categoryId), "]") as categories
        FROM categoryInter WHERE productId = products.id GROUP BY productId
    `

    sql.query( `SELECT 
                    DISTINCT(products.id),
                    (${imageQuery}) as images,
                    (${transQuery}) as translation,
                    (${categoryQuery}) as categories,
                    IFNULL(salePrice, price) as sortPrice,
                    products.*
                FROM products 
                RIGHT JOIN categoryInter ON categoryInter.productId = products.id
                WHERE products.inStock > 0 AND categoryInter.categoryId in (?)
                ORDER BY ${sort.column} ${sort.direction}, createdAt
                LIMIT ${Number(limit||100)} OFFSET ${Number(skip||0)};`,        
            [categoryIds], (err, res) => {
                if (err) {
                    console.error("error: ", err);
                    result(err, null);
                    return;
                }

                finalRes = res.filter( (e, i) => {
                    try{
                        e.categories = JSON.parse(e.categories)
                        e.translation = JSON.parse(e.translation.replace(/\n/g, "\\n"))
                        e.images = JSON.parse(e.images) || []
                        return true
                    }catch(err){
                        console.log("Find all by category Json Parse error", e)
                        console.error(err)
                        return false;
                    }
                })

                sql.query(`
                    SELECT COUNT(id) as total FROM categoryInter 
                    WHERE categoryInter.categoryId in (?)
                `, [categoryIds], (err, totalRes) => {

                    if (err) {
                        console.error("error: ", err);
                        result(err, null);
                        return;
                    }

                    totalRes[0].products = finalRes
                    result(null, totalRes[0]);
                    return;

                })
            }
    );
};

Products.findAllForAdmin = (categoryIds, sort, skip, limit, search, result) => {

    const categoryQuery = `
        SELECT 
            CONCAT("[", GROUP_CONCAT(categoryId), "]") as categories
        FROM categoryInter WHERE productId = products.id GROUP BY productId
    `

    let varArr = []

    let categoryFilter = ""
    if (categoryIds && categoryIds.length){
        categoryFilter = "AND categoryInter.categoryId in (?)"
        varArr.push(categoryIds)
    }

    let searchWhere = ""
    if (search){
        searchWhere = "AND (products.id LIKE ? OR translations.title LIKE ?)"
        varArr.push("%"+search+"%", "%"+search+"%")
    }



    sql.query( `SELECT 
                    DISTINCT(products.id),
                    (${categoryQuery}) as categories,
                    IFNULL(salePrice, price) as sortPrice,
                    (SELECT image FROM productImages WHERE productImages.productId = products.id ORDER BY priority DESC LIMIT 1) as image, 
                    translations.title,
                    products.*
                FROM products 
                LEFT JOIN productTranslations translations ON translations.productId = products.id 
                RIGHT JOIN categoryInter ON categoryInter.productId = products.id
                WHERE translations.code = "${languages[0].code}" ${categoryFilter} ${searchWhere}
                ORDER BY ${sort.column} ${sort.direction}, createdAt
                LIMIT ${Number(limit||150)} OFFSET ${Number(skip||0)};`,        
            varArr, (err, res) => {
                if (err) {
                    console.error("error: ", err);
                    result(err, null);
                    return;
                }

                res.forEach( e => {
                    e.categories = JSON.parse(e.categories)
                })
                result(null, res);
                return;
            }
    );
};

Products.getImages = (productId, result) => {
    sql.query( `SELECT image FROM productImages WHERE productId = ?`, productId, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
}

Products.getImagesOfProducts = (ids, result) => {
    sql.query( `
        SELECT image FROM productImages 
        LEFT JOIN products ON products.id = productImages.productId
        WHERE products.id in (?) OR products.originalId in (?)`, [ids, ids], (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
}

Products.updateById = (id, productObj, result) => {
    sql.query(
        "UPDATE products SET ? WHERE id = ?",
        [productObj, id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Products with the id
                result({ kind: "not_found" }, null);
                return;
            }

            console.log("updated product: ", { id: id, ...productObj });
            result(null, { id: id, ...productObj });
        }
    );
};


Products.incView = (id, result) => {
    sql.query(
        "UPDATE products SET view = view+1 WHERE id = ?",
        [productObj, id],
        (err, res) => {
            if (err) {
                console.error("error: ", err);
                result(err, null);
                return;
            }

            console.log("viewed product: "+id);
            result(null, { id: id });
        }
    );
};

Products.remove = (id, result) => {
    sql.query("DELETE FROM products WHERE id = ?", [id], (err, res, fields) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Products with the id
            result({ kind: "not_found" }, null);
            return;
        }

        console.log("deleted product with id: ", id);
        result(null, res);
    });
};

Products.removeArray = (ids, result) => {
    sql.query("DELETE FROM products WHERE id in (?) OR originalId in (?)", [ids, ids], (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        console.log("deleted product with ids: ", ids);
        result(null, res);
    });
};

module.exports = Products;