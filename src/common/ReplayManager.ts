import { Lobby } from "./Lobby"

export enum ReplayActionType {
  //[SPAWN_PLAYER, playerJSON]
  SPAWN_PLAYER = 1,
  //[LEAVE_PLAYER, id]
  LEAVE_PLAYER = 2,
  //[SPAWN_PAYLOAD, x, y]
  SPAWN_PAYLOAD = 3,
  //[MOVEMENT, playerId, deltaX, deltaY]
  MOVEMENT = 4,
  //[ROTATION, playerId, rotation]
  ROTATION = 5,
  //[ROTATE_AND_MOVE, playerId, deltaX, deltaY, rotation]
  ROTATE_AND_MOVE = 6,
  //[PLAYER_DAMAGED, playerId, newHealth]
  PLAYER_DAMAGED = 7,
  //[PAYLOAD_MOVE_X, x]
  PAYLOAD_MOVE_X = 8,
  //[PAYLOAD_MOVE_X, y]
  PAYLOAD_MOVE_Y = 9
}

export class ReplayManager {
  lobby: Lobby;
  actionsOnTick: Array<[ReplayActionType, ...any][]>;
  currentTick: number;
  constructor(lobby: Lobby) {
    this.lobby = lobby;
    this.actionsOnTick = [[]]
    this.currentTick = 0;
  }
  getRecentActions() {
    // get last 5 seconds of actions
    const latestItemsCount = Math.floor(5000/15);
    const startIndex = this.actionsOnTick.length - 1 - latestItemsCount;
    const trackPositions = this.trackPositionsUntil(startIndex);
    const actions = this.actionsOnTick.slice(-latestItemsCount);
    return {trackPositions, actions};
  }
  trackPositionsUntil(index: number) {
    let players: any = {};
    let payload = {x: 0, y: 0}
    for (let x = 0; x < this.actionsOnTick.length; x++) {
      const actions = this.actionsOnTick[x];
      for (let y = 0; y < actions.length; y++) {
        const action = actions[y];
        if (action[0] === ReplayActionType.SPAWN_PLAYER) {
          players[action[1].id] = action[1];
        }
        if (action[0] === ReplayActionType.LEAVE_PLAYER) {
          delete players[action[1]]
        }
        if (action[0] === ReplayActionType.SPAWN_PAYLOAD) {
          payload.x = action[1]
          payload.y = action[2]
        }
        if (action[0] === ReplayActionType.MOVEMENT) {
          players[action[1]].x += action[2]
          players[action[1]].y += action[3]
        }
        if (action[0] === ReplayActionType.ROTATION) {
          players[action[1]].angle = action[2]
        }
        if (action[0] === ReplayActionType.ROTATE_AND_MOVE) {
          players[action[1]].x += action[2]
          players[action[1]].y += action[3]
          players[action[1]].angle = action[4]
        }
        if (action[0] === ReplayActionType.PLAYER_DAMAGED) {
          players[action[1]].health = action[2];
        }
        if (action[0] === ReplayActionType.PAYLOAD_MOVE_X) {
          payload.x = action[1];
        }
        if (action[0] === ReplayActionType.PAYLOAD_MOVE_Y) {
          payload.y = action[1];
        }
      }
      if (x === index) break;
    }
    return {players, payload}

  }
  addAction(type: ReplayActionType, ...data: any[]) {
    this.actionsOnTick[this.currentTick].push([type, ...data]);
  }
  nextTick() {
    this.actionsOnTick.push([]);
    this.currentTick++;
  }
}