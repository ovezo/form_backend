const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const jwtconf = require('../config/jwt.config');

const Category = require("../models/category.model");
const Translation = require("../models/category.model/translation");

const helpers = require('./_helpers')

// Initiate categories table
Category.initTable((err, res)=>{
    if (err)
        throw(err)
    else
        console.log("Table CATEGORIES ready to use!")
})

// Initiate CategoryTranslations table
Translation.initTable((err, res)=>{
    if (err)
        throw(err)
    else
        console.log("Table CATEGORYTRANSLATIONS ready to use!")
})

// Create and Save a new Category
exports.create = (req, res) => {
    // Authanticate request if Admin
    // if (!req.decoded || !req.decoded.isAdmin) {
    //     return res.status(401).send({
    //         message: "Unauthorized!"
    //     });
    // }
    
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    let filePath;
    if (req.file)
        filePath = req.file.filename;

    const category = new Category({
        parentId: req.body.parentId,
        priority: req.body.priority,
        image: filePath,
        type: req.body.type,
        isVisible: req.body.isVisible
    });

    let titleObj = JSON.parse(req.body.title)
    if (Object.keys(titleObj).length){
        Category.create(category, (err, data) => {
            if (err)
                res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the Category."
                });
            else {
                try{
                    Translation.createMulti(titleObj, data.id, (err, succ)=>{
                        if (err)
                            res.status(500).send({
                                message:
                                    err.message || "Some error occurred while creating the Category."
                            });
                        else{
                            req.params.id = data.id
                            this.findById(req, res)
                        }
                    })
                } 
                catch (e){
                    res.send(500).send({message: e.message})
                }
            }
        });
    }else{
        res.status(500).send({
            message:
                "Title can't be empty."
        });
    }
};


// Log in a Category with a phoneNumber and password
exports.findById = (req, res) => {
    var id = req.params.id;

    Category.findById(id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Category with id ${id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Category with id " + id
                });
            }
        } else {
            res.status(200).send(data)
        }
    });
};


// Retrieve all Categories from the database.
exports.findAll = (req, res) => {
    Category.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving categories."
            });
        else {
            res.send(data);
        }
    });
};


// Retrieve all Categories for Admin from the database.
exports.findAllForAdmin = (req, res) => {
    Category.getAllForAdmin((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving categories."
            });
        else {
            res.send(data);
        }
    });
};


// Update a Category Image identified by the id in the request
exports.updateImage = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    let id = req.body.id
    if (!req.body || !id) {
        return res.status(400).send({
            message: "Category Id is required!"
        });
    }

    Category.findById(id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Category with id ${id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Category with id " + id
                });
            }
        } else {
            let filePath;
            if (req.file)
                filePath = req.file.filename;
            if (data.image)
                helpers.deleteFile(data.image);
            Category.updateById(
                id,
                {image: filePath}
                ,
                (err, data) => {
                    if (err) {
                        if (err.kind === "not_found") {
                            res.status(404).send({
                                message: `Not found Category with id ${id}.`
                            });
                        } else {
                            res.status(500).send({
                                message: "Error updating Category with id " + id
                            });
                        }
                    }
                    else {
                        res.status(200).send({message: "Success!"})
                    }
                }
            );
        }
    });
};


// Update a Category identified by the id in the request
exports.updateTitle = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    // Validate Request
    if (!req.body || !req.body.title || !req.body.id) {
        return res.status(400).send({
            message: "Title and id is required"
        });
    }
        
    Translation.updateById(req.body.id, req.body.title, (err, data)=>{
        if (err){
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving categories."
            });
        }else{
            res.status(200).send(data)
        }
    })
};


// Update a Translation identified by the id in the request body
exports.update = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    let id = req.params.id
    // Validate Request
    if (!req.body || !id) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Category.findById(id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                return res.status(404).send({
                    message: `Not found Category with id ${id}.`
                });
            } else {
                return res.status(500).send({
                    message: "Error retrieving Category with id " + id
                });
            }
        } else {
            Category.updateById(
                id,
                req.body,
                (err, data) => {
                    if (err) {
                        if (err.kind === "not_found") {
                            res.status(404).send({
                                message: `Not found Category with id ${id}.`
                            });
                        } else {
                            res.status(500).send({
                                message: "Error updating Category with id " + id
                            });
                        }
                    }
                    else {
                        req.params.id = id
                        this.findById(req, res)
                    }
                }
            );
        }
    });
};

// Delete a Category with the specified categoryId in the request
exports.delete = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    Category.findById(req.params.id, (err, cat)=>{
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Category with id ${req.params.id}.`
                });
            }else{
                res.status(500).send({
                    message: "Could not delete Category with id " + data
                });
            }
        } else {
            helpers.deleteFile(cat.image);
            Category.remove(req.params.id, (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            message: `Not found Category with id ${req.params.id}.`
                        });
                    } else {
                        res.status(500).send({
                            message: "Could not delete Category with id " + data
                        });
                    }
                } else res.send({ message: `Category was deleted successfully!` });
            });
        }
    })
};

// Delete all Categories from the database.
exports.deleteAll = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }
    
    Category.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all categories."
            });
        else res.send({ message: `All Categories were deleted successfully!` });
    });
};