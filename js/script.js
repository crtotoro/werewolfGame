import { WerewolfGame, Role, Player, darkenHexColor } from "./index.js";


// global variables
var currentGame = new WerewolfGame();
window.currentGame = currentGame;
loadGame();
loadPageContent();

// crud functions
function addPlayer() {
  let playerName = document.getElementById("new-player").value;
  if(!playerName) return;
  currentGame.addPlayer(playerName);
  refreshPlayerList();
  document.getElementById("new-player").value = '';
}

function saveGame() {
  localStorage.setItem("currentGame", JSON.stringify(currentGame));
}

function loadGame() {
  const gameData = JSON.parse(localStorage.getItem("currentGame"));
  if(gameData) currentGame.loadSavedGame(gameData);
  else console.log("No game data found. Starting new game.");
}

// render functions
function createPlayerCard(player) {
  const card = document.createElement("div");
  card.id = `${player.key}`; 

  const playerName = document.createElement("h3");
  playerName.id = `${player.key}-header`; playerName.className = "name"; playerName.innerText = `${player.name}`;
  card.appendChild(playerName);
  
  if(player.role) {
    card.className = "assigned-player-tile";
    
    const roleName = document.createElement("p");
    roleName.innerText = `${player.role.name}`;

    const rolePortrait = document.createElement("img");
    rolePortrait.id = `${player.key}-player-img`; rolePortrait.src = `images/${player.role.selectedImage}.png`; rolePortrait.className = "role-portrait-small";
    rolePortrait.addEventListener('click', e => toggleImage(e.target.id));

    card.style.background = `linear-gradient(to top left, ${darkenHexColor(player.role.color, 20)}, ${player.role.color})`;
    card.appendChild(rolePortrait); 
    card.appendChild(roleName);

    
  } else {
    card.className = "initial-player-tile";
    if(window.location.pathname === "/index.html" || "/werewolfGame/") {
      const deletePlayerBtn = document.createElement("button");
      deletePlayerBtn.className = "icon-btn"; 
      deletePlayerBtn.addEventListener("click", () => {
        currentGame.deletePlayer(`${player.key}`);
        saveGame();
        refreshPlayerList();
      });
      const deleteIcon = document.createElement("img");
      
      deleteIcon.src = "./icons/delete-action.svg"; deleteIcon.alt = "Delete Player Button";
      deletePlayerBtn.appendChild(deleteIcon);
      card.appendChild(deletePlayerBtn);
    }
  }

  return card;
}

function createDayPlayerCard(player) {
  const card = document.createElement("div");
  const portrait = document.createElement("img");
  const playerName = document.createElement("h3");
  
  card.id = `${player.key}`; 
  card.className = "game-player-tile";
  card.style.background = `linear-gradient(to top left, ${darkenHexColor(player.role.color, 20)}, ${player.role.color})`

  portrait.src = `./images/${player.role.selectedImage}.png`; 
  portrait.alt = `${player.name} ${player.role.name} Portrait`; 
  portrait.className = "player-portrait";

  playerName.innerText = `${player.name}`;

  card.appendChild(portrait);
  card.appendChild(playerName);
  if(!currentGame.night) {
    card.addEventListener("click", () => {
      const instructions = document.getElementById("instructions");
      instructions.innerText = `${player.name} nominated for elimination. Select Start Vote to confirm.`;
      addStartVoteBtn(player);
    })
  }
  return card;
}

