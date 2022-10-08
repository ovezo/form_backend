const Class = require("../models/class.model.js");

// Create and Save a new User
exports.create = (req, res) => {

    let mClass = new Class(req.body)

    Class.create(mClass, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error cerating Class"
            });
        
        res.status(200).send(data)
    })
};

// Get all Classs
exports.getAll = (req, res) => {

    Class.getAll(req.query.teacher_id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Class"
            });
        
        res.status(200).send(data)
    })
};

// Update a Class identified by the id
exports.update = (req, res) => {

    Class.update(
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

// DELETE mClass by id
exports.delete = (req, res) => {

    Class.remove(req.params.id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Class"
            });
        
        res.status(200).send(data)
    })
};
