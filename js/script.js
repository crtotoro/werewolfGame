import WerewolfGame from "./werewolf.js";
import { darkenHexColor } from "./utilities.js";


// global variables
var storedGame = localStorage.getItem("currentGame");
var currentGame = JSON.parse(storedGame) ? Object.assign(new WerewolfGame(), JSON.parse(storedGame)) : new WerewolfGame();
window.currentGame = currentGame;


// crud functions
function addPlayer() {
  let playerName = document.getElementById("new-player").value;
  if(!playerName) return;
  currentGame.addPlayers(playerName);
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
    
    let rolePortrait = document.createElement("img");
    rolePortrait.id = `${player.key}-player-img`; rolePortrait.src = `images/${player.role.selectedImage}.png`; rolePortrait.className = "role-portrait-small";
    rolePortrait.addEventListener('click', e => toggleImage(e.target.id));

    let roleName = document.createElement("p");
    roleName.innerText = `${player.role.name}`;

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

function newRoleCard(role) {
  let roleCard = document.createElement("div");
  roleCard.id = `${role.key}-role`; roleCard.className = "list-tile"; roleCard.style.background = `linear-gradient(to top left, ${darkenHexColor(role.color, 20)}, ${role.color})`;
  console.log(role.name, role.color)
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
  // refresh active player list
  const activeList = document.getElementById("active-players-list"); 
  while(activeList.firstChild) activeList.removeChild(activeList.firstChild);
  if(currentGame.living) currentGame.living.forEach(player => activeList.appendChild(newPlayerCard(player)));

  // refresh graveyard list
  const graveyardList = document.getElementById("graveyard-list");
  while(graveyardList.firstChild) graveyard.removeChild(graveyardList.firstChild);
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
  let roleKey = null; 
  let playerKey = null;

  /role/i.test(imageId) ? roleKey = imageId.replace('-role-img','') : playerKey = imageId.replace('-player-img','');

  let foundRole = roleKey ? currentGame.roles.find(role => role.key === roleKey) : currentGame.players.find(player => player.key === playerKey).role;

  let currentIndex = foundRole.images.indexOf(foundRole.selectedImage);
  let nextIndex = (currentIndex + 1) % foundRole.images.length;

  foundRole.selectedImage = foundRole.images[nextIndex];
  document.getElementById(imageId).src = `images/${foundRole.selectedImage}.png`;  
}

function beginDay() {
  const morningAnnouncements = currentGame.getMorningAnnouncements();
  for(let i = 0; i < morningAnnouncements.length; i++) {
    let announcement = document.createElement("p");
    announcement.innerText = morningAnnouncements[i];
    document.getElementById("announcement-board").appendChild(announcement);
  }
  let dayTimer = document.createElement("p");
  dayTimer.id = "day-timer";
  document.getElementById("announcement-board").appendChild(dayTimer);
  
  const startTime = new Date().getTime();
  setInterval(updateDayTimer, 1000, startTime)


}


function updateDayTimer(startTime) {
  const timer = document.getElementById("day-timer");
  const now = new Date().getTime();
  const elapsed = now - startTime;
  const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
  timer.innerText = `Daytime elapsed: ${minutes ? minutes + 'm ': ''}${seconds}s`;
}

// at page launch

document.addEventListener('DOMContentLoaded', () => {
  
  if (window.location.pathname === '/index.html') {
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
  } else if (window.location.pathname === '/game.html') {
    refreshPlayerStatuses();
    beginDay();
  }});

// window.BeforeUnloadEvent = () => {
//   localStorage.setItem("currentGame", JSON.stringify(currentGame));
// }



// listening for:
// expansion toggle




export { refreshPlayerList, toggleImage };