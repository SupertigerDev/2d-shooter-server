import {Server, Socket} from 'socket.io';

const io = new Server({transports: ["websocket"]});

const heroProperties = {
  soldier: {
    maxHealth: 200,
    walkSpeed: 0.5,
  }
}

const maps = {
  first_map: {
    payloadRoute: [
      {y: 11, x: 17},
      {y: 11, x: 40},
      {y: 20, x: 40},
    ]
  }
}



interface Player {
  client: Socket;
  x: number;
  y: number;
  angle: number;
  currentX: number;
  currentY: number;
  currentAngle: number;
}

const players: {[key: string]: Player} = {};


const playerSize = 50;
const tileSize = 50;

const payloadSpeed = 10;
const payloadWidth = 150;
const payloadHeight = 100;

const map = maps.first_map;
let payloadX = map.payloadRoute[0].x;
let payloadY = map.payloadRoute[0].y;

let currentPayloadRoute = 0;
let playersNearPayload = [];

io.on('connection', client => { 
  client.emit("overrideHeroProperties", heroProperties)
  console.log("connected")


  emitPlayerList(client);

  const player = players[client.id] = {
    client,
    x: 100,
    y: 400,
    angle: 0,
    currentX: 100,
    currentY: 400,
    currentAngle: 0
  };



  client.on("playerMove", position => {
    player.currentX = position[0];
    player.currentY = position[1]
  })
  client.on("playerMoveAndRotate", position => {
    player.currentX = position[0];
    player.currentY = position[1]
    player.currentAngle = position[2]
  })
  client.on("playerRotate", angle => {
    player.currentAngle = angle;
  })



  io.emit("spawnPlayer", {id: client.id,  x: 100, y: 400})
  
  client.on("disconnect", () => {
    if (players[client.id]) {
      delete players[client.id];
      io.emit("playerLeave", client.id)
    }
  })

});




let lastTime: null | number = null;
function gameLoop() {
  if (!lastTime) {
    lastTime = performance.now();
    return;
  }
  const delta = performance.now() - lastTime;

  playersNearPayload = [];
  for (let playerId in players) {
    const player = players[playerId];
    handleMovement(playerId);
    handlePayloadMovement(playerId, delta);

  }
  lastTime = performance.now();
}

function handlePayloadMovement(playerId: string, delta: number) {
  const player = players[playerId];

  const worldX = payloadX * tileSize - (payloadWidth /2) + (playerSize / 2)
  const worldY = payloadY * tileSize - (payloadHeight/2) + (playerSize / 2)
    const xRadius = 150;
    const yRadius = 120;
    // check if player is near the payload
    const xDistance = Math.abs(player.x - worldX);
    const yDistance = Math.abs(player.y - worldY);

    // this.pushing = false;
    if (xDistance <= xRadius && yDistance <= yRadius) {
      const nextRoutePath = map.payloadRoute[currentPayloadRoute + 1]!;
      const xReached = nextRoutePath.x === Math.floor(payloadX);
      const yReached = nextRoutePath.y === Math.floor(payloadY);
      // this.pushing = true;
      if (xReached && yReached) {
        currentPayloadRoute++;
      }
      if (!xReached) {
        payloadX += (payloadSpeed / tileSize) * (delta / tileSize);
        io.emit("payloadMoveX", payloadX);
        // this.angle = 0;
      }
      if (!yReached) {
        payloadY+= (payloadSpeed / tileSize) * (delta / tileSize);
        io.emit("payloadMoveY", payloadY);
        // this.angle = 90;
      }
    }

}

function handleMovement(playerId: string) {
  const player = players[playerId];
  
  const lastX = player.x;
  const lastY = player.y;

  const newX = player.currentX;
  const newY = player.currentY;

  const oldAngle = player.angle;
  const newAngle = player.currentAngle;
  const didAngleChange = oldAngle !== newAngle;

  const deltaX = newX - lastX;
  const deltaY = newY - lastY;

  if (deltaX !== 0 || deltaY !== 0) {
    player.x = newX;
    player.y = newY;
    if (didAngleChange) {
      player.angle = newAngle;
      player.client.broadcast.volatile.emit("playerMoveAndRotate", [playerId, deltaX, deltaY, newAngle])
    } else {
      player.client.broadcast.volatile.emit("playerMove", [playerId, deltaX, deltaY])
    }
  }
  if (deltaX === 0 && deltaY === 0) {
    if (didAngleChange) {
      player.angle = newAngle;
      player.client.broadcast.volatile.emit("playerRotate", [playerId, newAngle])
    }
  }
}


setInterval(gameLoop, 15);


function emitPlayerList(client: Socket) {
  let playerList: any = Object.keys(players);

  playerList = playerList.map((id: string) => {
    const player = players[id]
    return {
      id,
      x: player.x,
      y: player.y,
    }
  })
  client.emit("playerList", playerList)
}

io.listen(80);