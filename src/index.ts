import {Server, Socket} from 'socket.io';

const io = new Server({transports: ["websocket"]});

enum HeroNames {
  soldier = "soldier",
}

const heroProperties = {
  soldier: {
    size: 50,
    maxHealth: 200,
    walkSpeed: 0.5,
    gunDamage: 5,
  }
}

const maps = {
  first_map: {
    id: "first_map",
    name: "First Map",
    description: "First prototype map",
    tiles: [
      {collision: true},
      {},
      {},
    ],
    layout: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],

      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],

    ],
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

  hero: HeroNames;
  health: number;
  isShooting: boolean
  angle: number;
  currentX: number;
  currentY: number;
  currentAngle: number;
}

const players: {[key: string]: Player} = {};


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


  const player: Player = players[client.id] = {
    client,
    x: 100,
    y: 400,
    angle: 0,
    hero: HeroNames.soldier,
    health: heroProperties[HeroNames.soldier].maxHealth,
    isShooting: false,
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


  client.on("playerShoot", () => {
    player.isShooting = true;
  })



  io.emit("spawnPlayer", {id: client.id,  x: player.x, y: player.y, health: player.health})
  
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
    handleShooting(playerId);
    handleMovement(playerId);
    checkNearByPayloadPlayers(playerId, delta);
  }
  
  handlePayloadMovement(delta);

  lastTime = performance.now();
}

function handleShooting(shootingPlayerId: string) {
  const shootingPlayer = players[shootingPlayerId];
  if (!shootingPlayer.isShooting) return;
  shootingPlayer.isShooting = false;

    
  const xAngle = Math.cos(shootingPlayer.angle)
  const yAngle = Math.sin(shootingPlayer.angle)

  let lineX = shootingPlayer.x
  let lineY = shootingPlayer.y

  for (let index = 0; index < 100; index++) {

    lineX += xAngle * 8;
    lineY += yAngle * 8;

    const tile = getTileAtCords(Math.floor(lineX / tileSize), Math.floor(lineY / tileSize))

    if(tile?.collision) break



    for (let enemyId in players) {
      const enemyPlayer = players[enemyId];
      if (enemyId === shootingPlayerId) continue;
      const hero = heroProperties[enemyPlayer.hero];
      const corners = getPlayerCorners(enemyPlayer.x, enemyPlayer.y, enemyPlayer.angle, hero.size);
      if (pointInPoly(corners, lineX, lineY)) {
        playerDamaged(enemyId, hero.gunDamage)
        return;
      }
    }    
  }
}

function getTileAtCords(x: number, y: number) {
  const tiles = map.tiles;
  const texture = map.layout[y][x] || -1;
  if (texture === 0) return;
  return tiles?.[texture - 1]
}

function getPlayerCorners(playerX: number, playerY: number, angle: number, size: number) {
  const topLeft = GetPointRotated(playerX,playerY, angle, -size/2, -size/2)

  const topRight = GetPointRotated(playerX,playerY, angle, size/2, -size/2)

  const BottomLeft = GetPointRotated(playerX,playerY, angle, -size/2, size/2)

  const BottomRight = GetPointRotated(playerX,playerY, angle, size/2, size/2)
  return [topLeft, topRight, BottomRight, BottomLeft]
}

function GetPointRotated(X: number, Y: number, R: number, Xos: number, Yos: number){
  // Xos, Yos // the coordinates of your center point of rect
  // R      // the angle you wish to rotate
  
  //The rotated position of this corner in world coordinates    
  var rotatedX = X + (Xos  * Math.cos(R)) - (Yos * Math.sin(R))
  var rotatedY = Y + (Xos  * Math.sin(R)) + (Yos * Math.cos(R))
  
  return {x: rotatedX, y: rotatedY}
}

function pointInPoly(vertices: any, testX: number, testY: number) {
  let collision = false;

  const verticesLength = vertices.length;

  for (let i = 0, j = verticesLength - 1; i < verticesLength; j = i++) {
    if (((vertices[i].y > testY) != (vertices[j].y > testY)) &&
         (testX < (vertices[j].x - vertices[i].x) * (testY - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x))
      collision = !collision;
  }
  return collision;
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
  const hero = heroProperties[player.hero] 

  const worldX = payloadX * tileSize - (payloadWidth /2) + (hero.size / 2)
  const worldY = payloadY * tileSize - (payloadHeight/2) + (hero.size / 2)
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
      player.client.broadcast.emit("playerMoveAndRotate", [playerId, deltaX, deltaY, newAngle])
    } else {
      player.client.broadcast.emit("playerMove", [playerId, deltaX, deltaY])
    }
  }
  if (deltaX === 0 && deltaY === 0) {
    if (didAngleChange) {
      player.angle = newAngle;
      player.client.broadcast.emit("playerRotate", [playerId, newAngle])
    }
  }
}


setInterval(gameLoop, 15);

function playerDamaged(playerId: string, damaged: number) {
  const damagedPlayer = players[playerId];
  damagedPlayer.health -= damaged;
  if (damagedPlayer.health <= 0) {
    damagedPlayer.health = 0;
  }
  io.emit("playerDamaged", {id: playerId, health: damagedPlayer.health})
}

function emitPlayerList(client: Socket) {
  let playerList: any = Object.keys(players);

  playerList = playerList.map((id: string) => {
    const player = players[id]
    return {
      id,
      x: player.x,
      y: player.y,
      angle: player.angle,
      health: player.health
    }
  })
  client.emit("playerList", playerList)
}
function emitPayloadPosition(client: Socket) {
  client.emit("payloadPosition", {x: payloadX, y: payloadY})
}
io.listen(80);