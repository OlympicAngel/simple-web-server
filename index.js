const SSLServer = require("./SSLServer");
const UnSecureServer = require("./UnSecureServer");
const ws_module = require('websocket');

let lastMC_data;

const Http_S_Server = new SSLServer({ "ws_opt": { "disableNagleAlgorithm": true } });
/**
 * @param {ws_module.connection} cnn 
 * @returns 
 */
Http_S_Server.WS_ON_CONNECTION = (cnn) => {
    if (!lastMC_data)
        return;
    Http_S_Server.Logger(`${cnn.ip}/Sending Lastest MC game data.`);
    cnn.send(lastMC_data);
}


const Http_Server = new UnSecureServer({ "allowedConnectionFrom": ["147.235.201.139", "192.168.1.1"], "ws_opt": { "disableNagleAlgorithm": true } });
/**
 * @param {ws_module.Message} msg 
 * @returns 
 */
Http_Server.WS_ON_MSG = (msg) => {
    Http_Server.Logger(Http_Server.currentConnection.ip + "/NEW Messgae - " + ((msg.type == "utf8") ? msg.utf8Data : "[Non-string MSG]"), true)
    Http_Server.Logger(`Broadcasting MSG from ${Http_Server.currentConnection.ip} to [${Http_S_Server.ws.connections?.length}] WS end-points.`, true)
    const rawData = (msg.type == "utf8") ? msg.utf8Data : msg.binaryData;
    //TODO: merge to specific area on memory object?
    lastMC_data = rawData

    Http_S_Server.ws.broadcast(rawData)
}