function createPlayerVotingCard(player) {
  const card = document.createElement("div");
  const portrait = document.createElement("img");
  const playerName = document.createElement("h3");
  const votingFor = document.createElement("p");
  const eliminateBtn = document.createElement("button");
  const keepBtn = document.createElement("button");
  const eliminateImage = document.createElement("img");
  const keepImage = document.createElement("img");
  
  
  card.id = `${player.key}`; 
  card.className = "voting-player-tile";
  card.style.background = `linear-gradient(to top left, ${darkenHexColor(player.role.color, 20)}, ${player.role.color})`

  portrait.src = `./images/${player.role.selectedImage}.png`; 
  portrait.alt = `${player.name} ${player.role.name} Portrait`; 
  portrait.className = "player-portrait";

  playerName.innerText = `${player.name}`;

  votingFor.innerText = `Eliminate ${currentGame.nominated.name}?`

  eliminateBtn.className = "icon-btn";
  eliminateImage.src = "./icons/vote-eliminate-inactive.svg";
  eliminateBtn.appendChild(eliminateImage);
  keepBtn.className = "icon-btn"
  keepImage.src = "./icons/vote-keep-inactive.svg";
  keepBtn.appendChild(keepImage);

  eliminateBtn.addEventListener("click", () => {
    player.castVote(true);
    hasVoted(player);
    
    eliminateImage.src = "./icons/vote-eliminate-active.svg";
    keepImage.src = "./icons/vote-keep-inactive.svg";
  });
  keepBtn.addEventListener("click", () => {
    player.castVote(false);
    hasVoted(player);
    keepImage.src = "./icons/vote-keep-active.svg";
    eliminateImage.src = "./icons/vote-eliminate-inactive.svg";
  })

  card.appendChild(portrait);
  card.appendChild(playerName);
  card.appendChild(votingFor);
  card.appendChild(eliminateBtn);
  card.appendChild(keepBtn);

  // mayor ability
  const mayor = currentGame.players.find(player => player.role.key === "mayor");
  if(mayor && player.key === mayor.key) {
    const mayorAbilityBtn = document.createElement("button");
    const mayorAbilityImage = document.createElement("img");
  
    mayorAbilityBtn.className = "icon-btn";
    mayorAbilityImage.src = player.abilityUsed ? "./icons/mayor-revealed.svg" : "./icons/mayor-hidden.svg";
    mayorAbilityBtn.appendChild(mayorAbilityImage);
    mayorAbilityBtn.addEventListener("click", () => {
      if(!player.abilityUsed) {
        player.abilityUsed = true;
        mayorAbilityImage.src = "./icons/mayor-revealed.svg";
      }
    })
    card.appendChild(mayorAbilityBtn);
  }

  return card;
}

function createNightPlayerCard(player) {
  const card = document.createElement("div");
  const portrait = document.createElement("img");
  const playerName = document.createElement("h3");
  const roleName = document.createElement("h4");
  const ability = document.createElement("p");

  card.id = `${player.key}`; 
  card.className = "night-card";
  card.style.background = `linear-gradient(to top left, ${darkenHexColor(player.role.color, 20)}, ${player.role.color})`
  
  portrait.src = `./images/${player.role.selectedImage}.png`;
  portrait.alt = `${player.name} ${player.role.name} Portrait`;
  portrait.className = "player-portrait";

  playerName.innerText = `${player.name}`;
  roleName.innerText = `${player.role.name}`;
  ability.innerText = `${player.role.ability}`;

  // ww

  // doctor

  // vigilante

  // sheriff

  // mimic

  // overworked investigator

  // rogue

  // bodyguard

  // witch doctor

}

function newRoleCard(role) {
  let roleCard = document.createElement("div");
  roleCard.id = `${role.key}-role`; roleCard.className = "list-tile"; roleCard.style.background = `linear-gradient(to top left, ${darkenHexColor(role.color, 20)}, ${role.color})`;
  let rolePortrait = document.createElement("img");
  rolePortrait.id = `${role.key}-role-img`; rolePortrait.src = `images/${role.selectedImage}.png`; rolePortrait.className = "role-portrait";
  rolePortrait.addEventListener('click', e => toggleImage(e.target.id));

  let roleName = document.createElement("h3");
  roleName.className = "role-name"; roleName.innerText = `${role.name}`;

  let description = document.createElement("p");
  description.className = "role-description"; description.innerHTML = `${role.description}`;

  let winCondition = document.createElement("p");
  winCondition.className = "win-condition"; winCondition.innerText = `Goal: ${role.winCondition.toUpperCase()}`;

  roleCard.appendChild(rolePortrait); roleCard.appendChild(roleName); roleCard.appendChild(description); roleCard.appendChild(winCondition);
  return roleCard;
}


// refresh functions
function refreshPlayerList() {
  let playerList = document.getElementById("players-list");
  while(playerList.firstChild) playerList.removeChild(playerList.firstChild);
  if(currentGame.players) { 
    currentGame.players.forEach(player => playerList.appendChild(createPlayerCard(player)));
  }
}

