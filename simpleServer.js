const fs = require("fs")
const http = require('http');
const https = require('https');
const ws_module = require('websocket');
const WebSocketServer = ws_module.server;

class SimpleServer {
    /** @type {Number} */
    port
    /** @type {Number} */
    path
    /** @type {Boolean} */
    isSSL
    /** @type {WebSocketServer}*/
    ws
    /** @type {Boolean}*/
    isINI

    /**
     * Creates a raw http/s webserver automagicly, by default it will auto ini everything, if you want to do it manually pass {autoINI:false} as options.
     */
    constructor(options = { ssl: true, path: "/www/", sslPath: "ssl/", port: undefined, autoINI: true, ws_opt: { "disableNagleAlgorithm": false } }) {
        options = Object.assign({ ssl: true, path: "/www/", sslPath: "ssl/", autoINI: true, ws_opt: { "disableNagleAlgorithm": false } }, options);
        if (!options.path.startsWith("/"))
            options.path = "/" + options.path;
        /** @type {https} */
        this.port = options.port || (options.ssl ? 443 : 80);
        this.path = options.path;
        this.isSSL = options.ssl;
        this.isINI = false;
        if (options.autoINI)
            this.ini();
    }

    /**
     * setting up the server itslef and ws realted events.
     * @returns 
     */
    ini(ws_opt = { "disableNagleAlgorithm": false }) {
        if (this.isINI)
            return this.Logger("Attempt to run ini after initialization.");

        this.isINI = true;
        const serverOpt = this.isSSL?{
            key: fs.readFileSync(GetServerPath(this) + '../ssl/privkey.pem'),
            cert: fs.readFileSync(GetServerPath(this) + '../ssl/cert.pem')
        }:{};

        const serverConstructor = this.isSSL ? https : http;
        const server = serverConstructor.createServer(this.isSSL ? serverOpt : {}, (req, res) => { this.onHttpResponse.bind(this); this.onHttpResponse(req, res) })
        server.listen(this.port, () => { this.Logger("Up & Ready.") })
        this.ws = new WebSocketServer(Object.assign({ "httpServer": server }, ws_opt))
        this.Logger("WS ready.", true)

        this.ws.on("request", (req) => {
            this.Logger(`${req.ip}/Requsted access.`, true)
            this.WS_ON_REQ(req);
        })
        this.ws.on("connect", (cnn) => {
            this.Logger(`${cnn.ip}/New connection.`, true)
            cnn.on('message', (msg) => {
                this.WS_ON_MSG.bind(this)
                this.WS_ON_MSG(msg, cnn)
            });
            this.WS_ON_CONNECTION(cnn);
        })
        this.ws.on("close", (cnn, error, desc) => { this.Logger(`${cnn.ip}/Connection closed - ${desc}.`, true) })
        this.ws.on("upgradeError", (e) => { this.Logger(e, true) })

    }

    /**
     * @override
     * Gets Called every time a new message from websocket is comming.
     * @param {ws_module.Message} msg 
     * @param {ws_module.connection} cnn 
     */
    WS_ON_MSG(msg, cnn) { this.Logger("There is no override for this function. Please defined [Server].WS_ON_MSG(msg)", true) }
    /**
     * @override
     * Getting called very time a new req is coming to create new ws connection
     * @param {ws_module.request} cnn 
     * @returns {Boolean} a state of approving or declining  the ws req
     */
    WS_ON_REQ(req) { return; }
    /**
     * @override
     * Getting called every time a new connection has been made - AFTER a successful req
     * @param {ws_module.connection} cnn 
     */
    WS_ON_CONNECTION(cnn) { return; }

    /**
     * Getting called every time a new HTTP/S req for the web server is coming - bt default it servers simple files such as:
     * - html / txt / css / js / gif / jpg / png / svg
     * @param {http.ClientRequest} request 
     * @param {http.ServerResponse} response 
     */
    onHttpResponse(request, response) {
        var urlPath = request.url?.toLocaleLowerCase()
        if (request.url.toLocaleLowerCase() == "/")
            urlPath = "index.html";

        const mime = {
            html: 'text/html',
            txt: 'text/plain',
            css: 'text/css',
            gif: 'image/gif',
            jpg: 'image/jpeg',
            png: 'image/png',
            svg: 'image/svg+xml',
            js: 'application/javascript'
        };
        let formatType = urlPath.split(".")[1];
        const isImage = ["gif", "jpg", "png", "svg"].indexOf(formatType) != -1;
        this.Logger("Requested" + urlPath)
        fs.readFile(GetServerPath(this) + urlPath, (isImage) ? "" : "utf-8", function (err, data) {
            if (err) {
                response.write(JSON.stringify(err));
                response.end();
                return console.log(err);
            }

            var type = mime[formatType] || 'text/plain';
            response.writeHead(200, {
                'Content-Type': type
            });
            if (isImage)
                response.end(data, 'binary');
            else
                response.end(data, 'utf8');
        });
    }


    Logger(message = "", ws = false) {
        const color = this.isSSL ? "\x1b[32m" : "\x1b[33m";
        let prefix = this.isSSL ? "SSL Server" : "http Server";
        if (ws)
            prefix = prefix.replace("Server", "WS")
        console.log(`${color}[${prefix}/${this.port}]: ${message}`)
    }
	
	    GetPath() {
        return GetServerPath(this)
    }
}

function GetServerPath(simpleServerRef) {
    return (process.cwd() + simpleServerRef.path).replace(/\\/g, "/");
}

ws_module.connection.prototype.__defineGetter__("ip", GetIp)
ws_module.request.prototype.__defineGetter__("ip", GetIp)
function GetIp() { return this.remoteAddress.split(":").pop(); }

SimpleServer.ws_module = ws_module;
module.exports = SimpleServer;
