const languageConfig = require("../config/language.config.js");
const sql = require("./db.js");

// constructor
const Banner = function (banner) {
    this.image = banner.image
    this.imageSM = banner.imageSM
    this.link = banner.link
};


Banner.initTable = (result) => {
    
    let images = []
    languageConfig.forEach( e => {
        images.push(`image_${e.code} VARCHAR(200)`, `imageSM_${e.code} VARCHAR(200)`)
    })

    sql.query(
        "CREATE TABLE IF NOT EXISTS `banners` ("
        + "`id` INT PRIMARY KEY AUTO_INCREMENT, "
        + "`link` VARCHAR(50), "
        + images.join(", ") + ")",
        (err, res) => {
            if (err) {
                result(err, null);
                return;
            }
            sql.query(
                "CREATE TABLE IF NOT EXISTS `notifs` (`id` INT PRIMARY KEY AUTO_INCREMENT, `text` NVARCHAR(2000) )"
            , (err, res) => {
                if (err) {
                    result(err, null);
                    return;
                }
                sql.query(
                    "INSERT INTO notifs SET text = ''"
                , (err, res) => {
                    if (err) {
                        result(err, null);
                        return;
                    }

                    result(null, true);
                })
            })            
        }
    );
}

Banner.updateNotif = (text, result) => {
    sql.query("UPDATE notifs SET text = ?", text, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        var ret = {}

        try {
            ret = JSON.parse(text)
        } catch {}

        result(null, ret);
    });
}


Banner.getNotif = (result) => {
    sql.query("SELECT *  FROM notifs", (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        var ret = {}

        try {
            ret = JSON.parse(res[0].text)
        } catch {}

        result(null, ret);
    });
}

Banner.create = (result) => {
    sql.query("INSERT INTO banners SET link = NULL", (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, { id: res.insertId });
    });
};

Banner.getAll = result => {
    sql.query(`SELECT * FROM banners`, (err, res) => {
            if (err) {
                console.error(err)
                result(err, null);
                return;
            }

            result(null, res);
        }
    );
};

Banner.findById = (id, result) => {
    sql.query(`SELECT * FROM banners WHERE id = ?`, id, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }
        if (res.length) {
            result(null, res[0]);
            return;
        }

        // not found Banner with the id
        result({ kind: "not_found" }, null);
    });
};

Banner.updateById = (id, banner, result) => {
    sql.query(
        "UPDATE banners SET ? WHERE id = ?",
        [banner, id],
        (err, res) => {
            if (err) {
                console.error(err)
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Banner with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...banner });
        }
    );
};

Banner.remove = (id, result) => {
    sql.query("DELETE FROM banners WHERE id = ?", id, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Banner with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Banner;