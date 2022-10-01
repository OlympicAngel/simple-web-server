const SimpleServer = require("./simpleServer");
const ws_module = require('websocket');


class UnSecureServer extends SimpleServer {

    /** @type {ws_module.connection} */
    currentConnection
    /** @type {Array<String>} */
    allowedConnectionFrom

    constructor(options = { path: "/www/", sslPath: "ssl/", port: undefined, allowedConnectionFrom: [], ws_opt: { "disableNagleAlgorithm": false } }) {
        const opt = Object.assign({ path: "/www/", sslPath: "ssl/", port: undefined, allowedConnectionFrom: [], ws_opt: { "disableNagleAlgorithm": false } }, options);
        opt.ssl = false;
        super(opt);
        this.allowedConnectionFrom = opt.allowedConnectionFrom;
    }

    /**
     * 
     * @param {ws_module.request} req 
     */
    WS_ON_REQ(req) {
        if (this.allowedConnectionFrom.indexOf(req.ip) != -1) {
            this.Logger(`${req.ip}/Requsted access => Approved(In Whitelist).`, true)
            return req.accept();
        }
        this.Logger(req.ip + "/Prevented access.", true)
        req.reject();
    }

    WS_ON_CONNECTION(cnn) {
        if (this.currentConnection) {
            this.currentConnection.removeAllListeners();
            this.currentConnection.close();
        }
        this.currentConnection = cnn;
    }
}

module.exports = UnSecureServer;
