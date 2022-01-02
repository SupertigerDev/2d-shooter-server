import IO from "socket.io";
import { Hero, HERO_PROPERTIES } from "./constants/HERO_PROPERTIES";
import { Lobby } from "./Lobby";
import { Server } from "./Server";
import { getPlayerCorners, getTileAtCords, pointInPoly } from "./utils";

enum HeroNames {
  soldier = "soldier",
}

export class Player {
  client: IO.Socket;
  health: number;
  id: string;
  x: number;
  y: number;
  angle: any;
  hero: Hero;
  isShooting: boolean
  currentX: number;
  currentY: number;
  currentAngle: number;
  server: Server;
  io: IO.Server;
  lobby: Lobby
  constructor(lobby: Lobby,client: IO.Socket, x: number, y: number, angle: number, hero: HeroNames) {
    this.lobby = lobby;
    this.server = lobby.server;
    this.io = this.server.io;
    this.client = client;
    this.id = client.id;
    this.x = x;
    this.y = y;
    this.angle = angle;

    this.hero = HERO_PROPERTIES[hero]
    this.health = this.hero.maxHealth;

    this.isShooting = false;

    this.currentX = this.x;
    this.currentY = this.y;
    this.currentAngle = this.angle;

    
    client.on("playerMove", data => this.onMove(data, client, this))
    client.on("playerRotate", data => this.onRotate(data, client, this))
    client.on("playerMoveAndRotate", data => this.onMoveAndRotate(data, client, this))
    client.on("playerShoot", () => this.onShoot(client, this))

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
        this.client.broadcast.emit("playerMoveAndRotate", [this.id, deltaX, deltaY, newAngle])
      } else {
        this.client.broadcast.emit("playerMove", [this.id, deltaX, deltaY])
      }
    }
    if (deltaX === 0 && deltaY === 0) {
      if (didAngleChange) {
        this.angle = newAngle;
        this.client.broadcast.emit("playerRotate", [this.id, newAngle])
      }
    }
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
        if (enemyId === this.id) continue;
        const hero = enemyPlayer.hero
        const corners = getPlayerCorners(enemyPlayer.x, enemyPlayer.y, enemyPlayer.angle, hero.size);
        if (pointInPoly(corners, lineX, lineY)) {
          enemyPlayer.damaged(hero.gunDamage)
          return;
        }
      }    
    }
  }


  damaged(damaged: number) {
    this.health -= damaged;
    if (this.health <= 0) {
      this.health = 0;
    }
    this.io.emit("playerDamaged", {id: this.id, health: this.health})
  }
  private onMove(position: [number, number], client: IO.Socket, player: Player) {
    player.currentX = position[0];
    player.currentY = position[1];
  }
  private onRotate(angle: number, client: IO.Socket, player: Player) {
    player.currentAngle = angle;
  }
  private onMoveAndRotate(position: [number, number, number], client: IO.Socket, player: Player) {
    player.currentX = position[0];
    player.currentY = position[1];
    player.currentAngle = position[2];
  }
  private onShoot(client: IO.Socket, player: Player) {
    player.isShooting = true;
  }


  toJSON(){
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      angle: this.angle,
      health: this.health
    }
  }
}