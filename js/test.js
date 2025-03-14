// const iceMagicSound = new Audio('./ice-cracking.mp3');
// iceMagicSound.preload = 'auto';
// function playme() {

//     iceMagicSound.play();
// }

let playerHealth = 100;
let playerPosition = { x: 0, y: 0};
let spawnPoint = { x: 0, y: 0} 
let isSpawnSet = false; 
const moveSpeed = 10;
let activeWeapon = null;
let enemyHealth = 100;
let enemiesDefeated = 0;
let playerCharity = 1; // Player's Charity resource
let currentEnemyType = null;
let enemiesSpared = 0; // New global variable for spared enemies
let loreIndex = 0; 
let isInEncounter = false ;
let secretTriggered = false;


const enemyData = {
    Slime: {
        health: 40,
        skills: [{ name: "Slam", damage: 3 }, { name: "Acid Spit", damage: 7 }],
        mercyLore: "The Slime oozes away, grateful for your mercy.",
        skillLore: "You defeated the Slime with a decisive blow.",
    },
    Spider: {
        health: 70,
        skills: [{ name: "Bite", damage: 5 }, { name: "Cocoon", heal: 10 }],
        mercyLore: "The Spider scuttles off, leaving its web behind.",
        skillLore: "You vanquished the Spider with a powerful strike.",
    },
    Wolf: {
        health: 100,
        skills: [{ name: "Claws", damage: 7 }, { name: "Bite", damage: 15, heal: 10 }],
        mercyLore: "The Wolf retreats into the forest, defeated but alive.",
        skillLore: "You defeated the Wolf with a skillful attack.",
    },
    "Skeleton Knight": {
        health: 150,
        skills: [
            { name: "Shield Bash", damage: 15 },
            { name: "Sword Slash", damage: 15 },
            { name: "Mighty Blow", damage: 25 },
        ],
        mercyLore: "The Skeleton Knight bows before vanishing into dust.",
        skillLore: "The Skeleton Knight crumbles under your skillful assault.",
    },
};
const player = document.getElementById("player");
const playerHealthDisplay = document.getElementById("playerHealthDisplay");
const enemyCounter = document.getElementById("enemyCounter");
const equippedWeaponDisplay = document.getElementById('equippedWeapon');
const activeCardSlot = document.getElementById("activeCardSlot");
const closeInventory = document.getElementById('closeModal');
const inventoryModal = document.getElementById("inventoryModal");
const fightButton = document.getElementById("fightButton");
const healButton = document.getElementById("actionButton");
const dodgeButton = document.getElementById("evadeButton");
const mercyButton = document.getElementById("mercyButton");
const combatArea = document.getElementById("combatArea");
const combatEnemyHealth = document.getElementById("combatEnemyHealth");
const combatPlayerHealth = document.getElementById("combatPlayerHealth");
const combatSkills = document.getElementById("combatSkills");
const gameOverScreen = document.getElementById("gameOverScreen");
const restartGame = document.getElementById("restartGame"); 
const enemies = document.querySelectorAll(".enemy");
const weaponCards = document.querySelectorAll(".card");
const playerCharityDisplay = document.createElement("div");
const enemyTypes = Object.keys(enemyData);
const loreModal = document.getElementById("loreModal");
const loreContent = document.getElementById("loreContent");
const prevButton = document.getElementById("prevButton");
const nextButton = document.getElementById("nextButton");
const closeLoreModal = document.getElementById("closeLoreModal");
const secret = document.getElementById("secret");


const slimeSound = new Audio('mp3/slime-monster-noises-66776.mp3'); 
slimeSound.preload = 'auto'; 
slimeSound.loop = true; 

const spiderSound = new Audio('mp3/spider-squeek-85399.mp3');
spiderSound.preload = 'auto';
spiderSound.loop = 'true';

const wolfSound = new Audio('mp3/Wolf-song.mp3');
wolfSound.preload = 'auto';
wolfSound.loop = true ;

const sKSound = new Audio('mp3/Boss-song.mp3');
sKSound.preload = 'auto';
sKSound.loop = true;

function checkSecretTrigger() {
    if (secretTriggered) return; // Prevent triggering again

    const playerRect = player.getBoundingClientRect();
    const secretRect = secret.getBoundingClientRect();

    // Check if player collides with the secret element
    if (
        playerRect.right > secretRect.left &&
        playerRect.left < secretRect.right &&
        playerRect.bottom > secretRect.top &&
        playerRect.top < secretRect.bottom
    ) {
        triggerSecret();
    }
}

function triggerSecret() {
    secretTriggered = true; // Set the flag to prevent further triggers
    alert("You have found the secret!"); // Display an alert or handle the secret's effects here
}

