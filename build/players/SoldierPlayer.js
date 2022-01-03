"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoldierPlayer = void 0;
const Player_1 = require("./Player");
const HERO_PROPERTIES_1 = require("../constants/HERO_PROPERTIES");
const HERO_NAMES_1 = require("../constants/HERO_NAMES");
const utils_1 = require("../utils");
console.log(Player_1.Player);
class SoldierPlayer extends Player_1.Player {
    constructor(username, lobby, client, x, y, angle) {
        super(username, lobby, client, x, y, angle);
        this.isShooting = false;
        this.hero = HERO_PROPERTIES_1.HERO_PROPERTIES[HERO_NAMES_1.HeroNames.soldier];
        client.on("playerShoot", () => this.onShoot(client));
    }
    gameLoop(delta) {
        super.gameLoop(delta);
        this.handleShooting();
    }
    handleShooting() {
        const map = this.lobby.map;
        const tileSize = this.server.tileSize;
        if (!this.isShooting)
            return;
        this.isShooting = false;
        const xAngle = Math.cos(this.angle);
        const yAngle = Math.sin(this.angle);
        let lineX = this.x;
        let lineY = this.y;
        for (let index = 0; index < 100; index++) {
            lineX += xAngle * 8;
            lineY += yAngle * 8;
            const tile = (0, utils_1.getTileAtCords)(map, Math.floor(lineX / tileSize), Math.floor(lineY / tileSize));
            if (tile === null || tile === void 0 ? void 0 : tile.collision)
                break;
            for (let enemyId in this.lobby.players) {
                const enemyPlayer = this.lobby.players[enemyId];
                if (this.team === enemyPlayer.team)
                    continue;
                const hero = enemyPlayer.hero;
                const corners = (0, utils_1.getPlayerCorners)(enemyPlayer.x, enemyPlayer.y, enemyPlayer.angle, hero.size);
                if ((0, utils_1.pointInPoly)(corners, lineX, lineY)) {
                    enemyPlayer.damaged(hero.gunDamage);
                    return;
                }
            }
        }
    }
    onShoot(client) {
        this.isShooting = true;
    }
}
exports.SoldierPlayer = SoldierPlayer;
