'use strict';
const cors = require('cors');
const express = require('express');
const app = express();
const path = require('path')
const server = require('http').Server(app);
const io = require('socket.io')(server);

const PORT = 21465;

app.use(cors());

app.use((req, res, next) => {
    req.io = io;
    next();
});

app.use('/files', express.static(path.resolve(__dirname, '..', '..')))

app.use(require('./routes'))

app.get('/test', (req, res) => res.json({
    status: 'API funcionando com sucesso.'
}));

io.on('connection', sock => {
    console.log(`ID: ${sock.id} entrou`)

    sock.on('event', data => {
        console.log(data)
    });

    sock.on('disconnect', () => {
        console.log(`ID: ${sock.id} saiu`)
    });
});

app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname, '..', '..', 'index.html'));
});

server.listen(PORT);
console.log(`O servidor está rodando na porta ${PORT}`)