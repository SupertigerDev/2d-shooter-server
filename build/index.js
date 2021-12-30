"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const io = new socket_io_1.Server({ transports: ["websocket"] });
const heroProperties = {
    soldier: {
        maxHealth: 200,
        walkSpeed: 0.5,
    }
};
const players = {};
io.on('connection', client => {
    client.emit("overrideHeroProperties", heroProperties);
    console.log("connected");
    emitPlayerList(client);
    const player = players[client.id] = {
        client,
        x: 100,
        y: 400,
        currentX: 100,
        currentY: 400,
    };
    client.on("playerMove", position => {
        player.currentX = position[0];
        player.currentY = position[1];
    });
    io.emit("spawnPlayer", { id: client.id, x: 100, y: 400 });
    client.on("disconnect", () => {
        if (players[client.id]) {
            delete players[client.id];
            io.emit("playerLeave", client.id);
        }
    });
});
function gameLoop() {
    for (let playerId in players) {
        const player = players[playerId];
        const lastX = player.x;
        const lastY = player.y;
        const newX = player.currentX;
        const newY = player.currentY;
        const deltaX = newX - lastX;
        const deltaY = newY - lastY;
        if (deltaX !== 0 || deltaY !== 0) {
            player.x = newX;
            player.y = newY;
            player.client.broadcast.emit("playerMove", [playerId, deltaX, deltaY]);
        }
    }
}
setInterval(gameLoop, 15);
function emitPlayerList(client) {
    let playerList = Object.keys(players);
    playerList = playerList.map((id) => {
        const player = players[id];
        return {
            id,
            x: player.x,
            y: player.y,
        };
    });
    client.emit("playerList", playerList);
}
io.listen(80);
