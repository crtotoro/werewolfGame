import { Role } from './index.js';

export class Player {
  constructor(name) {
    this.name = name;
    this.key = this.name.toLowerCase().replace(' ','-');
    this.role = null;
    this.alive = true;
    this.eliminatedBy = null; // if not alive, player who eliminated
    this.vote = false; // specific to day cycle
    this.isAttacked = false; // specific to night cycle
    this.isProtected = false; // specific to night cycle
    this.attacking = null; // specific to night cycle
  }

  static fromData(data, game) {
    let player = new Player(data.name);
    Object.assign(player, data);
    player.role = game.roles.find(role => role.key === data.role.key);
    return player;
  }

  assignRole(roleToAssign) {
    this.role = roleToAssign;
    this.role.assign();
  }

  resetRole() {
    this.role.unassign();
    this.role = null;
  }

  castVote(vote) {
    this.vote = vote;
  }

  resetVote() {
    this.vote = false;
  }

  eliminated(eliminatedBy) {
    this.alive = false;
    this.eliminatedBy = eliminatedBy;
  }
}