"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pointInPoly = exports.getPlayerCorners = exports.HeroPick = exports.getTileAtCords = void 0;
const HERO_NAMES_1 = require("./constants/HERO_NAMES");
const SoldierPlayer_1 = require("./players/SoldierPlayer");
function getTileAtCords(map, x, y) {
    const tiles = map.tiles;
    const texture = map.layout[y][x] || -1;
    if (texture === 0)
        return;
    return tiles === null || tiles === void 0 ? void 0 : tiles[texture - 1];
}
exports.getTileAtCords = getTileAtCords;
function HeroPick(hero) {
    switch (hero) {
        case HERO_NAMES_1.HeroNames.soldier: return SoldierPlayer_1.SoldierPlayer;
        default:
            throw Error("Invalid Hero");
    }
}
exports.HeroPick = HeroPick;
function getPlayerCorners(playerX, playerY, angle, size) {
    const topLeft = GetPointRotated(playerX, playerY, angle, -size / 2, -size / 2);
    const topRight = GetPointRotated(playerX, playerY, angle, size / 2, -size / 2);
    const BottomLeft = GetPointRotated(playerX, playerY, angle, -size / 2, size / 2);
    const BottomRight = GetPointRotated(playerX, playerY, angle, size / 2, size / 2);
    return [topLeft, topRight, BottomRight, BottomLeft];
}
exports.getPlayerCorners = getPlayerCorners;
function GetPointRotated(X, Y, R, Xos, Yos) {
    // Xos, Yos // the coordinates of your center point of rect
    // R      // the angle you wish to rotate
    //The rotated position of this corner in world coordinates    
    var rotatedX = X + (Xos * Math.cos(R)) - (Yos * Math.sin(R));
    var rotatedY = Y + (Xos * Math.sin(R)) + (Yos * Math.cos(R));
    return { x: rotatedX, y: rotatedY };
}
function pointInPoly(vertices, testX, testY) {
    let collision = false;
    const verticesLength = vertices.length;
    for (let i = 0, j = verticesLength - 1; i < verticesLength; j = i++) {
        if (((vertices[i].y > testY) != (vertices[j].y > testY)) &&
            (testX < (vertices[j].x - vertices[i].x) * (testY - vertices[i].y) / (vertices[j].y - vertices[i].y) + vertices[i].x))
            collision = !collision;
    }
    return collision;
}
exports.pointInPoly = pointInPoly;
