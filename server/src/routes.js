const express = require('express')
const multer = require('multer');

const MessageController = require('../controller/MessageController')

const routes = new express.Router()
const upload = multer()

routes.post('/enviar-mensagem/', upload.none(''), MessageController.enviar_msg)

routes.post('/iniciar-sessao', upload.none(''), MessageController.abrirSessao)
routes.post('/fechar-sessao', upload.none(''), MessageController.fecharSessao)

module.exports = routes;