// Function to set the spawn point at the center of the screen
function setSpawnPoint() {
    // Check if spawn point is already set
    if (isSpawnSet) return;

    // Get the screen size
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Calculate the spawn point to center the player
    spawnPoint = {
        x: screenWidth / 2,
        y: screenHeight / 2
    };

    // Update the playerPosition and apply the new spawn point
    playerPosition = { ...spawnPoint };
    updatePlayerPosition(); // Update the visual position of the player on the screen

    // Set the flag to true so the spawn point is only set once
    isSpawnSet = true;
}

// Call the function to set spawn point when the page loads
window.addEventListener("load", () => {
    setSpawnPoint();  // Center player on page load
});

// Optionally, re-center player on window resize
window.addEventListener("resize", () => {
    // Reset the spawn point only if the window has been resized
    isSpawnSet = false; // Allow the spawn point to reset
    setSpawnPoint();  // Recalculate spawn point when the screen size changes
});
// Add Charity Display
playerCharityDisplay.id = "playerCharityDisplay";
playerCharityDisplay.textContent = `Charity: ${playerCharity}`;
combatArea.prepend(playerCharityDisplay);


const sparedCounter = document.createElement("div");
sparedCounter.id = "sparedCounter";
sparedCounter.textContent = `Enemies Spared: ${enemiesSpared}`;
inventoryModal.appendChild(sparedCounter); 



// Weapon Cards


let equippedWeapon = null;

// Open inventory modal with 'i'
document.addEventListener("keydown", (e) => {
    if (e.key === "i" || e.key === "I") {
        inventoryModal.style.display = "flex";
    }
  // Open Lore Modal with "K"
    if (e.key === "k" || e.key === "K") {
        loreModal.style.display = "block"; // Open the lore modal
    }
    
    // Toggle Controls visibility with "P"
    if (e.key === "p" || e.key === "P") {
        const controlsTab = document.getElementById("controls");
        controlsTab.style.display = (controlsTab.style.display === "none") ? "block" : "none";
    }
});
closeInventory.addEventListener("click", () => {
    inventoryModal.style.display = "none";
});

// Weapon Selection
weaponCards.forEach((card) => {
    card.addEventListener("click", () => {
        activeWeapon = card.getAttribute("data-type");
        activeCardSlot.textContent = `Active Weapon: ${activeWeapon}`;
        inventoryModal.style.display = "none";
    });
}); 

document.addEventListener("keydown", (event) => {
    let newX = playerPosition.x;
    let newY = playerPosition.y;

    // Movement controls
    if (event.key === "w") newY -= moveSpeed; // Move up
    if (event.key === "s") newY += moveSpeed; // Move down
    if (event.key === "a") newX -= moveSpeed; // Move left
    if (event.key === "d") newX += moveSpeed; // Move right

    // Temporarily move player to check for collision
    player.style.left = `${newX}px`;
    player.style.top = `${newY}px`;

    function updatePlayerPosition() {
        player.style.left = `${playerPosition.x}px`;
        player.style.top = `${playerPosition.y}px`;
    }

    // Check if player collides with an enemy
    const enemy = checkCollisionWithEnemies();
    if (enemy) {
        if (!activeCardSlot) {
            alert("Equip a weapon before engaging in combat!");
            teleportToSpawn();
            return;
        }
        startCombat(enemy);
        return;
    }
    // Check if player triggers the secret
    checkSecretTrigger();

    // If no collision, update player position
    playerPosition.x = newX;
    playerPosition.y = newY;
    updatePlayerPosition();
});

function checkCollisionWithEnemies() {
    const playerRect = player.getBoundingClientRect();

    // Get all enemies inside the #enemies div
    const enemyContainer = document.getElementById("enemies");
    const enemies = enemyContainer.querySelectorAll(".enemy");

    // Loop through each enemy and check for collision
    return Array.from(enemies).find((enemy) => {
        const enemyRect = enemy.getBoundingClientRect();

        // Check for overlap in bounding boxes
        return !(
            playerRect.right < enemyRect.left ||
            playerRect.left > enemyRect.right ||
            playerRect.bottom < enemyRect.top ||
            playerRect.top > enemyRect.bottom
        );
    });
}

// Function to teleport player back to spawn
function teleportToSpawn() {
    playerPosition = { ...spawnPoint };
    updatePlayerPosition();
}



// Enemy Interactions
enemies.forEach((enemy) => {
    enemy.addEventListener("click", () => {
        if (!activeWeapon) {
            alert("Equip a weapon to start combat!");
            return;
        }
        const enemyType = enemy.getAttribute("data-type");
        stopEnemySound();
        startCombat(enemyType);
    });
}); 

function startCombat(enemyType) {
    if (!enemyData[enemyType]) {
        console.error("Invalid enemy type:", enemyType);
        return;
    } 
}