function refreshPlayerCards() {
  const activeList = document.getElementById("active-players-list"); 
  const graveyardList = document.getElementById("graveyard-list");
  const existingInstructions = document.getElementById("instructions");
  const instructions = document.createElement("p");
  const dayInstructions = "Click a player card to nominate for elimination or proceed to night when ready.";
  const nightInstructions = "Select the ability/target for each player listed. If their ability is optional, you can continue to the next day without using their ability.";
  
  instructions.id = "instructions";
  instructions.innerText = currentGame.night ? nightInstructions : dayInstructions;
    
  // refresh active player list
  while(activeList.lastChild !== existingInstructions) activeList.removeChild(activeList.lastChild);
  if(!existingInstructions) activeList.appendChild(instructions);
  if(currentGame.living) currentGame.living.forEach(player => activeList.appendChild(createDayPlayerCard(player)));

  // refresh graveyard list
  while(graveyardList.firstChild) graveyardList.removeChild(graveyardList.firstChild);
  if(currentGame.graveyard) currentGame.graveyard.forEach(player => graveyardList.append(createPlayerCard(player)));
}

function refreshRoleList() {
  const list = document.getElementById("roles-list");
  while(list.firstChild) list.removeChild(list.firstChild);
  let activeRoles = [ currentGame.roles[0] ];

  if(currentGame.expansion) {
    currentGame.baseTownRoles.forEach(role => role.enabled ? activeRoles.push(role) : null);
    currentGame.expansionTownRoles.forEach(role => role.enabled ? activeRoles.push(role) : null);} 
  else {
    activeRoles.push(currentGame.roles[1]);
    currentGame.baseTownRoles.forEach(role => role.enabled ? activeRoles.push(role) : null);}

  activeRoles.forEach(role => list.appendChild(newRoleCard(role)));
}




// buttons

function addStartGameButton() {
  const startGameBtn = document.createElement("input");
  startGameBtn.id = "start-game-btn"; startGameBtn.type = "button"; startGameBtn.className = "primary-btn"; startGameBtn.value = "Start Game";
  startGameBtn.addEventListener("click", () => {
    saveGame();
    window.location.href = "game.html";
  });
  document.getElementById("game-setup").appendChild(startGameBtn);
}

// voting fucntionality
function addStartVoteBtn(player) {
  const setupBar = document.getElementById("game-setup");
  const existingStartVoteBtn = document.getElementById("vote-btn");
  if(existingStartVoteBtn) existingStartVoteBtn.remove();
  const startVoteBtn = document.createElement("input");
  startVoteBtn.id = "vote-btn"; startVoteBtn.type = "button"; startVoteBtn.className = "primary-btn"; startVoteBtn.value = "Start Vote";
  startVoteBtn.addEventListener("click", () => toggleVoting(player));
  setupBar.appendChild(startVoteBtn);
  addCancelVoteBtn();
}

function addCancelVoteBtn() {
  const setupBar = document.getElementById("game-setup");
  const existingCancelVoteBtn = document.getElementById("cancel-vote-btn");
  if(!existingCancelVoteBtn) {
    const cancelVoteBtn = document.createElement("input");
    cancelVoteBtn.id = "cancel-vote-btn"; cancelVoteBtn.type = "button"; cancelVoteBtn.className = "primary-btn"; cancelVoteBtn.value = "Cancel Voting";
    cancelVoteBtn.addEventListener("click", () => cancelVoting());
    setupBar.appendChild(cancelVoteBtn);
  }
}

// actions

function hasVoted(player) {
  const playerCardClasses = document.getElementById(`${player.key}`).classList;
  if(player.vote) {
    if(playerCardClasses.contains("voted-against")) playerCardClasses.replace("voted-against", "voted-for");
    else if(!playerCardClasses.contains("voted-for")) playerCardClasses.add("voted-for");
  } else {
    if(playerCardClasses.contains("voted-for")) playerCardClasses.replace("voted-for", "voted-against");
    else if(!playerCardClasses.contains("voted-against")) playerCardClasses.add("voted-against");
  } 
}

