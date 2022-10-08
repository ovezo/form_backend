const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const jwtconf = require('../config/jwt.config');

const Image = require("../models/image.model");

// Initiate IMAGES table
Image.initTable((err, res)=>{
    if (err)
        throw(err)
    else
        console.log("Table CATEGORIES ready to use!")
})


// Create and Save a new Image
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    const category = new Image({
        translationId: data.id,
        parentId: req.body.parentId,
        imageId: imgData.id
    });

    Image.create(category, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Image."
            });
        else 
            if (typeof(req.body.title)==="object"){
                Translation.createMulti(req.body.title, data.id, (err, succ)=>{
                    if (err)
                        res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the Image."
                        });
                    else
                        res.status(200).send({
                            id: data.id, 
                            parentId: req.body.parentId,
                            title: req.body.title, 
                            img: imgData.url
                        })
                })
            }
    });

};


// Log in a Image with a phoneNumber and password
exports.findById = (req, res) => {
    var id = req.params.id;

    Image.findById(id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Image with id ${id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Image with id " + id
                });
            }
        } else {
            res.status(200).send(data)
        }
    });
};


// Retrieve all Categories from the database.
exports.findAll = (req, res) => {
    Image.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving categories."
            });
        else res.send(data);
    });
};

// Update a Image identified by the id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Image.updateById(
        req.params.categoryId,
        new Image(req.body),
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Image with id ${req.params.categoryId}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Image with id " + req.params.categoryId
                    });
                }
            } else res.send(data);
        }
    );
};

// Delete a Image with the specified categoryId in the request
exports.delete = (req, res) => {
    Image.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Image with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Image with id " + req.params.id
                });
            }
        } else res.send({ message: `Image was deleted successfully!` });
    });
};

// Delete all Categories from the database.
exports.deleteAll = (req, res) => {
    Image.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all categories."
            });
        else res.send({ message: `All Categories were deleted successfully!` });
    });
};
