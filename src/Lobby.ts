import IO from "socket.io";
import { HeroNames } from "./constants/HERO_NAMES";
import { firstMap } from "./maps/firstMap";
import { Map } from "./maps/Map";
import { Payload } from "./Payload";
import { Player } from "./Player";
import { Server } from "./Server";

const heroProperties = {
  soldier: {
    size: 50,
    maxHealth: 200,
    walkSpeed: 0.5,
    gunDamage: 5,
  }
}



export class Lobby {
  server: Server;
  players: {[key: string]: Player};
  io: IO.Server
  payload: Payload;
  map: Map
  constructor(server: Server) {
    this.server = server;
    this.map = firstMap;
    this.players = {};
    this.payload = new Payload(this)
    this.io = this.server.io
    this.server.io.on("connection", client => this.onConnected(client))
  }
  gameLoop(deltaTime: number) {

    this.payload.dx = 0;
    this.payload.dy = 0;
    this.payload.nearbyPlayers = [];

    for (let playerId in this.players) {
      const player = this.players[playerId];
      player.handleMovement();
      player.handleShooting();
      this.payload.handleNearbyPlayer(player);
    }

    this.payload.handleMovement(deltaTime);
  }


  onConnected(client: IO.Socket) {
    client.emit("overrideHeroProperties", heroProperties)

    const player = new Player(this, client, 100, 400, 0, HeroNames.soldier);
    this.emitPlayerList(client);
    this.emitPayloadPosition(client);

    this.players[client.id] = player;

    this.io.emit("spawnPlayer", {id: client.id,  x: player.x, y: player.y, health: player.health})

    client.on("disconnect", () => this.onDisconnected(client))

  }
  onDisconnected(client: IO.Socket) {
    if (!this.players[client.id]) return;
    delete this.players[client.id];
    this.io.emit("playerLeave", client.id)
    
  }
  emitPlayerList(client: IO.Socket) {
    let playerList: any = Object.keys(this.players);

    playerList = playerList.map((id: string) => {
      const player = this.players[id]
      return player.toJSON();
    })
    client.emit("playerList", playerList)
  }
  emitPayloadPosition(client: IO.Socket) {
    client.emit("payloadPosition", {x: this.payload.x, y: this.payload.y})
  }


}