function toggleVoting(player) {
  const startVoteBtn = document.getElementById("vote-btn");
  const cancelVoteBtn = document.getElementById("cancel-vote-btn")
  const activeList = document.getElementById("active-players-list");
  const instructions = document.getElementById("instructions");
  if(startVoteBtn.value === "Start Vote") {
    currentGame.startVote(player);
    while(activeList.lastChild !== instructions) activeList.removeChild(activeList.lastChild);
    currentGame.living.forEach(player => activeList.appendChild(createPlayerVotingCard(player)));
    postAnnouncement(`Voting to eliminate ${currentGame.nominated.name}...`);
    instructions.innerText = `Voting to eliminate ${player.name} is open. Register each player's vote below. Minus to eliminate, plus to keep. Select End Vote to tally results.`;
    startVoteBtn.value = "End Voting";
  } else if(startVoteBtn.value === "End Voting") {
    tallyVotes();
    
    instructions.innerText = "Voting has closed. Nominate another player or proceed to night when ready."
    startVoteBtn.remove();
    cancelVoteBtn.remove();
  }
}

function cancelVoting() {
  const voteButton = document.getElementById("vote-btn");
  if(voteButton.value === "End Voting") postAnnouncement("Voting canceled.");
  currentGame.resetVotes();
  document.getElementById("instructions").remove();
  voteButton.remove();
  refreshPlayerCards();
  document.getElementById("cancel-vote-btn").remove();
}

function tallyVotes() {
  const voteResults = currentGame.countVotes();
  const mayor = currentGame.living.find(player => player.role.key === 'mayor');
  let eliminateVotes = voteResults.eliminate.length;
  let keepVotes = voteResults.keep.length;
  if(mayor && mayor.abilityUsed) mayor.vote ? eliminateVotes++ : keepVotes++;

  currentGame.living.forEach(player => {
    if(mayor && mayor.abilityUsed && player.key === mayor.key) postAnnouncement(`Mayor ${player.name} voted twice to ${player.vote ? 'ELIMINATE' : 'KEEP'}.`);
    else postAnnouncement(`${player.name} voted to ${player.vote ? 'ELIMINATE' : 'KEEP'}.`);
  });

  if(eliminateVotes > keepVotes) {
    currentGame.nominated.eliminated('vote');
    postAnnouncement(`Vote passed ${eliminateVotes} to ${keepVotes}. ${voteResults.nominee} has been eliminated.`);
    checkForWinner();
  } else {
    postAnnouncement(`Vote failed ${eliminateVotes} to ${keepVotes}. ${voteResults.nominee} remains in town.`);
  }
  currentGame.resetVotes();
  refreshPlayerCards();
} 

function checkForWinner() {
  const result = currentGame.checkWinCondition();
  if(result) {
    // replace this with navigation to a winner overview page based on the results
    if(result === 'Werewolves') postAnnouncement("The town's population is too low. Werewolves win!");
    else if(result === 'Town') postAnnouncement("The town has eliminated the werewolf threat. Town wins!");
    else if(result === 'Jester') postAnnouncement("What is that sound? Whistling... laughing... crying? The festival of madness has descended upon the town. This could mean only one thing... The Jester wins!");
    postAnnouncement("Game over. Thank you for playing.")
  } 
}

function toggleImage(imageId) {
  let roleKey, playerKey = null;

  /role/i.test(imageId) ? roleKey = imageId.replace('-role-img','') : playerKey = imageId.replace('-player-img','');

  let foundRole = roleKey ? currentGame.roles.find(role => role.key === roleKey) : currentGame.players.find(player => player.key === playerKey).role;
  foundRole.toggleSelectedImage();
  document.getElementById(imageId).src = `images/${foundRole.selectedImage}.png`;  
}

function postAnnouncement(announcement) {
  const announcementBoard = document.getElementById("event-log");
  const newAnnouncement = document.createElement("p");
  newAnnouncement.innerText = announcement;
  if(/(day|night)\s[0-9]/i.test(announcement)) {
    newAnnouncement.style.fontWeight = "800";
    newAnnouncement.style.textDecoration = "underline";
  }
  announcementBoard.appendChild(newAnnouncement);
}

