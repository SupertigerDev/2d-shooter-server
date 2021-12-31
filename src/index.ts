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
let payloadDx = 0;
let payloadDy = 0;

let currentPayloadRoute = 0;
let playersNearPayload = [];

io.on('connection', client => { 
  client.emit("overrideHeroProperties", heroProperties)
  console.log("connected")


  emitPlayerList(client);
  emitPayloadPosition(client);


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

  payloadDx = 0;
  payloadDy = 0;
  playersNearPayload = [];
  for (let playerId in players) {
    handleMovement(playerId);
    checkNearByPayloadPlayers(playerId, delta);
  }
  
  handlePayloadMovement(delta);

  lastTime = performance.now();
}

function handlePayloadMovement(delta: number) {

  // TODO: move payload faster when the playersNearPayload array is larger.
  if (payloadDx) {
    payloadX += payloadDx *(payloadSpeed / tileSize) * (delta / tileSize);
    io.emit("payloadMoveX", payloadX);
  }
  if (payloadDy) {
    payloadY+= payloadDy  * (payloadSpeed / tileSize) * (delta / tileSize);
    io.emit("payloadMoveY", payloadY);
  }

}

function checkNearByPayloadPlayers(playerId: string, delta: number) {
  const player = players[playerId];

  const worldX = payloadX * tileSize - (payloadWidth /2) + (playerSize / 2)
  const worldY = payloadY * tileSize - (payloadHeight/2) + (playerSize / 2)
    const xRadius = 150;
    const yRadius = 120;
    // check if player is near the payload
    const xDistance = Math.abs(player.x - worldX);
    const yDistance = Math.abs(player.y - worldY);


    if (xDistance <= xRadius && yDistance <= yRadius) {
      playersNearPayload.push(playerId)
      const currentRoute = map.payloadRoute[currentPayloadRoute]!;
      const nextRoutePath = map.payloadRoute[currentPayloadRoute + 1]!;
      const xReached = nextRoutePath.x === Math.floor(payloadX);
      const yReached = nextRoutePath.y === Math.floor(payloadY);
      if (xReached && yReached) {
        currentPayloadRoute++;
      }
      if (!xReached) {
        payloadDx = nextRoutePath.x > currentRoute.x ? 1 : -1;
      }
      if (!yReached) {
        payloadDy = nextRoutePath.y > currentRoute.y ? 1 : -1;
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
      angle: player.angle
    }
  })
  client.emit("playerList", playerList)
}
function emitPayloadPosition(client: Socket) {
  client.emit("payloadPosition", {x: payloadX, y: payloadY})
}
io.listen(80);