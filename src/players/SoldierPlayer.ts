import { Lobby } from "../common/Lobby";
import { Player } from "./Player";

import IO from 'socket.io';
import { HERO_PROPERTIES } from "../constants/HERO_PROPERTIES";
import { HeroNames } from "../constants/HERO_NAMES";
import { getPlayerCorners, getTileAtCords, pointInPoly } from "../utils";

export class SoldierPlayer extends Player {
  isShooting: boolean;
  constructor(username: string, lobby: Lobby, client: IO.Socket, x: number, y: number, angle: number) {
    super(username, lobby,client, x, y, angle)

    this.isShooting = false;
    this.heroId = HeroNames.soldier
    this.hero = HERO_PROPERTIES[this.heroId]

    client.on("playerShoot", () => this.onShoot(client))
  }
  gameLoop(delta: number) {
    super.gameLoop(delta);
    this.handleShooting();
  }
  handleShooting() {
    const map = this.lobby.map;
    const tileSize = this.server.tileSize
    if (!this.isShooting) return;
    this.isShooting = false;

      
    const xAngle = Math.cos(this.angle)
    const yAngle = Math.sin(this.angle)

    let lineX = this.x
    let lineY = this.y

    for (let index = 0; index < 100; index++) {

      lineX += xAngle * 8;
      lineY += yAngle * 8;

      const tile = getTileAtCords(map, Math.floor(lineX / tileSize), Math.floor(lineY / tileSize))

      if(tile?.collision) break

      for (let enemyId in this.lobby.players) {
        const enemyPlayer = this.lobby.players[enemyId];
        if (this.team === enemyPlayer.team) continue;
        const hero = enemyPlayer.hero
        const corners = getPlayerCorners(enemyPlayer.x, enemyPlayer.y, enemyPlayer.angle, hero.size);
        if (pointInPoly(corners, lineX, lineY)) {
          enemyPlayer.damaged(hero.gunDamage, this)
          return;
        }
      }    
    }
  }

  private onShoot(client: IO.Socket) {
    this.isShooting = true;
  }
}