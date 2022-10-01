const SimpleServer = require("./simpleServer");

class SSLServer extends SimpleServer {
    constructor(options = { path: "/www/", sslPath: "ssl/", port: undefined, ws_opt: { "disableNagleAlgorithm": false } }) {
        const opt = Object.assign({ path: "/www/", sslPath: "ssl/", port: undefined, ws_opt: { "disableNagleAlgorithm": false } }, options);
        opt.ssl = true;
        super(opt);
    }

    WS_ON_REQ(req) { req.accept(); } //auto accept all req.
    WS_ON_MSG() { return } //remove the display of "not overrided".
}

module.exports = SSLServer;
