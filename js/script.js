import { WerewolfGame, darkenHexColor } from "./index.js";


// global variables
var currentGame = new WerewolfGame();
var storedGameData = JSON.parse(localStorage.getItem("currentGame"));
if(storedGameData) currentGame.loadStoredGame(storedGameData);
window.currentGame = currentGame;


// crud functions
function addPlayer() {
  let playerName = document.getElementById("new-player").value;
  if(!playerName) return;
  currentGame.addPlayer(playerName);
  refreshPlayerList();
  document.getElementById("new-player").value = '';
}

// render functions
function newPlayerCard(player) {
  let playerCard = document.createElement("div");
  playerCard.id = `${player.key}`; 

  let playerName = document.createElement("h3");
    playerName.id = `${player.key}-header`; playerName.className = "name"; playerName.innerText = `${player.name}`;
    playerCard.appendChild(playerName);
  
  if(player.role) {
    playerCard.className = "assigned-player-tile";
    
    const roleName = document.createElement("p");
    roleName.innerText = `${player.role.name}`;

    const rolePortrait = document.createElement("img");
    rolePortrait.id = `${player.key}-player-img`; rolePortrait.src = `images/${player.role.selectedImage}.png`; rolePortrait.className = "role-portrait-small";
    rolePortrait.addEventListener('click', e => toggleImage(e.target.id));

    playerCard.style.background = `linear-gradient(to top left, ${darkenHexColor(player.role.color, 20)}, ${player.role.color})`;
    playerCard.appendChild(rolePortrait); 
    playerCard.appendChild(roleName);

    
  } else {
    playerCard.className = "initial-player-tile";
    if(window.location.pathname === "/index.html") {
      let deletePlayerBtn = document.createElement("button");
      deletePlayerBtn.className = "icon-btn"; 
      deletePlayerBtn.addEventListener("click", e => {
        currentGame.deletePlayer(`${player.key}`);
        localStorage.setItem("currentGame", JSON.stringify(currentGame));
        refreshPlayerList();
      });
      let deleteIcon = document.createElement("img");
      
      deleteIcon.src = "/icons/delete-action.svg"; deleteIcon.alt = "Delete Player Button";
      deletePlayerBtn.appendChild(deleteIcon);
      playerCard.appendChild(deletePlayerBtn);
    }
  }


  return playerCard;
}

function newDayPlayerCard(player) {
  const card = document.createElement("div");
  const portrait = document.createElement("img");
  const playerName = document.createElement("h3");
  
  card.id = `${player.key}`; 
  card.className = "game-player-tile";
  card.style.background = `linear-gradient(to top left, ${darkenHexColor(player.role.color, 20)}, ${player.role.color})`

  portrait.src = `/images/${player.role.selectedImage}.png`; 
  portrait.alt = `${player.name} ${player.role.name} Portrait`; 
  portrait.className = "player-portrait";

  playerName.innerText = `${player.name}`;

  card.appendChild(portrait);
  card.appendChild(playerName);
  if(!currentGame.night) {
    card.addEventListener("click", e => {
      const instructions = document.getElementById("instructions");
      instructions.innerText = `${player.name} nominated for elimination. Select Start Vote to confirm.`;
      newStartVoteBtn(player);
    })
  }
  return card;
}

function newStartVoteBtn(player) {
  const setupBar = document.getElementById("game-setup");
  const existingStartVoteBtn = document.getElementById("vote-btn");
  if(existingStartVoteBtn) existingStartVoteBtn.remove();
  const startVoteBtn = document.createElement("input");
  startVoteBtn.id = "vote-btn"; startVoteBtn.type = "button"; startVoteBtn.className = "primary-btn"; startVoteBtn.value = "Start Vote";
  startVoteBtn.addEventListener("click", () => toggleVoting(player));
  setupBar.appendChild(startVoteBtn);
  newCancelVoteBtn();
}

function newCancelVoteBtn() {
  const setupBar = document.getElementById("game-setup");
  const existingCancelVoteBtn = document.getElementById("cancel-vote-btn");
  if(!existingCancelVoteBtn) {
    const cancelVoteBtn = document.createElement("input");
    cancelVoteBtn.id = "cancel-vote-btn"; cancelVoteBtn.type = "button"; cancelVoteBtn.className = "primary-btn"; cancelVoteBtn.value = "Cancel Voting";
    cancelVoteBtn.addEventListener("click", () => cancelVoting());
    setupBar.appendChild(cancelVoteBtn);
  }
}

