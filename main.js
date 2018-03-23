'use strict';

const express = require('express');
const WebSocket = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX) )
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const webSocketServer = new WebSocket({ server });

var channels = [];

  

webSocketServer.on('connection', (ws, req) => {
    const ip = req.connection.remoteAddress;
    console.log('Client connected '+ ip);
    ws.on('message', function incoming(data) {
        var message = JSON.parse(data);
        console.dir(message);
        var type = message.type;
        if (type == "create") {
            channels.push(message)
        } else if (type == 'join') {
            for (var m of channels) {
                if (m.name == message.name) {
                    ws.send(JSON.stringify(m));
                    console.log("sent back offer");
                    return;
                }
            }
        } else if (type == 'answer') {
            webSocketServer.clients.forEach(function each(client) {
                if (client !== ws) {
                    client.send(JSON.stringify(message));
                    console.log("sent back answer");
                }
            });
        }
    });
  

    ws.on('close', () => console.log('Client disconnected ' + ip));
});