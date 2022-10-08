const Student = require("../models/student.model.js");

// Create and Save a new User
exports.create = (req, res) => {

    let student = new Student(req.body)

    Student.create(student, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error cerating Student"
            });
        
        res.status(200).send(data)
    })
};

// Get all Students
exports.getAll = (req, res) => {

    Student.getAll(req.query.class_id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Student"
            });
        
        res.status(200).send(data)
    })
};

// Get Student
exports.getById = (req, res) => {

    Student.getById(req.params.id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Student"
            });
        
        res.status(200).send(data)
    })
};
// Update a Student identified by the id
exports.update = (req, res) => {

    Student.update(
        req.params.id,
        req.body,
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") 
                    return res.status(404).send({
                        message: `Not found User with id ${req.decoded.id}.`
                    });
                return res.status(500).send({
                    message: "Error updating User with id " + req.params.id
                });
            }

            res.status(200).send(data)
        }
    );
};

// DELETE student by id
exports.delete = (req, res) => {

    Student.remove(req.params.id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Student"
            });
        
        res.status(200).send(data)
    })
};
