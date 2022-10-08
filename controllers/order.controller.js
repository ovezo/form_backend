const bcrypt = require('bcrypt');
const e = require('express');
const jwt = require("jsonwebtoken");
const jwtconf = require('../config/jwt.config');
const Socket = require('../helpers/socket');
const sendMessage = require('../middlewares/messageSender');

const Order = require("../models/order.model");
const OrderProductInter = require("../models/order.model/productInter");
const Product = require("../models/product.model");

const https = require('https')

const isValid = require('./_helpers');

var orders = {};

// Initiate orders table
Order.initTable((err, res)=>{
    if (err)
        throw(err)
    
    console.log("Table ORDERS ready to use!")
    OrderProductInter.initTable((err, res)=>{
        if (err)
            throw(err)
        
        console.log("Table OrderProductInter ready to use!")
    })
})

// Create and Save a new Order
exports.create = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    let order = {
        phoneNumber: req.body.phoneNumber,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        order_comment: req.body.order_comment,
    }
    
    let products = [];

    try {
        products = JSON.parse(req.body.products)
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            message: "Incorrect data format!"
        });
    }

    console.log(products)

    Product.getBasicInfoByIds(products.map(e=>e.id), (err, data) => {
        console.log(data)
        if (err)
            return res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Order."
            });
        
        // Save Order in the database
        for (let i = 0; i < products.length; i++)
        {
            p = products[i]
            let pr = getProductPrice(data, p.id)
            if (pr === null){
                return res.status(500).send({
                    message: "Some error occurred while creating the Order."
                });
            }
            p.price = pr            
        }
        
        console.log("Order: ", order, products)

        Order.create(order, (err, orderRes) => {
            if (err)
                return res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the Order."
                });
            
            OrderProductInter.createMulti(orderRes.id, products, (err, data)=>{
                if (err)
                    return res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Order."
                    });           
                
                sendMessageAboutOrder(orderRes.id)
                return res.status(200).send(data);
            })
        });
    })
};

// Proceed order credit
exports.proceedCreditOrder = (req, res) => {

    console.log(req.body)
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }

    let order = {
        phoneNumber: req.body.phoneNumber,
        name: req.body.name,
        email: req.body.email,
        address: req.body.address,
        order_comment: req.body.order_comment
    }
    
    let products = [];

    try {
        products = JSON.parse(req.body.products)
    } catch (error) {
        console.log(error)
        return res.status(400).send({
            message: "Incorrect data format!"
        });
    }

    Product.getBasicInfoByIds(products.map(e=>e.id), (err, data) => {
        if (err)
            return res.status(500).send({
                message:
                    err.message || "Some error occurred while creating the Order."
            });
        
        var totalPrice = 0
        // Save Order in the database
        for (let i = 0; i < products.length; i++)
        {
            p = products[i]
            let pr = getProductPrice(data, p.id)
            if (pr === null){
                return res.status(500).send({
                    message: "Some error occurred while creating the Order."
                });
            }
            p.price = pr
            totalPrice += pr * products[i].quantity;
        }

        createOrderInBack(+(new Date), totalPrice, req.body.returnUrl, (err, data) => {
            if (err)
                return res.status(400).send({
                    message: "Something is wrong!"
                });
            
            order.products = products
            orders[data.orderId] = order

            res.status(201).send({
                url: data.formUrl,
                id: data.orderId
            })
        })      
    })
};

function createOrderInBack(id, totalPrice, returnUrl, callback){

    const options = {
        hostname: 'mpi.gov.tm',
        port: 443,
        path: `/payment/rest/register.do?orderNumber=${id}&amount=${totalPrice*100}&currency=934&language=ru&password=G3dy74K3eBUaey3&returnUrl=${returnUrl.startsWith("file:///")?"http://www.greenbazar.com.tm/chechout/final":returnUrl}&userName=101211005696&pageView=DESKTOP&description=GREENBazarTM`,
        method: 'GET'
    }

    console.log(options.path)

    const req = https.request(options, res => {
        res.on('data', d => {
            console.log("data", d.toString("utf8"));
            callback(null, JSON.parse(d.toString("utf8")));
        })
    })

    req.on('error', error => {
        console.log(error)
        callback(error, null);
    })

    req.end()
}

// Proceed order credit
exports.checkStatusOrder = (req, res) => {
    // Validate request
    if (!req.body) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
        return;
    }
    
    goAndCheck(req.params.id, (err, data)=>{
        if (err)
            return res.status(400).send({
                message: "Something is wrong!"
            });
        
        console.log(JSON.stringify(orders))

        let order = {...orders[req.params.id]};
        delete orders[req.params.id];   
        

        if (Number(data.ErrorCode) > 0 || !data.approvalCode){  
            console.log(data)
            console.log(data.ErrorMessage)
            return res.status(200).send({
                error: true,
                message: data.ErrorMessage
            });
        }
        order.payment = JSON.stringify(data);
        console.log("HARAM", order)
        let products = [...order.products];
        delete order.products;
        
        Order.create(order, (err, orderRes) => {
            if (err)
                return res.status(500).send({
                    message:
                        err.message || "Some error occurred while creating the Order."
                });
            
            OrderProductInter.createMulti(orderRes.id, products, (err, data)=>{
                if (err)
                    return res.status(500).send({
                        message:
                            err.message || "Some error occurred while creating the Order."
                    });           
                
                sendMessageAboutOrder(orderRes.id)
                return res.status(200).send(data);
            })
        });
    })

};

