const sql = require("./db.js");

// constructor
const Student = function (student) {
    this.name = student.name
    this.class_id = student.class_id
};

Student.create = (newStudent, result) => {
    sql.query("INSERT INTO student SET ?", newStudent, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, { id: res.insertId, ...newStudent });
    });
};

Student.getAll = (class_id, result) => {
    sql.query("SELECT * FROM student WHERE class_id = ? ORDER BY id DESC", class_id, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, res);
    });
};

Student.getById = (id, result) => {
    sql.query(`
        SELECT name, class.id, class.title, teacher.id, teacher.title
         FROM student WHERE id = ?
        INNER JOIN class ON class.id = student.class_id
        INNER JIN teacher ON teacher.id = class.teacher_id 
        `, id, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, res);
    });
};


Student.update = (id, student, result) => {
    sql.query(
        "UPDATE student SET ? WHERE id = ?",
        [student, id],
        (err, res) => {
            if (err) {
                console.error(err)
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Student with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...student });
        }
    );
};

Student.remove = (id, result) => {
    sql.query("DELETE FROM student WHERE id = ?", id, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Student with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Student;