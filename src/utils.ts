import { HeroNames } from "./constants/HERO_NAMES";
import { Map } from "./maps/Map";
import { SoldierPlayer } from "./players/SoldierPlayer";

export function getTileAtCords(map: Map, x: number, y: number) {
  const tiles = map.tiles;
  const texture = map.layout[y]?.[x] || -1;
  if (texture === 0) return;
  return tiles?.[texture - 1]
}
export function HeroPick(hero: HeroNames) {
  switch (hero) {
    case HeroNames.soldier: return SoldierPlayer
    default:
      throw Error("Invalid Hero")
  }
}
export function getPlayerCorners(playerX: number, playerY: number, angle: number, size: number) {
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

export function pointInPoly(vertices: any, testX: number, testY: number) {
  let collision = false;

  const verticesLength = vertices.length;

  for (let i = 0, j = verticesLength - 1; i < verticesLength; j = i++) {
    if (((vertices[i].y > testY) != (vertices[j].y > testY)) &&
         (testX < (vertices[j].x - vertices[i].x) * (testY - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x))
      collision = !collision;
  }
  return collision;
}