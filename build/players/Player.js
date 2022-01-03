"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const HERO_NAMES_1 = require("../constants/HERO_NAMES");
const HERO_PROPERTIES_1 = require("../constants/HERO_PROPERTIES");
class Player {
    constructor(username, lobby, client, x, y, angle) {
        this.username = username;
        this.lobby = lobby;
        this.server = lobby.server;
        this.io = this.server.io;
        this.client = client;
        this.id = client.id;
        this.team = -1;
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.hero = HERO_PROPERTIES_1.HERO_PROPERTIES[HERO_NAMES_1.HeroNames.soldier];
        this.health = this.hero.maxHealth;
        this.currentX = this.x;
        this.currentY = this.y;
        this.currentAngle = this.angle;
        client.on("playerMove", data => this.onMove(data, client, this));
        client.on("playerRotate", data => this.onRotate(data, client, this));
        client.on("playerMoveAndRotate", data => this.onMoveAndRotate(data, client, this));
    }
    gameLoop(delta) {
        this.handleMovement();
        this.lobby.payload.handleNearbyPlayer(this);
    }
    handleMovement() {
        const lastX = this.x;
        const lastY = this.y;
        const newX = this.currentX;
        const newY = this.currentY;
        const oldAngle = this.angle;
        const newAngle = this.currentAngle;
        const didAngleChange = oldAngle !== newAngle;
        const deltaX = newX - lastX;
        const deltaY = newY - lastY;
        if (deltaX !== 0 || deltaY !== 0) {
            this.x = newX;
            this.y = newY;
            if (didAngleChange) {
                this.angle = newAngle;
                this.client.broadcast.emit("playerMoveAndRotate", [this.id, deltaX, deltaY, newAngle]);
            }
            else {
                this.client.broadcast.emit("playerMove", [this.id, deltaX, deltaY]);
            }
        }
        if (deltaX === 0 && deltaY === 0) {
            if (didAngleChange) {
                this.angle = newAngle;
                this.client.broadcast.emit("playerRotate", [this.id, newAngle]);
            }
        }
    }
    damaged(damaged) {
        this.health -= damaged;
        if (this.health <= 0) {
            this.health = 0;
        }
        this.io.emit("playerDamaged", { id: this.id, health: this.health });
    }
    onMove(position, client, player) {
        player.currentX = position[0];
        player.currentY = position[1];
    }
    onRotate(angle, client, player) {
        player.currentAngle = angle;
    }
    onMoveAndRotate(position, client, player) {
        player.currentX = position[0];
        player.currentY = position[1];
        player.currentAngle = position[2];
    }
    toJSON() {
        return {
            id: this.id,
            username: this.username,
            x: this.x,
            y: this.y,
            angle: this.angle,
            health: this.health,
            team: this.team
        };
    }
}
exports.Player = Player;
