const Product = require("../models/product.model");
const Translation = require("../models/product.model/translation");
const CategoryInter = require("../models/product.model/categoryInter");
const ProductImages = require("../models/product.model/productImages");

const helpers = require('./_helpers');

// Initiate products table
Product.initTable((err, res)=>{
    if (err)
        throw(err)
    console.log("Table PRODUCTS ready to use!")
    
    // Initiate ProductTranslations table
    Translation.initTable((err, res)=>{
        if (err)
            throw(err)
        console.log("Table PRODUCT_TRANSLATIONS ready to use!")   

        // Initiate CategoryInter table
        CategoryInter.initTable((err, res)=>{
            if (err)
                throw(err)

            // Initiate PoductImages table
            ProductImages.initTable((err, res)=>{
                if (err)
                    throw(err)
                console.log("Table PRODUCT_IMAGES ready to use!")

            })
        })
    })
})

// Create and Save a new Product
exports.create = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }
    
    // Validate request
    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    try {
        req.body.title = JSON.parse(req.body.title)
        req.body.categories = JSON.parse(req.body.categories)
        req.body.imageData = JSON.parse(req.body.imageData)
        req.body.description = JSON.parse(req.body.description)
    } catch(e){
        console.error(req.body)
        return res.status(400).send({
            message: "Incorrect data format!"
        });
    }
    
    findImage = (image) => {
        for (var i=0; i<req.files.length; i++ ){
            var e = req.files[i] 
            if (e.originalname === image)
                return e.filename
        }
        // if (image && image.startsWith("http"))
            return image
        // return;
    }

    const product = new Product({
        id: req.body.id,
        price: req.body.price,
        salePrice: req.body.salePrice,
        priority: req.body.priority,
        inStock: req.body.inStock,
        quantity: req.body.amount
    });

    var translation = new Translation({
        title: req.body.title,
        description: req.body.description
    });

    var categoryInters = req.body.categories.map((e, i) => new CategoryInter({ categoryId: e }) )  

    var productImages = []
    req.body.imageData.forEach( (e, i) => {
        productImages.push(
            new ProductImages({
                image: findImage(e.image),
                priority: e.priority            
            })
        )
    })

    Product.create(product, (err, product) => {
        if (err)
            return res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Product."
            });
        Translation.createMulti(translation, product.id, (err, succ)=>{
            if (err)
                return res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the Product."
                });
            CategoryInter.createMulti(categoryInters, product.id, (err, succ)=>{
                if (err)
                    return res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Product."
                    });
                ProductImages.createMulti(productImages, product.id, (err, succ)=>{
                    if (err)
                        return res.status(500).send({
                            message:
                                err.message || "Some error occurred while creating the Product."
                        });
                    return res.status(200).send({message: "OK"})
                }); 
            }); 
        });
    });
};


// Get a Product by Id
exports.findById = (req, res) => {
    // Authanticate request if Admin

    var id = req.params.id;
    // Validate request
    if (!id) {
        return res.status(400).send({
            message: "Id must be provided!"
        });
    }

    Product.findById(id, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Product with id ${id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Product with id " + id
                });
            }
        } else {
            res.status(200).send(data)
        }
    });
};


// Get a Product by Id
exports.updateDetail = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    var id = req.params.id;
    // Validate request
    if (!id) {
        return res.status(400).send({
            message: "Id must be provided!"
        });
    }

    Product.updateById(id, req.body, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Product with id ${id}.`
                });
            } else {
                res.status(500).send({
                    message: "Error retrieving Product with id " + id
                });
            }
        } else {
            res.status(200).send({id: id, ...req.body})
        }
    });
};

// Retrieve all Products by Category from the database.
exports.findAllForAdmin = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }    

    let categoryIds = [], sort = {};
    try{
        categoryIds = JSON.parse(req.body.categoryIds);
    }catch(e){
    }

    sort = {
        column: sort.column === "price" ? "sortPrice" : "priority", 
        direction: sort.direction === "ASC" ? "ASC" : "DESC"
    }

    Product.findAllForAdmin(categoryIds, sort, req.body.skip, req.body.limit, req.body.search, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving products."
            });
        else {
            res.send(data);
        }
    });
};

// Retrieve all Products by Category from the database.
exports.findAllByCategory = (req, res) => {
    console.log(req.body)

    if (!req.body) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }    
    let categoryIds = [], sort = {};
    try{
        categoryIds = JSON.parse(req.body.categoryIds);
    }catch(e){
    }

    try{
        sort = JSON.parse(req.body.sort);
    }catch(e){
    }

    sort = {
        column: sort.column === "price" ? "sortPrice" : "priority", 
        direction: sort.direction === "ASC" ? "ASC" : "DESC"
    }

    Product.findAllByCategory(categoryIds, sort, req.body.skip, req.body.limit, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving products."
            });
        else {
            res.send(data);
        }
    });
};

// Update a Product identified by the id in the request body
exports.update = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    try {
        req.body.unchangedImages = JSON.parse(req.body.unchangedImages)
    } catch(e){
        return res.status(400).send({
            message: "Incorrect data format!"
        });
    }

    let id = req.params.id
    // Validate Request
    if (!req.body || !id) {
        return res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Product.getImages(id, (err, images)=>{
        if (images) 
            images.forEach( e => {
                if (req.body.unchangedImages.indexOf(e.image)===-1){
                    helpers.deleteFile(e.image);
                    helpers.deleteThumb(e.image);
                }
            })

        Product.remove(id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Not found Product with id ${id}.`
                    });
                } 
                return res.status(500).send({
                    message: "Could not delete Product with id " + id
                }); 
            }  
            req.body.id = id
            this.create(req, res);
        });
    })
};


// Increment view of products from the database.
exports.incView = (req, res) => {
    Product.incView(req.params.id, (err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all products."
            });
        else res.send({ message: `All Products were deleted successfully!` });
    });
};

// Delete a Product with the specified productId in the request
exports.delete = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    Product.getImages(req.params.id, (err, images)=>{
        if (images) 
            images.forEach( e => {
                helpers.deleteFile(e.image);
                helpers.deleteThumb(e.image);
            })

        Product.remove(req.params.id, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Not found Product with id ${req.params.id}.`
                    });
                } 
                return res.status(500).send({
                    message: "Could not delete Product with id " + data
                });
                
            }  
            return res.send({ message: `Product was deleted successfully!` });
        });

    })
};

// Delete a Product with the specified productId in the request
exports.deleteArray = (req, res) => {
    // Authanticate request if Admin
    try{
        req.body.ids = JSON.parse(req.body.ids)
    }catch(e){
        return res.status(400).send({
            message: "Incorrect data format!"
        });
    }
    
    let ids = req.body.ids
    if (!ids.length){
        return res.status(400).send({
            message: "Array cannot be empty!"
        });
    }

    Product.getImagesOfProducts(ids, (err, images)=>{
        if (images) 
            images.forEach( e => {
                helpers.deleteFile(e.image);
                helpers.deleteThumb(e.image);
            })

        Product.removeArray(ids, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        message: `Not found Products with id ${ids}.`
                    });
                } 
                return res.status(500).send({
                    message: "Could not delete Product with id " + data
                });
            }  
            return res.send({ message: `Product was deleted successfully!` });
        });

    })
};

// Delete all Products from the database.
exports.deleteAll = (req, res) => {
    // Authanticate request if Admin
    if (!req.decoded || !req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }
    
    Product.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all products."
            });
        else res.send({ message: `All Products were deleted successfully!` });
    });
};