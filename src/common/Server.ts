import IO from 'socket.io';
import { Lobby } from './Lobby';
import { Log } from './Log';

export class Server {
  io: IO.Server;
  tick: number;
  lastTime: null | number;
  lobby: Lobby;
  tileSize: number;
  loops: number;
  constructor() {
    this.io = new IO.Server({transports: ["websocket"]});
    this.io.listen(80)
    Log.info("Server started on port 80")

    this.tileSize = 50;

    this.lobby = new Lobby(this);

    this.tick = 15 // milliseconds
    this.lastTime = null
    this.gameLoop()
    this.loops = 0;
  }
  gameLoop() {
    if (!this.lastTime) {
      this.lastTime = performance.now();
      setTimeout(this.gameLoop.bind(this), this.tick);
      return;
    }
    const delta = performance.now() - this.lastTime;

    // const start = performance.now();
    
    this.lobby.gameLoop(delta);

    // if (this.loops % 500 === 0) {
    //   console.log("Last frame took " + (performance.now() - start) + "ms")
    // }
    this.loops++;
    this.lastTime = performance.now();
    setTimeout(this.gameLoop.bind(this), this.tick);
  }


}