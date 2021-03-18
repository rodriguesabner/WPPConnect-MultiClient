"use strict";

const venom = require('@wppconnect-team/wppconnect');
const fs = require('fs');

let clientsArray = [];
let sessions = [];

let chromiumArgs = ['--disable-web-security', '--no-sandbox', '--disable-web-security', '--aggressive-cache-discard', '--disable-cache', '--disable-application-cache', '--disable-offline-load-stale-cache', '--disk-cache-size=0', '--disable-background-networking', '--disable-default-apps', '--disable-extensions', '--disable-sync', '--disable-translate', '--hide-scrollbars', '--metrics-recording-only', '--mute-audio', '--no-first-run', '--safebrowsing-disable-auto-update', '--ignore-certificate-errors', '--ignore-ssl-errors', '--ignore-certificate-errors-spki-list'];

async function opendata(req, res, sessionName) {
    sessions.push(sessionName)

    clientsArray[sessionName] = await venom.create(sessionName, (base64Qr, asciiQR) => {
        exportQR(req, res, base64Qr, sessionName + '.png', sessionName);
    }, (statusFind) => {
        console.log(statusFind + '\n\n')
    }, {
        headless: true, // Headless chrome
        devtools: false, // Open devtools by default
        useChrome: true, // If false will use Chromium instance
        debug: false, // Opens a debug session
        logQR: true, // Logs QR automatically in terminal
        browserArgs: chromiumArgs, // Parameters to be added into the chrome browser instance
        refreshQR: 15000, // Will refresh QR every 15 seconds, 0 will load QR once. Default is 30 seconds
        disableSpins: true,
    }).catch(erro => console.log(erro))

    await start(req, res, clientsArray, sessionName);

    req.io.emit('whatsapp-status', true)
    res.status(201).json({
        response: 'Sessão aberta com sucesso!',
    })
}

function exportQR(req, res, qrCode, path, session) {
    qrCode = qrCode.replace('data:image/png;base64,', '');
    const imageBuffer = Buffer.from(qrCode, 'base64');

    fs.writeFileSync(path, imageBuffer);
    req.io.emit('qrCode',
        {
            data: 'data:image/png;base64,' + imageBuffer.toString('base64'),
            session: session
        }
    );
}

async function start(req, res, client, sessionName) {
    await client[sessionName].onStateChange((state) => {
        const conflits = [
            venom.SocketState.CONFLICT,
            venom.SocketState.UNPAIRED,
            venom.SocketState.UNLAUNCHED,
        ];
        if (conflits.includes(state)) {
            client[sessionName].useHere();
        }
    });

    await client[sessionName].onAnyMessage((message) => {
        console.log(`[${sessionName}]: Mensagem Recebida: \nTelefone: ' ${message.from}, Mensagem: ${message.body}`)
        message.session = sessionName
        req.io.emit('mensagem-recebida', { message })
    });
}

module.exports = {
    async mostrarSessoes(req, res) {
        res.status(200).json(sessions)
    },
    async abrirSessao(req, res) {
        const { sessionName } = req.body

        opendata(req, res, sessionName)
    },
    async fecharSessao(req, res) {
        const { session } = req.body
        await clientsArray[session].close();

        req.io.emit('whatsapp-status', false)
    },
    //envio de mensagens
    async enviar_msg(req, res) {
        const { phone, msg, session } = req.body

        sendMessage()

        async function sendMessage() {
            try {
                await clientsArray[session].sendText(phone + "@c.us", msg);

                res.status(201).json({
                    response: {
                        message: msg,
                        contact: phone + "@c.us",
                        session: session
                    },
                })

                req.io.emit('mensagem-enviada', { message: msg, to: phone });
            } catch (error) {
                res.status(400).json({
                    response: {
                        message: 'Sua mensagem não foi enviada.',
                        session: session,
                        log: error
                    },
                })
            }
        }
    }
}