function cancelVoting() {
  const voteButton = document.getElementById("vote-btn");
  if(voteButton.value === "End Voting") postAnnouncement("Voting canceled.");
  currentGame.resetVotes();
  document.getElementById("instructions").remove();
  voteButton.remove();
  refreshPlayerStatuses();
  document.getElementById("cancel-vote-btn").remove();
}

function newDayVotingCard(player) {
  const card = document.createElement("div");
  const portrait = document.createElement("img");
  const playerName = document.createElement("h3");
  const eliminateBtn = document.createElement("button");
  const keepBtn = document.createElement("button");
  const eliminateImage = document.createElement("img");
  const keepImage = document.createElement("img");
  
  card.id = `${player.key}`; 
  card.className = "game-player-tile";
  card.style.background = `linear-gradient(to top left, ${darkenHexColor(player.role.color, 20)}, ${player.role.color})`

  portrait.src = `/images/${player.role.selectedImage}.png`; 
  portrait.alt = `${player.name} ${player.role.name} Portrait`; 
  portrait.className = "player-portrait";

  playerName.innerText = `${player.name}`;

  eliminateBtn.className = "icon-btn";
  eliminateImage.src = "/icons/vote-eliminate-inactive.svg";
  eliminateBtn.appendChild(eliminateImage);
  keepBtn.className = "icon-btn"
  keepImage.src = "/icons/vote-keep-inactive.svg";
  keepBtn.appendChild(keepImage);

  eliminateBtn.addEventListener("click", e => {
    player.vote = true;
    eliminateImage.src = "/icons/vote-eliminate-active.svg";
    keepImage.src = "/icons/vote-keep-inactive.svg";
  });
  keepBtn.addEventListener("click", e => {
    player.vote = false;
    keepImage.src = "/icons/vote-keep-active.svg";
    eliminateImage.src = "/icons/vote-eliminate-inactive.svg";
  })

  card.appendChild(portrait);
  card.appendChild(playerName);
  card.appendChild(eliminateBtn);
  card.appendChild(keepBtn);
  return card;
}