function startCombat(enemyType) {
    currentEnemyType = enemyType;
    enemyHealth = enemyData[enemyType].health;
    combatEnemyHealth.textContent = `Enemy Health: ${enemyHealth}`;
    combatPlayerHealth.textContent = `Player Health: ${playerHealth}`;
    playerCharity = 1; // Reset charity to 1
    playerCharityDisplay.textContent = `Charity: ${playerCharity}`;
    combatSkills.style.display = "none";
    combatArea.style.display = "block"; 

    switch (enemyType){
        case 'Slime':
            slimeSound.currentTime = 0;
            slimeSound.play();
            break;
            case 'Spider':
                spiderSound.currentTime = 0;
                spiderSound.play() 
                break;
                 case 'Wolf':
                    wolfSound.currentTime = 0;
                    wolfSound.play();
                    break;
                    case 'Skeleton Knight': 
                    sKSound.currentTime=0;
                    sKSound.play();
                    break;
                    default:
                        break;
    }
} 

// Fight Button Logic
fightButton.addEventListener("click", () => {
    if (!activeWeapon) return;
    combatSkills.style.display = "block";
    displaySkills();
});

// Display Skills
function displaySkills() {
    combatSkills.innerHTML = ""; // Clear existing skills
    const skills = getSkills(activeWeapon);
    skills.forEach((skill, index) => {
        const skillButton = document.createElement("button");
        skillButton.textContent = `${skill.name} (Cost: ${skill.cost || 0} Charity)`;
        skillButton.disabled = playerCharity < (skill.cost || 0);

        skillButton.addEventListener("click", () => {
            useSkill(skill);
        });

        combatSkills.appendChild(skillButton);
    });
}

// Get Skills for Weapon
function getSkills(weapon) {
    const skills = {
        light_melee: [
            { name: "Light Swing", cost: 0, damage: 10 },
            { name: "Rapid Slash", cost: 0.5, damage: 20 },
            { name: "Healing Slash", cost: 1, damage: 15, heal: true },
        ],
        medium_melee:  [
            { name: "Medium Swing", cost: 0, damage: 15 },
            { name: "Piercing Thrust", cost: 0.5, damage: 25 },
            { name: "Grab & Slam", cost: 1, damage: 20 },
        ],
        heavy_melee:  [
            { name: "Heavy Swing", cost: 0, damage: 20 },
            { name: "Critical Slam", cost: 0.5, damage: 30 },
            { name: "Spin Attack", cost: 1, damage: 25 },
        ],
        fire_magic:[
            { name: "Fireball", cost: 0, damage: 15 },
            { name: "Explosive Blast", cost: 0.5, damage: 30 },
            { name: "Flame Claymore", cost: 1, damage: 35 },
        ],
        ice_magic:  [
            { name: "Frost Bolt", cost: 0, damage: 12 },
            { name: "Ice Daggers", cost: 0.5, damage: 25 },
            { name: "Frost Field", cost: 1, damage: 0, heal: true },
        ],
        lightning_magic:[
            { name: "Lightning Bolt", cost: 0, damage: 14 },
            { name: "Thunder Javelin", cost: 0.5, damage: 28 },
            { name: "Dual Strikes", cost: 1, damage: 30 },
        ],
    };
    return skills[weapon] || [];
}

// Use Skill Logic
function useSkill(skill) {
    if (playerCharity < (skill.cost || 0)) {
        alert("Not enough Charity!");
        return;
    }

    // Deduct Charity and apply skill effect
    playerCharity -= skill.cost || 0;
    playerCharityDisplay.textContent = `Charity: ${playerCharity}`;
    enemyHealth -= skill.damage;
    combatEnemyHealth.textContent = `Enemy Health: ${enemyHealth}`;

    // Handle healing
    if (skill.heal) {
        playerHealth = Math.min(playerHealth + 20, 100);
        combatPlayerHealth.textContent = `Player Health: ${playerHealth}`;
    }

    // Regenerate Charity
    playerCharity = Math.min(playerCharity + 1, 5);
    playerCharityDisplay.textContent = `Charity: ${playerCharity}`;

    // Check if enemy is defeated
    if (enemyHealth <= 0) {
        defeatEnemy("skill");
    } else {
        enemyTurn();
    }
} 

// Heal Button
healButton.addEventListener("click", () => {
    if (playerCharity < 1) {
        alert("Not enough Charity!");
        return;
    }

    if (playerHealth < 100) {
        playerHealth = Math.min(playerHealth + 20, 100);
        playerCharity--;
        playerCharityDisplay.textContent = `Charity: ${playerCharity}`;
        combatPlayerHealth.textContent = `Player Health: ${playerHealth}`;
        alert("You healed for 20 health!");
    } else {
        alert("Your health is already full!");
    }

    // Regenerate Charity
    playerCharity = Math.min(playerCharity + 1, 5);
    playerCharityDisplay.textContent = `Charity: ${playerCharity}`;
    enemyTurn();
}); 

