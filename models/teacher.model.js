const sql = require("./db.js");

// constructor
const Teachers = function (user) {
    this.name = user.name
    this.username = user.username
    this.password = user.password
};

Teachers.create = (newTeacher, result) => {
    console.log(newTeacher)
    sql.query("INSERT INTO teacher SET ?", newTeacher, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, { id: res.insertId, ...newTeacher });
    });
};

Teachers.getAll = (result) => {
    sql.query("SELECT * FROM teacher ORDER BY id DESC", (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, res);
    });
};


Teachers.getByUsernamePassword = ({username, password}, result) => {
    sql.query("SELECT name, id FROM teacher WHERE username = ?  AND password = ?", [username, password], (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        if (!res.length){
            result({kind: "not_found"}, null);
            return;
        }

        result(null, res[0]);
    });
};

Teachers.update = (id, user, result) => {
    sql.query(
        "UPDATE teacher SET ? WHERE id = ?",
        [user, id],
        (err, res) => {
            if (err) {
                console.error(err)
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Teachers with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...user });
        }
    );
};

Teachers.remove = (id, result) => {
    sql.query("DELETE FROM teacher WHERE id = ?", id, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Teachers with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Teachers;