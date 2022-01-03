"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payload = void 0;
/** Players must escort the payload to win. */
class Payload {
    constructor(lobby) {
        this.lobby = lobby;
        this.server = this.lobby.server;
        this.io = this.server.io;
        this.currentRouteIndex = 0;
        this.x = this.lobby.map.payloadRoute[this.currentRouteIndex].x;
        this.y = this.lobby.map.payloadRoute[this.currentRouteIndex].y;
        this.speed = 10;
        this.width = 150;
        this.height = 100;
        this.nearbyPlayers = [];
        this.dx = 0;
        this.dy = 0;
    }
    handleNearbyPlayer(player) {
        const tileSize = this.server.tileSize;
        const map = this.lobby.map;
        const worldX = this.x * tileSize - (this.width / 2) + (player.hero.size / 2);
        const worldY = this.y * tileSize - (this.height / 2) + (player.hero.size / 2);
        const xRadius = 150;
        const yRadius = 120;
        // check if player is near the payload
        const xDistance = Math.abs(player.x - worldX);
        const yDistance = Math.abs(player.y - worldY);
        if (xDistance <= xRadius && yDistance <= yRadius) {
            this.nearbyPlayers.push(player.id);
            const currentRoute = map.payloadRoute[this.currentRouteIndex];
            const nextRoutePath = map.payloadRoute[this.currentRouteIndex + 1];
            const xReached = nextRoutePath.x === Math.floor(this.x);
            const yReached = nextRoutePath.y === Math.floor(this.y);
            if (xReached && yReached) {
                this.currentRouteIndex++;
            }
            if (!xReached) {
                this.dx = nextRoutePath.x > currentRoute.x ? 1 : -1;
            }
            if (!yReached) {
                this.dy = nextRoutePath.y > currentRoute.y ? 1 : -1;
            }
        }
    }
    handleMovement(delta) {
        const tileSize = this.server.tileSize;
        // TODO: move payload faster when the playersNearPayload array is larger.
        if (this.dx) {
            this.x += this.dx * (this.speed / tileSize) * (delta / tileSize);
            this.io.emit("payloadMoveX", this.x);
        }
        if (this.dy) {
            this.y += this.dy * (this.speed / tileSize) * (delta / tileSize);
            this.io.emit("payloadMoveY", this.y);
        }
    }
    toJSON() {
        return {
            x: this.x,
            y: this.y,
        };
    }
}
exports.Payload = Payload;
