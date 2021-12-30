import {Server, Socket} from 'socket.io';

const io = new Server({transports: ["websocket"]});

const heroProperties = {
  soldier: {
    maxHealth: 200,
    walkSpeed: 0.5,
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


function gameLoop() {
  for (let playerId in players) {
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