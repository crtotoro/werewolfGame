import { Role } from './index.js';

export class Player {
  constructor(name) {
    this.name = name;
    this.key = this.name.toLowerCase().replace(' ','-');
    this.role = null;
    this.alive = true;
    this.vote = false;
    this.targeted = false;
    this.protected = false;
    this.attackedPlayer = null;
  }

  static fromData(data) {
    let player = new Player(data.name);
    Object.assign(player, data);
    player.role = Role.fromData(data.role);
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

  eliminate() {
    this.alive = false;
  }
}