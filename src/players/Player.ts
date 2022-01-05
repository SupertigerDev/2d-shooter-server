import IO from "socket.io";
import { HeroNames } from "../constants/HERO_NAMES";
import { Hero, HERO_PROPERTIES } from "../constants/HERO_PROPERTIES";
import { Lobby } from "../common/Lobby";
import { Server } from "../common/Server";
import { getPlayerCorners, getTileAtCords, pointInPoly } from "../utils";
import { SoldierPlayer } from "./SoldierPlayer";
import { ReplayActionType, ReplayManager } from "../common/ReplayManager";
import { Log } from "../common/Log";

export class Player {
  client: IO.Socket;
  health: number;
  id: string;
  x: number;
  y: number;
  angle: any;
  hero: Hero;
  currentX: number;
  currentY: number;
  currentAngle: number;
  server: Server;
  io: IO.Server;
  lobby: Lobby
  team: number;
  username: string;
  heroId: HeroNames;
  constructor(username: string, lobby: Lobby,client: IO.Socket, x: number, y: number, angle: number) {
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

    this.heroId = HeroNames.soldier
    this.hero = HERO_PROPERTIES[this.heroId]
    this.health = this.hero.maxHealth;


    this.currentX = this.x;
    this.currentY = this.y;
    this.currentAngle = this.angle;

    
    client.on("playerMove", data => this.onMove(data, client, this))
    client.on("playerRotate", data => this.onRotate(data, client, this))
    client.on("playerMoveAndRotate", data => this.onMoveAndRotate(data, client, this))

  }

  gameLoop(delta: number) {
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
        this.client.broadcast.emit("playerMoveAndRotate", [this.id, deltaX, deltaY, newAngle])
        this.lobby.replayManager.addAction(ReplayActionType.ROTATE_AND_MOVE, this.id, deltaX, deltaY, newAngle);
      } else {
        this.client.broadcast.emit("playerMove", [this.id, deltaX, deltaY])
        this.lobby.replayManager.addAction(ReplayActionType.MOVEMENT, this.id, deltaX, deltaY);

      }
    }
    if (deltaX === 0 && deltaY === 0) {
      if (didAngleChange) {
        this.angle = newAngle;
        this.client.broadcast.emit("playerRotate", [this.id, newAngle])
        this.lobby.replayManager.addAction(ReplayActionType.ROTATION, this.id, newAngle);
      }
    }
  }



  damaged(damaged: number, damagedBy: Player) {
    this.health -= damaged;
    if (this.health <= 0) {
      this.health = 0;
    }
    this.io.emit("playerDamaged", {id: this.id, health: this.health})
    this.lobby.replayManager.addAction(ReplayActionType.PLAYER_DAMAGED, this.id, this.health);

    if (this.health === 0) {
      Log.info(this.username, "has been killed by", damagedBy.username)
      
      this.client.emit("playerKilled", {playerId: this.id, killerId: damagedBy.id})
      this.lobby.replayManager.addAction(ReplayActionType.PLAYER_KILLED, this.id, damagedBy.id);

      const recentActions = this.lobby.replayManager.getRecentActions();
      this.client.emit("showKillCam", {killedBy: damagedBy.id, recentActions: recentActions})
    }

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



  toJSON(){
    return {
      id: this.id,
      username: this.username,
      heroId: this.heroId,
      x: this.x,
      y: this.y,
      angle: this.angle,
      health: this.health,
      team: this.team
    }
  }
}