dodgeButton.addEventListener("click", () => {
    if (playerCharity < 1) {
        alert("Not enough Charity!");
        return;
    }

    playerCharity--;
    playerCharityDisplay.textContent = `Charity: ${playerCharity}`;
    alert("You prepare to dodge the next attack!");
    // Implement dodge logic here
});
  
mercyButton.addEventListener("click", () => {
    if (enemyHealth < 20) {
        // Increase spared counter only
        enemiesSpared++;
        sparedCounter.textContent = `Enemies Spared: ${enemiesSpared}`;
        combatArea.style.display = "none";
        stopEnemySound();
        showLoreModal("mercy", currentEnemyType);
    } else {
        alert("The enemy refuses your mercy!");
    }
}); 

function stopEnemySound(){
    switch (currentEnemyType){
        case 'Slime':
            slimeSound.pause();
            break;
            case 'Spider':
                spiderSound.pause();
                break;
                case 'Wolf':
                    wolfSound.pause();
                    break;
                    case 'Skeleton Knight':
                        sKSound.pause();
                        break;
                        default:
                            break;
    }
}

function defeatEnemy(method) {
    if (method === "skill") {
        // Increase defeated counter only
        enemiesDefeated++;
        enemyCounter.textContent = `Enemies Defeated: ${enemiesDefeated}`;
    }
    combatArea.style.display = "none";
    stopEnemySound();
    showLoreModal(method, currentEnemyType);
} 

// Enemy Turn
function enemyTurn() {
    const enemySkills = enemyData[currentEnemyType].skills;
    const randomSkill = enemySkills[Math.floor(Math.random() * enemySkills.length)];
    const damage = randomSkill.damage || 0;

    if (damage > 0) {
        playerHealth -= damage;
        playerHealth = Math.max(playerHealth, 0); // Ensure player health doesn't go below 0
        combatPlayerHealth.textContent = `Player Health: ${playerHealth}`;

        if (playerHealth <= 0) {
            gameOver();
        } else {
            alert(`Enemy used ${randomSkill.name} and dealt ${damage} damage!`);
        }
    } else if (randomSkill.heal) {
        enemyHealth += randomSkill.heal;
        enemyHealth = Math.min(enemyHealth, enemyData[currentEnemyType].health); // Cap enemy health
        combatEnemyHealth.textContent = `Enemy Health: ${enemyHealth}`;
        alert(`Enemy used ${randomSkill.name} and healed ${randomSkill.heal} health!`);
    }
}  

// Lore Modal Functions
function showLoreModal(method, type) {
    loreIndex = enemyTypes.indexOf(type);
    updateLoreContent(method);
    loreModal.style.display = "block";
}

function updateLoreContent(method) {
    const enemyType = enemyTypes[loreIndex];
    const lore = method === "mercy" 
        ? enemyData[enemyType].mercyLore 
        : enemyData[enemyType].skillLore;
    loreContent.textContent = `${enemyType} Lore: ${lore}`;
}

// Modal Navigation
prevButton.addEventListener("click", () => {
    loreIndex = (loreIndex - 1 + enemyTypes.length) % enemyTypes.length;
    updateLoreContent("mercy"); // Default to mercy for carousel
});

nextButton.addEventListener("click", () => {
    loreIndex = (loreIndex + 1) % enemyTypes.length;
    updateLoreContent("mercy");
});

closeLoreModal.addEventListener("click", () => {
    loreModal.style.display = "none";
});

// Game Over
function gameOver() {
    alert("Game Over!");
    gameOverScreen.style.display = "block";
    stopEnemySound();
} 

document.getElementById("restartGame").addEventListener
("click",function() {
    window.location.href = "index.html";
});



const iceMagicSound = new Audio('mp3/ice-cracking.mp3');
iceMagicSound.preload = 'auto';

const fireMagicSound = new Audio('mp3/designed-fire-winds-swoosh-04-116788.mp3');
fireMagicSound.preload = 'auto';

const lightningMagicSound = new Audio('mp3/lightning-strike-fx-i-175724.mp3');
lightningMagicSound.preload = 'auto'; 


function flipCard(cardElement) {
    // Assuming cardElement is the card you clicked
    cardElement.classList.toggle('flipped'); // Toggle a class that rotates the card
  } 


function flipCard(card) {

    card.classList.toggle('flipped');

    console.log('Card flipped:', card);


    const cardType = card.getAttribute("data-type");

    if (cardType === 'ice_magic') {
        iceMagicSound.currentTime = 0; // Reset playback
        iceMagicSound.play();


    }

    if (cardType === 'fire_magic') {
        fireMagicSound.currentTime = 0;
        fireMagicSound.play();
    }

    if (cardType === 'lightning_magic') {
        lightningMagicSound.currentTime = 0;
        lightningMagicSound.play();
    }
}