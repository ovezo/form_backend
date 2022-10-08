const jwt = require("jsonwebtoken");
const config = require("../config/jwt.config.js");

verifyAccToken = (req, res, next) => {
    if (!req.headers.authorization) 
        return res.status(403).json({ message: 'No credentials sent!' });
    else
        token = req.headers.authorization.split("Bearer ")[1]
    
    jwt.verify(token, config.acc_secret, (err, decoded) => {
        if (err) {
            return res.status(403).send({
                message: "Unauthorized!"
            });
        }
        req.decoded = decoded;
        next();
    });
};

verifyRefToken = (req, res, next) => {
    if (!req.headers.authorization) 
        return res.status(401).json({ message: 'No credentials sent!' });
    else
        token = req.headers.authorization.split("Bearer ")[1]
    
    jwt.verify(token, config.ref_secret, (err, decoded) => {
        if (err) {
            return res.status(401).send({
                message: "Unauthorized!"
            });
        }

        req.decoded = decoded;
        next();
    });
};

module.exports = {verifyAccToken, verifyRefToken};