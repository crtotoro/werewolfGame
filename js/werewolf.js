import { Role, Player, rolesData } from "./index.js";

export class WerewolfGame {
  constructor(werewolfCount = null, expansion = false) {
    this.expansion = expansion;
    this.players = [];    
    this.roles = rolesData.map(roleData => new Role(roleData));
    this.baseTownRoles = this.roles.filter(role => role.name !== 'Werewolf' && role.name !== 'Town Resident' && role.enabled && !role.expansionRole);
    this.expansionTownRoles = this.roles.filter(role => role.enabled && role.expansionRole);
    this.gameRoles = [[...this.baseTownRoles], this.expansion ? [...this.expansionTownRoles] : []];
    this.morningAnnouncements = [[]];
    this.werewolfCount = werewolfCount ? werewolfCount : this.getWerewolfCount();
    this.day = 1;
    this.night = false;
    this.nominated = null;
  }

  get potentialRoles() {
    return this.expansion ? this.roles.filter(role => role.enabled) : this.roles.filter(role => role.enabled && !role.expansionRole);
  }

  get assignedPlayers() {
    return this.players.filter(player => player.role);
  }

  get unassignedPlayers() {
    return this.players.filter(player => !player.role);
  }

  get living() {
    return this.players.filter(player => player.alive);
  }

  get graveyard() {
    return this.players.filter(player => !player.alive);
  }

  get playerCount() {
    return this.players.length;
  }

  get livingCount() {
    return this.living.length;
  }

  get eliminatedCount() {
    return this.graveyard.length;
  }

  loadSavedGame(savedGame) {
    this.expansion = savedGame.expansion;
    this.roles = savedGame.roles.map(roleData => Role.fromData(roleData));
    this.players = savedGame.players.map(playerData => Player.fromData(playerData, this));
    this.morningAnnouncements = savedGame.morningAnnouncements;
    this.day = savedGame.day;
    this.night = savedGame.night;
  }

  getWerewolfCount() {
    return this.expansion ? Math.ceil(this.playerCount / 4) : Math.ceil(this.playerCount / 5);
  }
  
  addPlayer(name) {
    this.players.push(new Player(name));
  }

  deletePlayer(key) {
    let playerIndex = this.players.findIndex(player => player.key === key);
    let player = this.players[playerIndex];

    if(player.role) player.role.unassign();
    this.players.splice(playerIndex, 1);
  }

  refreshGameRoles() {
    this.gameRoles = [[...this.baseTownRoles]];
    this.gameRoles.push(this.expansionTownRoles.reduce((enabledRoles, role) => {
      if(role.enabled) enabledRoles.push(role);
      return enabledRoles;
    }, []));
  }

  enableAllRoles() {
    this.roles.forEach(role => role.enable());
  }
  
  resetRoleAssignments() {
    this.players.forEach(player => player.resetRole());
    this.werewolfCount = 0; // should convert ww count to getter
  }

  selectTownRole() {
    if(this.gameRoles[0].length) {
      const randomIndex = Math.floor(Math.random() * this.gameRoles[0].length)
      return this.gameRoles[0].splice(randomIndex, 1)[0];
    } else if(this.expansion && this.gameRoles[1].length) {
      const randomIndex = Math.floor(Math.random() * this.gameRoles[1].length)
      return this.gameRoles[1].splice(randomIndex, 1)[0];
    } else return this.roles[1];
  }

  selectWerewolf() {
    return this.roles[0];
  }

  selectPlayer() { 
    return this.unassignedPlayers[Math.floor(Math.random() * this.unassignedPlayers.length)];
  }

  assignRoles() { // update player count
    if(this.playerCount < 4) {console.log('Error: At least four players needed. Add players and try again.'); return;}; // return error when not enough players
    if(!this.werewolfCount) this.werewolfCount = this.getWerewolfCount();

    // assign werewolves
    for(let werewolf = 0; werewolf < this.werewolfCount; werewolf++) this.selectPlayer().assignRole(this.selectWerewolf());
    // assign town roles
    while(this.unassignedPlayers.length) this.selectPlayer().assignRole(this.selectTownRole());
  }

  toggleExpansion() {
    this.expansion ? this.expansion = false : this.expansion = true;
  }

  getMorningAnnouncements() {
    const day = `Day ${this.day}`
    const introduction = `As the sun rises, ${this.livingCount} players step out of their homes.`;
    const announcements = this.morningAnnouncements[this.day - 1].length ? [...this.morningAnnouncements[day - 1]] : `It was a quiet night... rare in these parts.`;  
    const closing = `Residents gather in the town square to discuss their werewolf problem. They may nominate one player to be eliminated.`;
    // const closing = `The sun sets on Day ${day}. The residents of Werewolf Valley return to their homes, hoping to survive the night.`;
    return [day, introduction, announcements, closing]; 
  }

  startVote(player) {
    this.nominated = player;
  }

  countVotes() {
    let votedToEliminate = [];
    let votedToKeep = [];
    this.living.forEach(player => player.vote ? votedToEliminate.push(player.name) : votedToKeep.push(player.name));
    return { nominee: this.nominated.name, eliminate: votedToEliminate, keep: votedToKeep };
  }

  checkWinCondition() {
    let winner = false;
    const livingWerewolves = this.living.reduce((count, player) => {
      player.role.key === 'werewolf' ? count++ : null;
      return count;
    } , 0)
    const livingResidents = this.living.reduce((count, player) => {
      player.role.key !== 'werewolf' ? count++ : null;
      return count;
    } , 0)
    const jesterInGame = this.players.find(player => player.role.key === 'jester');
    const jesterWon = this.graveyard.find(player => player.role.key === 'jester' && player.eliminatedBy === 'vote');
  
    // check if werewolves won
    if(livingWerewolves === livingResidents) winner = 'Werewolves';
    // check if town won
    else if(!livingWerewolves) winner = 'Town';
    // check if jester won
    else if(jesterInGame && jesterWon) winner = 'Jester'; 
    // else, game continues
    return winner;
  }

  resetVotes() {
    this.players.forEach(player => player.resetVote());
    this.nominated = null;
  }

  // night time role decisions
  targetToKill(player) {
    player.targeted = true;
  }

  protect(player) {
    player.protected = true;
  }

  resetNightActions() {
    this.living.forEach(player => {
      player.targeted = false;
      player.protected = false;
    });
  }

  


}




