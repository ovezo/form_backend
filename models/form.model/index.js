const sql = require("../db.js");

// constructor
const Form = function (form) {
    this.student_id = form.student_id
    this.assistant = form.assistant
    this.contacted_person = form.contacted_person
    this.met_person = form.met_person
    this.phone_number_person = form.phone_number_person
    this.date = form.date
    this.place = form.place
    this.purpose = form.purpose
    this.suggestion = form.suggestion
    this.transportation_fee = form.transportation_fee
};

Form.create = (newForm, result) => {
    sql.query("INSERT INTO form SET ?", newForm, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        result(null, { id: res.insertId, ...newForm });
    });
};

Form.createComments = (form_id, student_reviews, result) => {
    if (!student_reviews.length){
        result(null, true)
        return
    }
    let vals = [] 
    let keys = []
    student_reviews.forEach(element => {
        vals.push(form_id, element.subject, element.teacher_id, element.description)
        keys.push("(?, ?, ?, ?)")
    });

    sql.query(`INSERT INTO student_review (form_id, subject, teacher_id, description) VALUES ${keys.join()}`, vals, (err, res) => {
        if (err) {
            console.error("error: ", err);
            result(err, null);
            return;
        }

        result(null, res);
    });
};

Form.getAll = (query, result) => {
    sql.query("SELECT * FROM form WHERE ? ORDER BY createdAt DESC", query, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }

        result(null, res);
    });
};


Form.getCommentsForTeacher = (teacher_id, result) => {
    sql.query(`
        SELECT 
            student_review.id, subject, student_review.description,
            student.name as student,
            class.title as class,
            teacher.name as class_teacher,
            t2.name as teacher
        FROM student_review 
        LEFT JOIN form ON form.id = student_review.form_id
        LEFT JOIN student ON student.id = form.student_id
        LEFT JOIN class ON class.id = student.class_id
        LEFT JOIN teacher ON teacher.id = class.teacher_id
        LEFT JOIN teacher t2 ON t2.id = student_review.teacher_id
        ${teacher_id ? `WHERE student_review.teacher_id = '${teacher_id}'` : ""} ORDER BY createdAt DESC
        `, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }

        result(null, res);
    });
};


Form.getComments = (form_id, result) => {
    sql.query(`
        SELECT student_review.*, teacher.name as teacher FROM student_review 
        INNER JOIN teacher ON teacher.id = student_review.teacher_id
        WHERE form_id = ?
    `, form_id, (err, res) => {
        if (err) {
            console.error(err)
            result(err, null);
            return;
        }

        result(null, res);
    });
};

Form.update = (id, form, result) => {
    sql.query(
        "UPDATE form SET ? WHERE id = ?",
        [form, id],
        (err, res) => {
            if (err) {
                console.error(err)
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Form with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...form });
        }
    );
};

Form.updateComment = (id, form, result) => {
    sql.query(
        "UPDATE student_review SET ? WHERE id = ?",
        [form, id],
        (err, res) => {
            if (err) {
                console.error(err)
                result(err, null);
                return;
            }

            if (res.affectedRows == 0) {
                // not found Form with the id
                result({ kind: "not_found" }, null);
                return;
            }

            result(null, { id: id, ...form });
        }
    );
};

Form.remove = (id, result) => {
    sql.query("DELETE FROM form WHERE id = ?", id, (err, res) => {
        if (err) {
            result(err, null);
            return;
        }

        if (res.affectedRows == 0) {
            // not found Form with the id
            result({ kind: "not_found" }, null);
            return;
        }

        result(null, res);
    });
};

module.exports = Form;