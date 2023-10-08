export default class WerewolfGame {
  constructor(players = [], werewolfCount = null, expansion = false) {
    this.expansion = expansion;
    this.players = players;
    this.unassignedPlayers = [...this.players]
    this.assignedPlayers = [];
    this.roles = [
      { name: 'Werewolf', key: 'werewolf', color: '#832727', ability: 'Werewolves take human form during the day, doing their best Town Resident impression. When the moon rises, the pack embraces their true form and hunts one victim each night.', winCondition: 'Ravage town to match its population.', reminder: 'nightly', assigned: 0, expansion: false, enabled: true, images: ["werewolf-both"], selectedImage: null },
      { name: 'Town Resident', key: 'town-resident', color: '#E4A685', ability: "Town Residents are eager to help despite always getting picked last. They may not be the best at fighting werewolves... <span>but if you need 'em, they can vote.</span>", winCondition: 'Eliminate Werewolves to save town.', reminder: null, assigned: 0, expansion: false, enabled: true, images: ["town_resident-male", "town_resident-female"], selectedImage: null },
      { name: 'Sheriff', key: 'sheriff', color: '#EBB663', ability: "Sworn to serve, the Sheriff investigates one player each night.  While they learn if the player is a werewolf, other specifics are elusive.", winCondition: 'Eliminate Werewolves to save town.', reminder: 'nightly', assigned: false, expansion: false, enabled: true, images: ["sheriff-male", "sheriff-female"], selectedImage: null },
      { name: 'Doctor', key: 'doctor', color: '#79D0E4', ability: 'The town Doctor takes a hippocratic oath to save one player each night. If successful, they must choose a new patient next time.', winCondition: 'Eliminate Werewolves to save town.', reminder: 'nightly', lastSavedPlayer: null, assigned: false, expansion: false, enabled: true, images: ["doctor-male", "doctor-female"], selectedImage: null },
      { name: 'Vigilante', key: 'vigilante', color: '#C5BFB1', ability: 'Ever inconspicuous, the Vigilante strikes from the cover of night to eliminate one player, and one player only. <span>May their aim be true.</span>', winCondition: 'Eliminate Werewolves to save town.', reminder: null, assigned: false, expansion: false, enabled: true, images: ["vigilante-male", "vigilante-female"], selectedImage: null },
      { name: 'Mimic', key: 'mimic', color: '#D690B1', ability: 'Mimic chooses a player during the first night and morphs into their role for the game. If Mimic selects a Werewolf, they become a Vigilante.', winCondition: 'Eliminate Werewolves to save town.', reminder: null, assigned: false, expansion: true, enabled: true, images: ["mimic-male", "mimic-female"], selectedImage: null },
      { name: 'Mayor', key: 'mayor', color: '#63A5B4', ability: "The Mayor sways the votes to make their own count twice, but in doing so reveals their role. <span>Will they earn a target on their back?</span>", winCondition: 'Eliminate Werewolves to save town.', reminder: 'voting', assigned: false, expansion: true, enabled: true, images: ["mayor-male", "mayor-female"], selectedImage: null },
      { name: 'Medium', key: 'medium', color: '#B9B5B2', ability: 'Medium sees dead chat at all times, but cannot communicate back. If medium dies, they may send one final message to a living player.', winCondition: 'Eliminate Werewolves to save town.', reminder: null, assigned: false, expansion: true, enabled: true, images: ["medium-male", "medium-female"], selectedImage: null },
      { name: 'Bodyguard', key: 'bodyguard', color: '#7C6860', ability: 'Bodyguard chooses a player to protect each night. If that player is attacked, the attacker is killed. May only save one player per game.', winCondition: 'Eliminate Werewolves to save town.', reminder: 'nightly', assigned: false, expansion: true, enabled: true, images: ["bodyguard-male", "bodyguard-female"], selectedImage: null },
      { name: 'Overworked Investigator', key: 'overworked-investigator', color: '#C8A887', ability: 'Fueled by caffiene and takeout food, Overworked Investigator works through the night once per game to learn the specific role of two players.', winCondition: 'Eliminate Werewolves to save town.', reminder: 'nightly', assigned: false, expansion: true, enabled: true, images: ["overworked_investigator-male", "overworked_investigator-female"], selectedImage: null },
      { name: 'Rogue', key: 'rogue', color: '#92BD76', ability: 'Keen and distrusting, Rogue follows one player each night. The first time the player they follow attacks them, they survive and their attacker is eliminated.', winCondition: 'Eliminate Werewolves to save town.', reminder: 'nightly', assigned: false, expansion: true, enabled: true, images: ["rogue-male", "rogue-female"], selectedImage: null },
      { name: 'Witch Doctor', key: 'witch-doctor', color: '#D690B1', ability: 'A keeper of forbidden knowledge, the Witch Doctor may conduct an ancient ritual one night per game to return a player from the valley of death.', winCondition: 'Eliminate Werewolves to save town.', reminder: 'nightly', assigned: false, expansion: true, enabled: true, images: ["witch_doctor-male", "witch_doctor-female"], selectedImage: null },
      { name: 'Jester', key: 'jester', color: '#A781B4', ability: "Jesters are neither resident nor werewolf. <span>Are they even human?</span> Just try not to trust these tricksters; they'll totally turn the town into a circus of circular insanity.", winCondition: 'Get voted out.', reminder: null, assigned: false, expansion: true, enabled: true, images: ["jester-male", "jester-female"], selectedImage: null },
    ];
    this.roles.forEach(role => {
      role.selectedImage = role.images[0];
    });
    this.potentialRoles = this.roles.filter(role => {
      this.expansion ? role.enabled && role.name !== 'Town Resident' : !role.expansion && role.enabled; 
    });
    this.baseTownRoles = this.roles.filter(role => role.name !== 'Werewolf' && role.name !== 'Town Resident' && role.enabled && !role.expansion);
    this.expansionTownRoles = this.roles.filter(role => role.enabled && role.expansion);
    this.gameRoles = [[...this.baseTownRoles], this.expansion ? [...this.expansionTownRoles] : []];
    this.living = this.players
    this.eliminated = [];
    this.playerCount = this.players.length;
    this.werewolfCount = werewolfCount ? werewolfCount : this.getWerewolfCount();
    this.livingCount = this.living.length;
    this.eliminatedCount = this.eliminated.length;
    this.day = 1;
    this.night = false;
  }

  getWerewolfCount() {
    return this.expansion ? Math.ceil(this.playerCount / 4) : Math.ceil(this.playerCount / 5);
  }
  
  addPlayers(names) {
    !Array.isArray(names) ? names = [names] : null;
    names.forEach(name => this.players.push({ name: name, key: `${name.toLowerCase().replace(' ','-')}`, role: null }));
  }

  addRole(name, ability, reminder, winCondition = 'Eliminate Werewolves to save town.', expansion = true) {
    this.roles.push({ name: name, ability: ability, winCondition: winCondition, reminder: reminder, assigned: false, expansion: expansion, enabled: true });
  }

  refreshGameRoles() {
    this.gameRoles = [[...this.baseTownRoles]];
    this.gameRoles.push(this.expansionTownRoles.reduce((enabledRoles, role) => {
      if(role.enabled) enabledRoles.push(role);
      return enabledRoles;
    }, []));
  }

  deleteRoles(names) {
    !Array.isArray(names) ? names = [names] : null;
    names.forEach(name => {
      this.roles = this.roles.filter(role => role.name !== name);
      this.baseTownRoles = this.baseTownRoles.filter(role => role.name !== name);
      this.expansionTownRoles = this.expansionTownRoles.filter(role => role.name !== name);
    });
    this.refreshGameRoles();
  }

  disableRole(name) {
    for(let role of this.roles) role.name === name ? role.enabled = false : null;
  }

  enableRole(name) {
    for(let role of this.roles) role.name === name ? role.enabled = true : null;
  }

  enableAllRoles() {
    for(let role of this.roles) role.enabled = true;
  }
  
  resetRoleAssignments() {
    this.players.forEach(player => player.role = null);
    this.werewolfCount = 0;
  }

  assignRole(selectedPlayer, roleToAssign) {
    const playerIndex = this.unassignedPlayers.findIndex(player => player.name === selectedPlayer.name);
    roleToAssign.assigned = roleToAssign.key === ('werewolf' | 'town-resident') ? roleToAssign.assigned + 1 : true; 
    this.unassignedPlayers[playerIndex].role = roleToAssign;
    this.assignedPlayers.push(this.unassignedPlayers.splice(playerIndex, 1));
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

  assignRoles() {
    
    this.playerCount = this.players.length; // update player count
    if(this.playerCount < 4) {console.log('Error: At least four players needed. Add players and try again.'); return;}; // return error when not enough players
    if(!this.werewolfCount) this.werewolfCount = this.getWerewolfCount();

    this.unassignedPlayers = this.players.filter(player => !player.role);
    // assign werewolves
    for(let werewolf = 0; werewolf < this.werewolfCount; werewolf++) this.assignRole(this.selectPlayer(), this.selectWerewolf());
    // assign town roles
    while(this.unassignedPlayers.length) this.assignRole(this.selectPlayer(), this.selectTownRole());
  }

  toggleExpansion() {
    this.expansion ? this.expansion = false : this.expansion = true;
  }
}




