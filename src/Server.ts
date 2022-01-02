import IO from 'socket.io';
import { Lobby } from './Lobby';

export class Server {
  io: IO.Server;
  tick: number;
  lastTime: null | number;
  lobby: Lobby;
  tileSize: number;
  constructor() {
    this.io = new IO.Server({transports: ["websocket"]});
    this.io.listen(80)

    this.tileSize = 50;

    this.lobby = new Lobby(this);

    this.tick = 15 // milliseconds
    this.lastTime = null
    this.gameLoop()
  }
  gameLoop() {
    if (!this.lastTime) {
      this.lastTime = performance.now();
      setTimeout(this.gameLoop.bind(this), this.tick);
      return;
    }
    const delta = performance.now() - this.lastTime;
    
    this.lobby.gameLoop(delta);

    this.lastTime = performance.now();
    setTimeout(this.gameLoop.bind(this), this.tick);
  }


}