import { Lobby } from "./Lobby"

export enum ReplayActionType {
  MOVEMENT = 0,
  ROTATION = 1,
  ROTATE_AND_MOVE = 2,
  PLAYER_DAMAGED = 3,
  PAYLOAD_MOVE_X = 4,
  PAYLOAD_MOVE_Y = 5
}
interface Action {
  
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
  addAction(type: ReplayActionType, ...data: any[]) {
    this.actionsOnTick[this.currentTick].push([type, ...data]);
  }
  nextTick() {
    this.actionsOnTick.push([]);
    this.currentTick++;
  }
}