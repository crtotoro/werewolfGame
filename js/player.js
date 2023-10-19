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
    this.protecting = null; // specific to body guard or doctor night cycle
    this.attacking = null; // specific to night cycle
    this.following = null; // specific to rogue night cycle
    this.turnTaken = false; // resets after each night
    this.abilityUsed = false; // applies to roles with single use ability
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

  attack(player, game) {
    if(this.abilityUsed) {
      console.log(`Error: ${this.name} already used their only ${this.role.name} ability.`)
      return;
    }
    const singleUseRoles = game.roles.filter(role => role.singeUseAbility);
    player.isAttacked = true;
    this.attacking = player;
    this.turnTaken = true;
    if(singleUseRoles.find(role => role.key === player.role.key)) this.abilityUsed = true;
  }

  protect(player) {
    if(this.abilityUsed) {
      console.log(`Error: ${this.name} already used their only ${this.role.name} ability.`)
      return;
    }
    player.isProtected = true;
    this.protecting = player;
    this.turnTaken = true;
  }

  investigate(player1, player2 = null) {
    if(this.abilityUsed) {
      console.log(`Error: ${this.name} already used their only ${this.role.name} ability.`)
      return;
    }
    if(this.role.key === 'sheriff') {
      return player1.role.key === 'werewolf' ? true : false;
    } else if(this.role.key === 'overworked-investigator') {
      this.abilityUsed = true;
      return [player1.role.name, player2.role.name];
    } else {
      console.log(`Error: ${this.name} is a ${this.role.name} and cannot investigate another player`);
      return;
    };
  }

  copy(player, game) {
    if(this.role.key === 'mimic' && game.day === 1 && night === true) {
      let roleToCopy = player.role;
      if(roleToCopy.key === 'werewolf') {
        const vigilanteRole = game.roles.find(role => role.key === 'vigilante');
        this.assignRole(vigilanteRole);
      } else {
        this.assignRole(player.role);
      }
    } else {
      console.log(`Error: ${player.name} is a ${player.role.name}. Only mimic can copy player role on night one.`);
    };
  }

  follow(player) {
    if(this.abilityUsed) {
        console.log(`Error: ${this.name} already used their only ${this.role.name} ability.`)
        return;
    }
    if(this.role.key === 'rogue') {
      this.following === player;
    } else {
      console.log(`Error: ${player.name} is a ${player.role.name} and cannot follow another player`)
    }
  }

  resurrect(player) {
    if(this.abilityUsed) {
      console.log(`Error: ${this.name} already used their only ${this.role.name} ability.`)
      return;
    }
    if(this.role.key === 'witch-doctor') {
      if(player.alive) {
        console.log(`Error: ${player.name} cannot resurrect a living player. Choose a player from the graveyard.`)
      } else {
        player.alive = true;
        this.abilityUsed = true;
      }
    } else {
      console.log(`Error: ${player.name} is a ${player.role.name} and cannot resurrect another player`)
    }
  }

}