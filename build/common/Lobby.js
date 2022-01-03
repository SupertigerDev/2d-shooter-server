"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lobby = void 0;
const HERO_NAMES_1 = require("../constants/HERO_NAMES");
const HERO_PROPERTIES_1 = require("../constants/HERO_PROPERTIES");
const firstMap_1 = require("../maps/firstMap");
const Payload_1 = require("./Payload");
const utils_1 = require("../utils");
class Lobby {
    constructor(server) {
        this.server = server;
        this.map = firstMap_1.firstMap;
        this.players = {};
        this.teamOnePlayerIds = [];
        this.teamTwoPlayerIds = [];
        this.payload = new Payload_1.Payload(this);
        this.io = this.server.io;
        this.server.io.on("connection", client => this.onConnected(client));
    }
    gameLoop(deltaTime) {
        this.payload.dx = 0;
        this.payload.dy = 0;
        this.payload.nearbyPlayers = [];
        for (let playerId in this.players) {
            const player = this.players[playerId];
            player.gameLoop(deltaTime);
        }
        this.payload.handleMovement(deltaTime);
    }
    addPlayer(username, client) {
        const HeroPlayer = (0, utils_1.HeroPick)(HERO_NAMES_1.HeroNames.soldier);
        const player = new HeroPlayer(username, this, client, 100, 400, 0);
        if (this.teamOnePlayerIds.length <= this.teamTwoPlayerIds.length) {
            this.teamOnePlayerIds.push(player.id);
            player.team = 1;
        }
        else {
            this.teamTwoPlayerIds.push(player.id);
            player.team = 2;
        }
        this.players[client.id] = player;
        this.io.emit("spawnPlayer", player.toJSON());
        return player;
    }
    removePlayer(id) {
        if (!this.players[id])
            return;
        delete this.players[id];
        const teamOneIndex = this.teamOnePlayerIds.indexOf(id);
        const teamTwoIndex = this.teamTwoPlayerIds.indexOf(id);
        if (teamOneIndex >= 0) {
            this.teamOnePlayerIds.splice(teamOneIndex, 1);
        }
        else if (teamTwoIndex >= 0) {
            this.teamTwoPlayerIds.splice(teamTwoIndex, 1);
        }
        this.io.emit("playerLeave", id);
    }
    onConnected(client) {
        client.on("setUsername", username => this.onSetUsername(username, client));
        client.on("disconnect", () => this.onDisconnected(client));
    }
    onSetUsername(username, client) {
        if (username.length >= 50)
            return;
        client.emit("overrideHeroProperties", HERO_PROPERTIES_1.HERO_PROPERTIES);
        this.emitPlayerList(client);
        this.addPlayer(username, client);
        this.emitPayloadPosition(client);
    }
    onDisconnected(client) {
        this.removePlayer(client.id);
    }
    emitPlayerList(client) {
        let playerList = Object.keys(this.players);
        playerList = playerList.map((id) => {
            const player = this.players[id];
            return player.toJSON();
        });
        client.emit("playerList", playerList);
    }
    emitPayloadPosition(client) {
        client.emit("payloadPosition", { x: this.payload.x, y: this.payload.y });
    }
}
exports.Lobby = Lobby;