// append day/night icon and time elapsed
function displayElapsedTime() {
  const gameSetup = document.getElementById("game-setup");
  
  const dayOrNightIcon = document.createElement("img");
  dayOrNightIcon.src = currentGame.night ? "./icons/moon-light.svg" : "./icons/sun-light.svg";
  dayOrNightIcon.alt = currentGame.night ? "Moon" : "Sun";
  
  const elapsedTime = document.createElement("p");
  elapsedTime.id = "day-night-timer";
  setInterval(updateTimer, 1000, new Date().getTime());
  
  // nest icon and elapsed time in a div
  const elapsedTimeDiv = document.createElement("div");
  elapsedTimeDiv.id = "time-elapsed"; 
  elapsedTimeDiv.className = "timer";
  elapsedTimeDiv.appendChild(dayOrNightIcon); 
  elapsedTimeDiv.appendChild(elapsedTime);
  
  gameSetup.appendChild(elapsedTimeDiv);
}

function updateTimer(startTime) {
  const elapsedTime = document.getElementById("day-night-timer");

  const now = new Date().getTime();
  const elapsed = now - startTime;
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);

  // set time elapsed
  elapsedTime.innerText = `${minutes ? minutes + 'm ': ''}${seconds}s`;
}

// at page launch
function loadPageContent() {
  const currentPath = window.location.pathname;

  document.addEventListener('DOMContentLoaded', () => {
    if(currentPath === '/index.html' || currentPath.endsWith('/werewolfGame/')) {
      setupGame();
    } else if(currentPath === '/game.html' || currentPath.endsWith('/werewolfGame/game.html')) {
      startNewDay();
    }
  });
}

function setupGame() {
  refreshRoleList();
  
  // if there are players, display related content
  if(currentGame.players.length) {
    refreshPlayerList();
    // if there are at least four players and roles are assigned, enable start game
    if(currentGame.playerCount >= 4 && !currentGame.unassignedPlayers.length) {
      addStartGameButton();
      document.getElementById("assign-roles-btn").value = "Reset Roles";
    }
  }

  // set expansion toggle starting point and handle events
  const expansionToggleButton = document.getElementById("expansion-toggle");
  if(currentGame.expansion) expansionToggleButton.setAttribute("checked", "checked");
  expansionToggleButton.addEventListener('change', () => {
    currentGame.toggleExpansion();
    refreshRoleList(); 
  });

  // add player button/input
  document.getElementById("add-player-btn").addEventListener("click", addPlayer);
  document.getElementById("new-player").addEventListener("keyup", e => {if(e.key === "Enter" || event.keyCode === 13) addPlayer()});
  
  // assign/reset roles
  document.getElementById("game-setup").addEventListener("click", e => {
    if(e.target.id === "assign-roles-btn" && e.target.value === "Assign Roles") {
      let alertMessage = document.querySelector(".alert-message");
      if(currentGame.playerCount >= 4) {
        // remove alert message if displayed
        alertMessage ? document.getElementById("players").removeChild(alertMessage) : null;
        currentGame.refreshGameRoles();
        currentGame.assignRoles();

        refreshPlayerList();
        addStartGameButton();
        e.target.value = "Reset Roles";
      } else {
        // display alert message to add players
        if(alertMessage) {
          alertMessage.innerText = `Add at least ${4 - currentGame.playerCount} more players.`;
        } else {
          alertMessage = document.createElement("p");
          alertMessage.className = "alert-message"; alertMessage.innerText = `Add at least ${4 - currentGame.playerCount} more players.`
          document.getElementById("players").appendChild(alertMessage);
        }
        
      }
      
    } else if (e.target.id === "assign-roles-btn" && e.target.value === "Reset Roles") {
      currentGame.resetRoleAssignments();
      refreshPlayerList();
      document.getElementById("start-game-btn").remove();
      e.target.value = "Assign Roles";
    }
  });
}

function startNewDay() {
  currentGame.night = false;
  currentGame.day++;
  refreshPlayerCards();
  currentGame.getMorningAnnouncements().forEach(announcement => postAnnouncement(announcement));
  
  const dayTimer = document.createElement("p");
  dayTimer.id = "day-timer";
  document.getElementById("game-setup").appendChild(dayTimer);
  displayElapsedTime();
}

function startNewNight() {
  currentGame.night = true;

}



window.refreshPlayerList = () => refreshPlayerList();