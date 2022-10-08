const languageConfig = require("../config/language.config.js");
const HomeBanner = require("../models/home.model.js");
const helpers = require("./_helpers.js");
// Initiate users table
HomeBanner.initTable((err, res)=>{
    if (err)
        throw(err)
    else
        console.log("Table HOME ready to use!")
})



// Create and Save a new HomeBanner
exports.create = (req, res) => {
    // Validate request
    if(!req.decoded || !req.decoded.isAdmin)
        return res.status(401).send({
            message: "Unauthorized!"
        });
    


    // Save HomeBanner in the database
    HomeBanner.create((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the HomeBanner."
            });
        else res.send(data);
    });
};


// Retrieve all HomeBanners from the database.
exports.findAll = (req, res) => {
    HomeBanner.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        else res.send(data);
    });
};


// Retrieve get Notif from the database.
exports.getNotif = (req, res) => {
    HomeBanner.getNotif((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        else res.send(data);
    });
};

// Retrieve get Notif from the database.
exports.updateNotif = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    if(!req.decoded || !req.decoded.isAdmin)
        return res.status(401).send({
            message: "Unauthorized!"
        });
        
    HomeBanner.updateNotif(req.body.value, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving users."
            });
        else res.send(data);
    });
};


// Update a HomeBanner identified by id in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    if(!req.decoded || !req.decoded.isAdmin)
        return res.status(401).send({
            message: "Unauthorized!"
        });

    let filePath;
    if (req.file)
        filePath = req.file.filename;
    else 
        return res.status(400).send({
            message: "Content can not be empty!"
        });
            
    HomeBanner.findById(req.params.id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Not found Category with id ${req.params.id}.`
                    });
                }
                
                return res.status(500).send({
                    message: "Error retrieving Category with id " + id
                });
            }
        
        let deleted = [] 
        let body = {}
        languageConfig.forEach( e => {
            let image = data[`image_${e.code}`]
            if (image && deleted.indexOf(image)===-1){
                helpers.deleteFile(image);
                deleted.push(image)
            }
            body[`image_${e.code}`] = filePath
            image = data[`imageSM_${e.code}`]
            if (image && deleted.indexOf(image)===-1){
                helpers.deleteFile(image);
                deleted.push(image)
            } 
            body[`imageSM_${e.code}`] = filePath
        })
        
        HomeBanner.updateById(
            req.params.id,
            body,
            (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            message: `Not found HomeBanner with id ${req.params.id}.`
                        });
                    } else {
                        res.status(500).send({
                            message: "Error updating HomeBanner with id " + req.params.id
                        });
                    }
                } else res.send({image: filePath, imageSM: filePath});
            }
        );
    })
};


// Update a HomeBanner identified by id in the request
exports.updateField = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    if(!req.decoded || !req.decoded.isAdmin)
        return res.status(401).send({
            message: "Unauthorized!"
        });
    let filePath;
    let field = req.body.field

    if (req.file && field)
        filePath = req.file.filename;
    else 
        return res.status(400).send({
            message: "Content can not be empty!"
        });

    HomeBanner.findById(req.params.id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Not found Category with id ${req.params.id}.`
                    });
                }
                
                return res.status(500).send({
                    message: "Error retrieving Category with id " + req.params.id
                });
            }  

        let body = {}
        if (field.split("_")[1] && field.split("_")[1] === languageConfig[0].code){
            let newData = {}
            Object.keys(data).forEach( e => {
                if (e.indexOf("SM")>-1){
                    return
                }
                newData[e] = data[e]
            })
            languageConfig.forEach( e => {
                let key = `imageSM_${e.code}`;
                body[key] = filePath
                let temp = {}
                temp[key] = data[key]
                if (!objectHasValue({...newData, ...temp}, key)){
                    helpers.deleteFile(data[key]);
                }
            })
        } else {
            body[field] = filePath
            if (!objectHasValue(data, field)){
                helpers.deleteFile(data[field]);
            }
        }         

        HomeBanner.updateById(
            req.params.id,
            body,
            (err, data) => {
                if (err) {
                    if (err.kind === "not_found") {
                        res.status(404).send({
                            message: `Not found HomeBanner with id ${req.params.id}.`
                        });
                    } else {
                        res.status(500).send({
                            message: "Error updating HomeBanner with id " + req.params.id
                        });
                    }
                } else res.send(body);
            }
        );
    })
};


// Update a HomeBanner identified by id in the request
exports.updateLink = (req, res) => {
    // Validate Request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }
    if(!req.decoded || !req.decoded.isAdmin)
        return res.status(401).send({
            message: "Unauthorized!"
        });

 
    HomeBanner.updateById(
        req.params.id,
        {link: req.body.link},
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found HomeBanner with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating HomeBanner with id " + req.params.id
                    });
                }
            } else res.send({link: req.body.link});
        }
    );
};

// Delete a HomeBanner with the specified id in the request
exports.delete = (req, res) => {
    HomeBanner.remove(req.params.id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found HomeBanner with id ${req.params.id}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete HomeBanner with id " + req.params.id
                });
            }
        } else res.send({ message: `HomeBanner was deleted successfully!` });
    });
};

// Delete all HomeBanners from the database.
exports.deleteAll = (req, res) => {
    HomeBanner.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all users."
            });
        else res.send({ message: `All HomeBanners were deleted successfully!` });
    });
};


function  objectHasValue(obj, key){
    for (let k of Object.keys(obj)) {
        if (k !== key && obj[k] === obj[key])
            return true;
    }   

    return false;
}