function goAndCheck(id, callback){

    const options = {
        hostname: 'mpi.gov.tm',
        port: 443,
        path: `/payment/rest/getOrderStatus.do?language=ru&orderId=${id}&password=G3dy74K3eBUaey3&userName=101211005696`,
        method: 'GET'
    }

    const req = https.request(options, res => {
        res.on('data', d => {
            console.log("data", d.toString("utf8"));
            callback(null, JSON.parse(d.toString("utf8")));
        })
    })

    req.on('error', error => {
        callback(error, d);
    })

    req.end()
}

function sendMessageAboutOrder(id){

    Socket.onNewOrder();

    Order.getById(id, (err, res) => {
        if (err || !res)
        {
            console.error("Error occured while sending message about order with id:", id);
            return
        }

        let html = `
            <div style="font-size: 14px;">
                <div>tel: <a href="tel:${res.phoneNumber}">${res.phoneNumber}</a><div>
                <div>buyer: ${res.name}</div>
                <div>address: ${res.address}</div>
                <br/>
                <table style="border: 1px solid black; width: 100%; border-collapse: collapse;">
                    ${
                        res.products.map( e => (
                            `<tr>
                                <td style="border: 1px solid black;">${e.title}</td>
                                <td style="border: 1px solid black;">${e.quantity} x ${e.price} = ${e.quantity * e.price} TMT</td>
                            </tr>`
                        )).join(" ")
                    }
                    <tr>
                        <td style="border: 1px solid black;">Total</td>
                        <td style="border: 1px solid black;"><b>${res.products.reduce((sum, p)=>sum+p.price*p.quantity, 0)} TMT</b></td>
                    </tr>
                </table>
            </div>
        `

        sendMessage(
            `Order from #: ${res.phoneNumber} - `,
            html
        );
    })
}


function getProductPrice(arr, productId){
    for(let i = 0; i < arr.length; i++) {
        let e = arr[i]
        if (e.id === productId){
            return (e.salePrice || e.price)
        }
    }
    return null
}

// Retrieve all Orders from the database.
exports.findAll = (req, res) => {
    if (!req.decoded || ! req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    Order.getAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving orders."
            });
        else res.send(data);
    });
};


// Retrieve User's all Orders from the database.
exports.findUserOrders = (req, res) => {
    if (!req.decoded) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }
    let userId = req.decoded.id;
    Order.getUserOrders(userId, (err, data) => {
        if (err)
            return res.status(500).send({
                message:
                    err.message || "Some error occurred while retrieving orders."
            });
        return res.status(200).send(data);
    });
};

// Update a Order identified by the phoneNumber in the request
exports.update = (req, res) => {
    // Validate Request
    if (!req.body || !req.params.id) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    if (!req.decoded || ! req.decoded.isAdmin) {
        return res.status(401).send({
            message: "Unauthorized!"
        });
    }

    Order.updateById(
        req.params.id,
        req.body,
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Order with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Order with id " + req.params.id
                    });
                }
            } else res.status(200).send(data);
        }
    );
};

// Update a Order identified by the phoneNumber in the request
exports.cancel = (req, res) => {
    // Validate Request
    if (!req.params.id) {
        res.status(400).send({
            message: "Content can not be empty!"
        });
    }

    Order.cancelById(
        req.params.id,
        (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    res.status(404).send({
                        message: `Not found Order with id ${req.params.id}.`
                    });
                } else {
                    res.status(500).send({
                        message: "Error updating Order with id " + req.params.id
                    });
                }
            } 
            else{ 
                res.status(200).send(data);
            }
        }
    );
};


// Delete a Order with the specified orderId in the request
exports.delete = (req, res) => {
    Order.remove(req.params.orderId, (err, data) => {
        if (err) {
            if (err.kind === "not_found") {
                res.status(404).send({
                    message: `Not found Order with id ${req.params.orderId}.`
                });
            } else {
                res.status(500).send({
                    message: "Could not delete Order with id " + req.params.orderId
                });
            }
        } else res.send({ message: `Order was deleted successfully!` });
    });
};

// Delete all Orders from the database.
exports.deleteAll = (req, res) => {
    Order.removeAll((err, data) => {
        if (err)
            res.status(500).send({
                message:
                    err.message || "Some error occurred while removing all orders."
            });
        else res.send({ message: `All Orders were deleted successfully!` });
    });
};
