const webSocketServer = require('websocket').server;

var wsServer;

// I'm maintaining all active connections in this object
const clients = {};
const Socket = ()=>{}

Socket.listen = http => {

    wsServer = new webSocketServer({
        httpServer: http
    });

    wsServer.on('request', function(request) {
        var userID = getUniqueID();
        // You can rewrite this part of the code to accept only the requests from allowed origin
        const connection = request.accept(null, request.origin);
        clients[userID] = connection;
        console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients))

        connection.on('close', function(connection) {
            console.log((new Date()) + " Peer " + userID + " disconnected.");
            delete clients[userID];
        });
    });
}

Socket.onNewOrder = () => {
    console.log(Object.values(clients).length)
    Object.values(clients).forEach(e=>e.send("new order"))
} 

// This code generates unique userid for everyuser.
const getUniqueID = () => {
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    return s4() + s4() + '-' + s4();
};

module.exports = Socket
