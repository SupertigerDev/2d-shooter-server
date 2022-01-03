import IO from "socket.io";
import { HeroNames } from "../constants/HERO_NAMES";
import { HERO_PROPERTIES } from "../constants/HERO_PROPERTIES";
import { firstMap } from "../maps/firstMap";
import { Map } from "../maps/Map";
import { Payload } from "./Payload";
import { Player } from "../players/Player";
import { Server } from "./Server";
import { HeroPick } from "../utils";
import { Log } from "./Log";

export class Lobby {
  server: Server;
  players: {[key: string]: Player};
  io: IO.Server
  payload: Payload;
  map: Map
  teamOnePlayerIds: string[];
  teamTwoPlayerIds: string[];
  constructor(server: Server) {
    this.server = server;
    this.map = firstMap;
    this.players = {};
    
    this.teamOnePlayerIds = [];
    this.teamTwoPlayerIds = [];

    this.payload = new Payload(this);
    this.io = this.server.io
    this.server.io.on("connection", client => this.onConnected(client))
  }
  gameLoop(deltaTime: number) {

    this.payload.dx = 0;
    this.payload.dy = 0;
    this.payload.nearbyPlayers = [];

    for (let playerId in this.players) {
      const player = this.players[playerId];
      player.gameLoop(deltaTime);
    }

    this.payload.handleMovement(deltaTime);
  }


  addPlayer(username: string, client: IO.Socket) {
    Log.info(username, "has joined the lobby.")
    const HeroPlayer = HeroPick(HeroNames.soldier);
    const player = new HeroPlayer(username, this, client, 100, 400, 0);
    if (this.teamOnePlayerIds.length <= this.teamTwoPlayerIds.length) {
      this.teamOnePlayerIds.push(player.id)
      player.team = 1;
    } else {
      this.teamTwoPlayerIds.push(player.id)
      player.team = 2;
    }
    this.players[client.id] = player
    this.io.emit("spawnPlayer", player.toJSON())
    return player;
  }

  removePlayer(id: string) {
    if (!this.players[id]) return;
    Log.info(this.players[id].username, "has left the lobby.")

    delete this.players[id];
    const teamOneIndex = this.teamOnePlayerIds.indexOf(id)
    const teamTwoIndex = this.teamTwoPlayerIds.indexOf(id)
    if (teamOneIndex >= 0) {
      this.teamOnePlayerIds.splice(teamOneIndex, 1)
    } else if (teamTwoIndex >= 0) {
      this.teamTwoPlayerIds.splice(teamTwoIndex, 1)
    }
    this.io.emit("playerLeave", id)
  }
  onConnected(client: IO.Socket) {
    client.on("setUsername", username => this.onSetUsername(username, client))
    client.on("disconnect", () => this.onDisconnected(client))
  }
  onSetUsername(username: string, client: IO.Socket) {
    if (username.length >= 50) return;
    client.emit("overrideHeroProperties", HERO_PROPERTIES)

    this.emitPlayerList(client);
    this.addPlayer(username, client);

    this.emitPayloadPosition(client);
  }
  onDisconnected(client: IO.Socket) {
    this.removePlayer(client.id);
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