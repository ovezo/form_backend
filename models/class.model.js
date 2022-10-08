const sql = require("./db.js");

// constructor
const Class = function (mClass) {
    this.title = mClass.title
    this.teacher_id = mClass.teacher_id
};

Class.create = (newClass, result) => {
    sql.query("INSERT INTO class SET ?", newClass, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, { id: res.insertId, ...newClass });
    });
};

Class.getAll = (teacher_id, result) => {
    sql.query(`SELECT * FROM class ${teacher_id ? `WHERE teacher_id = '${teacher_id}'` : ""} ORDER BY id DESC`, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, res);
    });
};

Class.update = (id, mClass, result) => {
    sql.query(
        "UPDATE class SET ? WHERE id = ?",
        [mClass, id],
        (err, res) => {
            if (err) {
                console.error(err)
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Class with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...mClass });
        }
    );
};

Class.remove = (id, result) => {
    sql.query("DELETE FROM class WHERE id = ?", id, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Class with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Class;