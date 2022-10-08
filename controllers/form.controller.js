const Form = require("../models/form.model");

// Create and Save a new User
exports.create = (req, res) => {

    let form = new Form(req.body)

    if (req.body.id){
        form.id = req.body.id
    }

    Form.create(form, (err, data) => {
        if (err){
            console.error(err)
            return res.status(500).send({
                message: "Error creating Form"
            });
        }
        console.log(req.body.references)
        Form.createComments(data.id, req.body.references, (err, data) => {
            if (err){
                console.error(err)
                return res.status(500).send({
                    message: "Error creating Form Comments"
                });
            }   
            res.status(200).send(data)
        })
    })
};

// Get all Forms
exports.getAll = (req, res) => {

    Form.getAll(req.query, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Form"
            });
        
        res.status(200).send(data)
    })
};


// Get all Forms
exports.getComments = (req, res) => {

    Form.getComments(req.query.form_id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Form"
            });
        
        res.status(200).send(data)
    })
};


// Get all Forms
exports.getTeacherComments = (req, res) => {

    Form.getCommentsForTeacher(req.query.teacher_id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Form"
            });
        
        res.status(200).send(data)
    })
};


// Update a Form identified by the id
exports.update = (req, res) => {

    Form.remove(
        req.params.id,
        (err, data) => {
            if (err) {
                console.error(err)
                if (err.kind === "not_found") 
                    return res.status(404).send({
                        message: `Not found User with id ${req.decoded.id}.`
                    });
                return res.status(500).send({
                    message: "Error updating User with id " + req.params.id
                });
            }

            this.create(req, res)
        }
    );
};


// Update a Form identified by the id
exports.updateComment = (req, res) => {

    Form.updateComment(
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

// DELETE form by id
exports.delete = (req, res) => {

    Form.remove(req.params.id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Form"
            });
        
        res.status(200).send(data)
    })
};
