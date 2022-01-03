"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const socket_io_1 = __importDefault(require("socket.io"));
const Lobby_1 = require("./Lobby");
class Server {
    constructor() {
        this.io = new socket_io_1.default.Server({ transports: ["websocket"] });
        this.io.listen(80);
        this.tileSize = 50;
        this.lobby = new Lobby_1.Lobby(this);
        this.tick = 15; // milliseconds
        this.lastTime = null;
        this.gameLoop();
    }
    gameLoop() {
        if (!this.lastTime) {
            this.lastTime = performance.now();
            setTimeout(this.gameLoop.bind(this), this.tick);
            return;
        }
        const delta = performance.now() - this.lastTime;
        this.lobby.gameLoop(delta);
        this.lastTime = performance.now();
        setTimeout(this.gameLoop.bind(this), this.tick);
    }
}
exports.Server = Server;