function toggleVoting(player) {
  const startVoteBtn = document.getElementById("vote-btn");
  const cancelVoteBtn = document.getElementById("cancel-vote-btn")
  const activeList = document.getElementById("active-players-list");
  const instructions = document.getElementById("instructions");
  if(startVoteBtn.value === "Start Vote") {
    currentGame.startVote(player);
    while(activeList.lastChild !== instructions) activeList.removeChild(activeList.lastChild);
    currentGame.living.forEach(player => activeList.appendChild(newDayVotingCard(player)));
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

function tallyVotes() {
  const voteResults = currentGame.countVotes();
  if(voteResults.eliminate.length > voteResults.keep.length) {
    currentGame.nominated.eliminate();
    postAnnouncement(`Vote passed. ${voteResults.nominee} has been eliminated.`);}
  else postAnnouncement(`Vote failed. ${voteResults.nominee} remains in town.`);
  currentGame.resetVotes();
  refreshPlayerStatuses();
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


function newRoleCard(role) {
  let roleCard = document.createElement("div");
  roleCard.id = `${role.key}-role`; roleCard.className = "list-tile"; roleCard.style.background = `linear-gradient(to top left, ${darkenHexColor(role.color, 20)}, ${role.color})`;
  let rolePortrait = document.createElement("img");
  rolePortrait.id = `${role.key}-role-img`; rolePortrait.src = `images/${role.selectedImage}.png`; rolePortrait.className = "role-portrait";
  rolePortrait.addEventListener('click', e => toggleImage(e.target.id));

  let roleName = document.createElement("h3");
  roleName.className = "role-name"; roleName.innerText = `${role.name}`;

  let description = document.createElement("p");
  description.className = "role-description"; description.innerHTML = `${role.ability}`;

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
    currentGame.players.forEach(player => playerList.appendChild(newPlayerCard(player)));
  }
}

function refreshPlayerStatuses() {
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
  if(currentGame.living) currentGame.living.forEach(player => activeList.appendChild(newDayPlayerCard(player)));

  // refresh graveyard list
  while(graveyardList.firstChild) graveyardList.removeChild(graveyardList.firstChild);
  if(currentGame.graveyard) currentGame.graveyard.forEach(player => graveyardList.append(newPlayerCard(player)));
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

function toggleImage(imageId) {
  let roleKey, playerKey = null;

  /role/i.test(imageId) ? roleKey = imageId.replace('-role-img','') : playerKey = imageId.replace('-player-img','');

  let foundRole = roleKey ? currentGame.roles.find(role => role.key === roleKey) : currentGame.players.find(player => player.key === playerKey).role;
  foundRole.toggleSelectedImage();
  document.getElementById(imageId).src = `images/${foundRole.selectedImage}.png`;  
}

function beginDay() {
  currentGame.getMorningAnnouncements().forEach(announcement => postAnnouncement(announcement));
  const dayTimer = document.createElement("p");
  dayTimer.id = "day-timer";
  document.getElementById("game-setup").appendChild(dayTimer);
  addDayNightTimer();
  


}

function addDayNightTimer() {
  const gameSetup = document.getElementById("game-setup");
  const timeElapsedContainer = document.createElement("div");
  const dayNightIcon = document.createElement("img");
  const timer = document.createElement("p");
  const startTime = new Date().getTime();
  timeElapsedContainer.id = "time-elapsed"; timeElapsedContainer.className = "timer";
  dayNightIcon.src = currentGame.night ? "/icons/moon-light.svg" : "/icons/sun-light.svg";
  dayNightIcon.alt = currentGame.night ? "Moon" : "Sun";
  timer.id = "day-night-timer"
  setInterval(updateTimer, 1000, startTime)

  timeElapsedContainer.appendChild(dayNightIcon); timeElapsedContainer.appendChild(timer);
  gameSetup.appendChild(timeElapsedContainer);
}

function updateTimer(startTime) {
  const timer = document.getElementById("day-night-timer");
  const now = new Date().getTime();
  const elapsed = now - startTime;
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
  timer.innerText = `${minutes ? minutes + 'm ': ''}${seconds}s`;
}

// at page launch

function launchIndex() {
  refreshRoleList();
  if(currentGame.players.length) {
    refreshPlayerList();
    if(currentGame.playerCount >= 4 && !currentGame.unassignedPlayers.length) {
      let startGameBtn = document.createElement("input");
      startGameBtn.id = "start-game-btn"; startGameBtn.type = "button"; startGameBtn.className = "primary-btn"; startGameBtn.value = "Start Game";
      startGameBtn.addEventListener("click", () => {
        localStorage.setItem("currentGame", JSON.stringify(currentGame));
        window.location.href = "game.html";
      });
      document.getElementById("game-setup").appendChild(startGameBtn);
      document.getElementById("assign-roles-btn").value = "Reset Roles";
    }
  }
  // game expansion toggle button
  document.getElementById("expansion-toggle").addEventListener('change', () => {
    currentGame.toggleExpansion();
    refreshRoleList(); 
  });

  // add player button
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
    
        let startGameBtn = document.createElement("input");
        startGameBtn.id = "start-game-btn"; startGameBtn.type = "button"; startGameBtn.className = "primary-btn"; startGameBtn.value = "Start Game";
        startGameBtn.addEventListener("click", () => {
          localStorage.setItem("currentGame", JSON.stringify(currentGame));
          window.location.href = "game.html";
        });
        document.getElementById("game-setup").appendChild(startGameBtn);
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

function launchGame() {
  refreshPlayerStatuses();
  beginDay();
}

document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname === '/game.html' || '/Werewolf/game.html') {
    console.log("launching game content");
    launchGame();
  } else if(window.location.pathname === '/index.html' || '/Werewolf/') {
    console.log("launching index content");
    launchIndex();
  }
});


// window.BeforeUnloadEvent = () => {
//   localStorage.setItem("currentGame", JSON.stringify(currentGame));
// }



// listening for:
// expansion toggle



window.refreshPlayerList = () => refreshPlayerList();