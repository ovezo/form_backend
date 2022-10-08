const Teacher = require("../models/teacher.model.js");
const adminconf = require("../config/admin.config")

// Create and Save a new User
exports.create = (req, res) => {

    let teacher = new Teacher(req.body)

    Teacher.create(teacher, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error cerating Teacher"
            });
        
        res.status(200).send(data)
    })
};

// Get all Teachers
exports.getAll = (req, res) => {

    Teacher.getAll((err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Teacher"
            });
        
        res.status(200).send(data)
    })
};

// Update a Teacher identified by the id
exports.update = (req, res) => {

    Teacher.update(
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

// DELETE teacher by id
exports.delete = (req, res) => {

    Teacher.remove(req.params.id, (err, data) => {
        if (err)
            return res.status(500).send({
                message: "Error retrieving Teacher"
            });
        
        res.status(200).send(data)
    })
};

// admin login
exports.adminLogin = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(401).send({
            message: "Content can not be empty!"
        });
        return;
    }

    console.log("Admin login: ", req.body, new Date())

    if (req.body.username===adminconf.username && req.body.password===adminconf.password){
        return res.status(200).send({username: adminconf.username})
    }

    Teacher.getByUsernamePassword(req.body, (err, data) => {
        if (err){
            if (err.kind){
                return res.status(403).send({message: "username or password is incorrect."})   
            }    
            return res.status(500).send({
                message: "Error retrieving Teacher"
            });
        }
        res.status(200).send(data)
    })
    
}
