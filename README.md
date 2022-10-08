
# Simple-Web-Server

A small library that create web sever with websocket server in it

## Installation

  `npm i @olympicangel/simple-web-server`

## Usage
```js
    const SimpleServer = require('@jdaudier/number-formatter');

    const myServer = new SimpleServer({
              path: "/www/",    //the path to server serveing files (accsesable folder)
              ssl: true,        //make the server use https / https.
              sslPath: "ssl/",  //if using ssl - get pem files from here (put in this folder "/privkey.pem" & "/cert.pem")
              port: undefined,  //set a specific port(by defalut port 80/443 will be used according to ssl)
              autoINI: true,    // automaticly create server and websocket server (set false incase of wanting to wait before opening the server)
              ws_opt: { "disableNagleAlgorithm": false } //webscoket option taken from "websocket" module, you may add more options from there, i personaly only need that
    });
    //if set {autoINI} to true, web server is running, you may override server functions to change its behavior on serving files or handling websockets, i prefer extanding as a class.
```


## Class extanding
In this example we creates a *http* server that trafic to *https* 
there is override for every function.
```js
const ws_module = require('websocket');
const SimpleServer = require("./simpleServer");

class HttpServer extends SimpleServer {

    constructor(options = { path: "/www/", sslPath: "ssl/", port: undefined, ws_opt: { "disableNagleAlgorithm": false } }) {
        options.ssl = false;
        super(opt);
        this.Logger("Server Created.",false) //logs as server, true for ws prefix, false(defalut) for server prefix.
    }
    
     /**
     * @override
     * Gets Called every time a new message from websocket is comming.
     * @param {ws_module.Message} msg 
     * @param {ws_module.connection} cnn 
     */
    WS_ON_MSG(msg, cnn) {}
    
     /**
     * @override
     * Getting called very time a new req is coming to create new ws connection
     * @param {ws_module.request} cnn 
     * @returns {Boolean} a state of approving or declining  the ws req
     */
    WS_ON_REQ(req) { return false; }
    
    /**
     * @override
     * Getting called every time a new connection has been made - AFTER a successful req
     * @param {ws_module.connection} cnn 
     */
    WS_ON_CONNECTION(cnn) { }
    
    /**
     * @override
     * Getting called every time a new HTTP/S req for the web server is coming - bt default it servers simple files such as:
     * - html / txt / css / js / gif / jpg / png / svg
     * @param {http.ClientRequest} request 
     * @param {http.ServerResponse} response 
     */
    onHttpResponse(request, response) {
        response.writeHead(302, {'Location': request.url.replace("http", "https")});
        response.end();
        return;
    
        /** This is the defaulted if not override
        * var urlPath = request.url?.toLocaleLowerCase()
        * if (request.url.toLocaleLowerCase() == "/")
        *     urlPath = "index.html";
        * const mime = {
        *     html: 'text/html',
        *     txt: 'text/plain',
        *     css: 'text/css',
        *     gif: 'image/gif',
        *     jpg: 'image/jpeg',
        *     png: 'image/png',
        *     svg: 'image/svg+xml',
        *     js: 'application/javascript'
        * } ;
        * let formatType = urlPath.split(".")[1];
        * const isImage = ["gif", "jpg", "png", "svg"].indexOf(formatType) != -1;
        * this.Logger("Requested" + urlPath)
        * fs.readFile(GetServerPath(this) + urlPath, (isImage) ? "" : "utf-8", function (err, data) {
        *     if (err) {
        *         response.write(JSON.stringify(err));
        *         response.end();
        *         return console.log(err);
        *     }
        *     var type = mime[formatType] || 'text/plain';
        *     response.writeHead(200, {
        *         'Content-Type': type
        *     });
        *     if (isImage)
        *         response.end(data, 'binary');
        *     else
        *        response.end(data, 'utf8');
        * });
        */
    }
}
```
