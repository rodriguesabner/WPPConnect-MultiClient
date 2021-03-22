const express = require('express')
const MessageController = require('../controller/MessageController')

const routes = new express.Router()

//Sessions
routes.get('/api/show-all-sessions', MessageController.showAllSessions)
routes.get('/api/check-connection', MessageController.checkSessionConnected)
routes.post('/api/start-session', MessageController.startSession)
routes.post('/api/close-session', MessageController.closeSession)

//SendMessages
routes.post('/api/send-message', MessageController.sendMessage)
routes.post('/api/send-image', MessageController.sendImage)
routes.post('/api/send-file', MessageController.sendFile)

// Group Functions
routes.post('/api/create-group', MessageController.createGroup)
routes.post('/api/join-code', MessageController.joinGroupByCode)

// Device Functions
routes.post('/api/change-username', MessageController.setProfileName)
routes.post('/api/change-profile-image', MessageController.setProfileImage)
routes.post('/api/close-session', MessageController.setProfileImage)
routes.get('/api/show-all-contacts', MessageController.showAllContacts)

module.exports = routes;