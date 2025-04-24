
const resilience = [
    { name: "fire", resistance: false, vulnerability: false },
    { name: "cold", resistance: false, vulnerability: false },
    { name: "lightning", resistance: false, vulnerability: false },
    { name: "thunder", resistance: false, vulnerability: false },
    { name: "acid", resistance: false, vulnerability: false },
    { name: "poison", resistance: true, vulnerability: false },
    { name: "necrotic", resistance: false, vulnerability: false },
    { name: "radiant", resistance: false, vulnerability: false },
    { name: "psychic", resistance: false, vulnerability: false },
    { name: "force", resistance: false, vulnerability: false },
    { name: "slashing", resistance: false, vulnerability: false },
    { name: "piercing", resistance: false, vulnerability: false },
    { name: "bludgeoning", resistance: false, vulnerability: false }
];

const DamageTypes = {
    1: "fire",
    2: "cold",
    3: "lightning",
    4: "thunder",
    5: "acid",
    6: "poison",
    7: "necrotic",
    8: "radiant",
    9: "psychic",
    10: "force",
    11: "slashing",
    12: "piercing",
    13: "bludgeoning"
}

document.addEventListener('DOMContentLoaded', function() {

    function showToast(message, type = 'info', duration = 11000) {
        const container = document.getElementById('toastContainer');
        
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Create message text
        const messageText = document.createElement('span');
        messageText.textContent = message;
        
        // Create close button
        const closeButton = document.createElement('button');
        closeButton.className = 'toast-close';
        closeButton.innerHTML = '×';
        closeButton.onclick = () => removeToast(toast);
        
        // Assemble toast
        toast.appendChild(messageText);
        toast.appendChild(closeButton);
        container.appendChild(toast);
        
        // Auto-remove after duration
        setTimeout(() => removeToast(toast), duration);
    }

    function removeToast(toast) {
        toast.style.animation = 'fadeOut 0.3s ease-in-out forwards';
        toast.addEventListener('animationend', () => {
            toast.remove();
        });
    }

    function twilightSanctuary(){
        const charStats = JSON.parse(localStorage.getItem('dndCharacterStats'));
        const tempHPInput = document.getElementById('temp-hp');
        const level = parseInt(document.getElementById('level').value);
        let tempHP = parseInt(tempHPInput.value);

        if (isNaN(tempHP))
            tempHP = 0;

        const choice = parseInt(prompt("Choose 1 if self or 2 if other"));
        if (choice !== 1 && choice !== 2){
            showToast("Wrong Choice",'error');
            return;
        }

        if (choice == 1){
            const roll = Math.floor(Math.random() * 6) + 1;
            const result = roll + level;
            showToast(`Temporary HP gained: ${result}`,'success');
            if (result > tempHP){
                tempHP = result;
                tempHPInput.value = tempHP;
                charStats.tempHP = tempHP;
                localStorage.setItem("dndCharacterStats", JSON.stringify(charStats));
            }
        } else {
            const roll = Math.floor(Math.random() * 6) + 1;
            const result = roll + level;
            showToast(`Temporary HP gained: ${result}`,'success');
        }
    }

    function initiative() {
        const initMod = parseInt(document.getElementById('initiative').value);
        const d20Roll1 = Math.floor(Math.random() * 20) + 1;
        const d20Roll2 = Math.floor(Math.random() * 20) + 1;
        const rollResult = Math.max(d20Roll1, d20Roll2);
        const result = rollResult + initMod;
        const initString = initMod == 0 ? "" : ` + ${initMod}`;
        showToast(`Initiative: 1d20(Adv)${initString} = ${result}`,'success');
        const sound = new Audio('sounds/die.mp3');
        sound.play();
    }

    function shortRest() {

        const currentHPInput = document.getElementById('cur-hp');
        let currentHP = parseInt(currentHPInput.value);
        const MaxInput = document.getElementById('max-hp');
        const maxHP = parseInt(MaxInput.value);
        const charStats = JSON.parse(localStorage.getItem('dndCharacterStats'));
        let hitDice = charStats.hitDice;
        const conModifier = document.getElementById('constitution-modifier').value;
        const maxHitDice = parseInt(document.getElementById('level').value);

        if (hitDice==0){
            showToast(`You have no HitDice left`, 'error');
            return;
        }

        let hitDiceUsed = prompt("Enter how many HitDice you want to use");
        if (hitDiceUsed <= 0 || hitDiceUsed > maxHitDice || isNaN(hitDiceUsed)){
            showToast("Wrong Choice", 'error');
            return;
        }
                 
        if (hitDiceUsed > hitDice){
            showToast(`You have ${hitDice} HitDice left`, 'error');
            return;
        }
            
        let hpGained = 0;
        const rolls = [];
        for (let i = 0; i < hitDiceUsed;i++) {
            const roll = Math.floor(Math.random() * 8) + 1;
            hpGained += roll;
            rolls.push(roll);
        }
        const rollsString = rolls.join(' + ');
        const conSum = conModifier * hitDiceUsed;
        hpGained += conSum

        showToast(`HP Gained: ${hitDiceUsed}d8+${conSum} = ${rollsString} + ${conSum} = ${hpGained}`, 'success');
        if (hitDiceUsed == 1){
            const sound = new Audio('sounds/die.mp3');
            sound.play();
        } else{
            const sound = new Audio('sounds/dice.mp3');
            sound.play();
        }

        const hitDiceRemained = hitDice - hitDiceUsed;
        currentHP += hpGained;
        if (currentHP > maxHP)
            currentHP = maxHP

        currentHPInput.value = currentHP;
        charStats['curHP'] = currentHP;
        charStats.hitDice = hitDiceRemained;
        localStorage.setItem("dndCharacterStats", JSON.stringify(charStats));
    }

    function updateSpellStatus(spellsStatus) {
        const rowsList = [];

        spellsStatus.forEach(spell => {
            const spellRow = document.querySelectorAll(`.${spell.name}-row`);
            rowsList.push(spellRow);
        });

        const storedSpells = JSON.parse(localStorage.getItem("spells"));

        for (let i = 0 ; i < rowsList.length; i++) {
            const spellToUpdate = storedSpells[i];
            if (spellToUpdate.concentration===true){
                if (spellToUpdate.active) {
                    rowsList[i].forEach(row => {
                        row.style.backgroundColor = '#B266FF';
                    });
                } else {
                    rowsList[i].forEach(row => {
                        row.style.backgroundColor = '';
                    });
                }
            } else if (spellToUpdate.duration===true) {
                if (spellToUpdate.active) {
                    rowsList[i].forEach(row => {
                        row.style.backgroundColor = '#66FFB2';
                    });
                } else {
                    rowsList[i].forEach(row => {
                        row.style.backgroundColor = '';
                    });
                }
            }
        }
    }

    function ceaseAllSpells() {
        let storedSpells = JSON.parse(localStorage.getItem("spells"));
        storedSpells = storedSpells.map(spell => {
                return { ...spell, active: false };
        });
        localStorage.setItem("spells", JSON.stringify(storedSpells));
        updateSpellStatus(storedSpells);
    }

    function longRest() {
        const currentHPInput = document.getElementById('cur-hp');
        let currentHP = currentHPInput.value;
        const currentMaxInput = document.getElementById('max-hp');
        const tempHPInput = document.getElementById('temp-hp');
        const level1slot1 = document.getElementById('level1slot1');
        const level1slot2 = document.getElementById('level1slot2');
        const level1slot3 = document.getElementById('level1slot3');
        const level1slot4 = document.getElementById('level1slot4');
        const level2slot1 = document.getElementById('level2slot1');
        const level2slot2 = document.getElementById('level2slot2');
        const level2slot3 = document.getElementById('level2slot3');
        const level3slot1 = document.getElementById('level3slot1');
        const level3slot2 = document.getElementById('level3slot2');
        const level3slot3 = document.getElementById('level3slot3');
        const level4slot1 = document.getElementById('level4slot1');
        const level4slot2 = document.getElementById('level4slot2');
        const level4slot3 = document.getElementById('level4slot3');
        const level5slot1 = document.getElementById('level5slot1');
        const charStats = JSON.parse(localStorage.getItem('dndCharacterStats'));
        const spellSlots = JSON.parse(localStorage.getItem('spellSlots'));
        let hitDice = charStats.hitDice;
        const maxHitDice = parseInt(document.getElementById('level').value);

        hitDice += Math.ceil(maxHitDice / 2);
        if (hitDice>maxHitDice)
            hitDice = maxHitDice;

        currentHP = currentMaxInput.value;
        currentHPInput.value = currentHP;
        tempHPInput.value = 0;

        level1slot1.value = "";
        level1slot2.value = "";
        level1slot3.value = "";
        level1slot4.value = "";
        level2slot1.value = "";
        level2slot2.value = "";
        level2slot3.value = "";
        level3slot1.value = "";
        level3slot2.value = "";
        level3slot3.value = "";
        level4slot1.value = "";
        level4slot2.value = "";
        level4slot3.value = "";
        level5slot1.value = "";

        spellSlots.level1slot1 = "";
        spellSlots.level1slot2 = "";
        spellSlots.level1slot3 = "";
        spellSlots.level1slot4 = "";
        spellSlots.level2slot1 = "";
        spellSlots.level2slot2 = "";
        spellSlots.level2slot3 = "";
        spellSlots.level3slot1 = "";
        spellSlots.level3slot2 = "";
        spellSlots.level3slot3 = "";
        spellSlots.level4slot1 = "";
        spellSlots.level4slot2 = "";
        spellSlots.level4slot3 = "";
        spellSlots.level5slot1 = "";

        ceaseAllSpells()

        charStats['curHP'] = currentHP;
        charStats.hitDice = hitDice;
        localStorage.setItem("dndCharacterStats", JSON.stringify(charStats));
        localStorage.setItem("spellSlots", JSON.stringify(spellSlots));
    }

    function takeDamage() {
        const savedStats = JSON.parse(localStorage.getItem("dndCharacterStats"));
        const currentHPInput = document.getElementById('cur-hp');
        const tempHPInput = document.getElementById('temp-hp');
        let currentHP = parseInt(currentHPInput.value);
        let tempHPcheck = parseInt(tempHPInput.value);

        let tempHP = isNaN(tempHPcheck) ? 0 : tempHPcheck;

        let damage = 0;

        damage = parseInt(prompt("Enter HP lost:"));

        const damageType = parseInt(prompt(
            `Enter Damage Type:\n` +
            `1 - Fire\n` +
            `2 - Cold\n` +
            `3 - Lightning\n` +
            `4 - Thunder\n` +
            `5 - Acid\n` +
            `6 - Poison\n` +
            `7 - Necrotic\n` +
            `8 - Radiant\n` +
            `9 - Psychic\n` +
            `10 - Force\n` +
            `11 - Slashing\n` +
            `12 - Piercing\n` +
            `13 - Bludgeoning`
        ) || "0", 10);

        if (!(damageType in DamageTypes)){
            showToast("Wrong choice",'error');
            return;
        }

        const damageTypeResistance = resilience.find(type => type.name === DamageTypes[damageType]).resistance;
        const damageTypeVulnerability = resilience.find(type => type.name === DamageTypes[damageType]).vulnerability;

        if (damage === null || isNaN(damage)){
            showToast("You didn't give a number",'error');
            return;
        }

        if (damageTypeResistance)
            damage /= 2;

        if (damageTypeVulnerability)
            damage *= 2;

        if (tempHP == 0){
            currentHP -= damage;
            if (currentHP <= 0)
                currentHP = 0;
            currentHPInput.value = currentHP;
        } else{
            if (tempHP - damage >= 0){
                tempHP -= damage;
                tempHPInput.value = tempHP;
            } else {
                currentHP -= (damage - tempHP);
                if (currentHP <= 0)
                    currentHP = 0;
                tempHP = 0;
                tempHPInput.value = tempHP;
                currentHPInput.value = currentHP;
            }
        }
        savedStats['curHP'] = currentHP;
        savedStats.['tempHP'] = tempHP;
        localStorage.setItem("dndCharacterStats", JSON.stringify(savedStats)); 
    }

    function healHP() {
        const savedStats = JSON.parse(localStorage.getItem("dndCharacterStats"));
        const maxHP = parseInt(document.getElementById('max-hp').value);
        const currentHPInput = document.getElementById('cur-hp');
        let currentHP = parseInt(currentHPInput.value);
        let healedHP = 0;

        healedHP = parseInt(prompt("Enter gained HP number:"));

        if (healedHP === null || isNaN(healedHP)){
            showToast("You didn't give a number",'error');
            return;
        }
            
        currentHP += healedHP;

        if (currentHP > maxHP)
            currentHP = maxHP;

        currentHPInput.value = currentHP;
        savedStats['curHP'] = currentHP;
        localStorage.setItem("dndCharacterStats", JSON.stringify(savedStats)); 
    }

    function d20Throw(message, plus=0){
        let result = 0;
        const advantage = document.getElementById('adv');
        const disadvantage = document.getElementById('dis');
        const blessTracker = document.getElementById('bless-tracker');
        let roll = "";
        let blessRoll = 0;
        let advString = "";
        let blessString1 = "";
        let blessString2 = "";

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantage.value != "") {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (disadvantage.value != ""){
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.min(roll1, roll2);
            advString = "(Dis)";
        }

        if (blessTracker.value != ""){
            blessRoll = Math.floor(Math.random() * 4) + 1;
        }
            
        result = roll + plus;

        if (blessRoll != 0){
            blessString1 = "+1d4";
            blessString2 = ` + ${blessRoll}`;
        }

        let plusString1 = '';
        let plusString2 = '';

        if (plus!==0){
            plusString1 = `+${plus}`;
            plusString2 = ` + ${plus}`;
        }
        
        showToast(`${message}${advString}: 1d20${plusString1}${blessString1} = ${roll}${plusString2}${blessString2} = ${result}`, 'success');

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            const sound = new Audio('sounds/die.mp3');
            sound.play();
        } else{
            const sound = new Audio('sounds/2dice.mp3');
            sound.play();
        }

        return roll;
    }

    function radiantBow(){
        let result = 0;
        const rolls = [];
        const level = parseInt(document.getElementById('celestial-level').value);
        const spellAttackTracker = document.getElementById('spell-attack-tracker');
        const spellAttackCrit = document.getElementById('spell-attack-crit');
        let crit = 1;

        if (spellAttackTracker.value !== ""){
            if (spellAttackCrit.value !== ""){
                crit = 2;
            }
        } else {
            let critPrompt = parseInt(prompt("Enter 1 if Normal hit or 2 for Critical hit"));
            if (critPrompt != 1 && critPrompt != 2){
                showToast("Wrong choice",'error');
                return;
            }
            crit = critPrompt;
        }

        const critString = crit == 1 ? "" : "(Crit)";
        const totalDice = 2 * crit;

        for (let i = 0; i < totalDice; i++) {
            const roll = Math.floor(Math.random() * 6) + 1;
            result += roll;
            rolls.push(roll);
        }
        result += 2 + level;

        const rollsString = rolls.join(' + ');
        const sound = new Audio('sounds/dice.mp3');
        sound.play();
        spellAttackTracker.value = "";
        spellAttackCrit.value = "";

        showToast(`Radiant Bow${critString}: ${totalDice}d6+2+${level} = ${rollsString} + 2 + ${level} = ${result}  `, 'success');
    }

    function radiantMace(){
        let result = 0;
        let heal = 0;
        const rolls = [];
        const level = parseInt(document.getElementById('celestial-level').value);
        const spellAttackTracker = document.getElementById('spell-attack-tracker');
        const spellAttackCrit = document.getElementById('spell-attack-crit');
        const charStats = JSON.parse(localStorage.getItem('dndCharacterStats'));
        const tempHPInput = document.getElementById('temp-hp');
        let crit = 1;

        if (spellAttackTracker.value !== ""){
            if (spellAttackCrit.value !== ""){
                crit = 2;
            }
        } else {
            let critPrompt = parseInt(prompt("Enter 1 if Normal hit or 2 for Critical hit"));
            if (critPrompt != 1 && critPrompt != 2){
                showToast("Wrong choice",'error');
                return;
            }
            crit = critPrompt;
        }

        const critString = crit == 1 ? "" : "(Crit)";
        const totalDice = crit;

        for (let i = 0; i < totalDice; i++) {
            const roll = Math.floor(Math.random() * 10) + 1;
            result += roll;
            rolls.push(roll);
        }
        result += 3 + level;

        heal = Math.floor(Math.random() * 10) + 1;

        if (crit == 1){
            const sound = new Audio('sounds/die.mp3');
            sound.play();
        } else {
            const sound = new Audio('sounds/2dice.mp3');
            sound.play();
        }

        const rollsString = rolls.join(' + ');
        spellAttackTracker.value = "";
        spellAttackCrit.value = "";
        showToast(`Radiant Mace${critString}: ${totalDice}d10+3+${level} = ${rollsString} + 3 + ${level} = ${result}  `, 'success');
        const choice = parseInt(prompt("Enter 1 if you gain temp HP or 2 if other"));
        if (choice!=1 && choice!=2){
            showToast("Wrong choice",'error')
        }

        let tempHP = parseInt(tempHPInput.value);

        if (isNaN(tempHP))
            tempHP = 0;

        if (choice==1){
            showToast(`Temporary HP gained: ${heal}`,'success');
            if (heal > tempHP){
                tempHP = heal;
                tempHPInput.value = tempHP;
                charStats.tempHP = tempHP;
                localStorage.setItem("dndCharacterStats", JSON.stringify(charStats));
            }
        } else {
            showToast(`Temporary HP gained: ${heal}`,'success');
        }
    }

    function healingTouch(){
        const savedStats = JSON.parse(localStorage.getItem("dndCharacterStats"));
        const maxHP = parseInt(document.getElementById('max-hp').value);
        const currentHPInput = document.getElementById('cur-hp');
        let currentHP = parseInt(currentHPInput.value);
        const level = parseInt(document.getElementById('celestial-level').value);
        let healedHP = 0;
        const rolls = [];

        const choice = parseInt(prompt("Enter 1 if you or 2 if other"));

        if (choice != 1 && choice != 2){
            showToast("Wrong Choice",'error')
        }

        for (let i=0; i< 2; i++){
            let roll = Math.floor(Math.random() * 8) + 1;
            healedHP += roll;
            rolls.push(roll);
        }
        healedHP += level;

        const rollsString = rolls.join(' + ');
        showToast(`Healing Touch: 2d8+${level} = ${rollsString} + ${level} = ${healedHP}`,'success');

        if (choice ==1){
            currentHP += healedHP;
            if (currentHP > maxHP)
                currentHP = maxHP;
            currentHPInput.value = currentHP;
            savedStats['curHP'] = currentHP;
            localStorage.setItem("dndCharacterStats", JSON.stringify(savedStats)); 
        }
    }

    function weaponDamageThrow(divineStrike=false){

        const spells = JSON.parse(localStorage.getItem("spells"));
        const holyWeapon = spells.find(spell => spell.name === "holyweapon");
        const strModifierInput = document.getElementById('strength-modifier').value;
        const strModifier = parseInt(strModifierInput.replace('+', ''));
        const strModString1 = `+${strModifier}`;
        const strModString2 = ` + ${strModifier}`;
        const attackTracker = document.getElementById('attack-tracker');
        const attackCrit = document.getElementById('attack-crit');

        let crit = 1;

        if (attackTracker.value !== ""){
            if (attackCrit.value !== ""){
                crit = 2;
            }
        } else {
            let critPrompt = parseInt(prompt("Enter 1 if Normal hit or 2 for Critical hit"));
            if (critPrompt != 1 && critPrompt != 2){
                showToast("Wrong choice",'error');
                return;
            }
            crit = critPrompt;
        }
        
        const critString = crit == 1 ? "" : "(Crit)";

        if (divineStrike==false){
            if (holyWeapon.active === false){
                let result = 0;
                const weaponRolls = [];
                for (let i=0; i < 1*crit; i++){
                    let roll = Math.floor(Math.random() * 8) + 1;
                    result += roll;
                    weaponRolls.push(roll);
                }
                result += strModifier;
                const weaponRollsString = weaponRolls.join(' + ');
                showToast(`Weapon Damage${critString}: ${1*crit}d8${strModString1} = ${weaponRollsString}${strModString2} = ${result}`, 'success');
                if (crit == 1){
                    const sound = new Audio('sounds/die.mp3');
                    sound.play();
                } else {
                    const sound = new Audio('sounds/dice.mp3');
                    sound.play();
                } 
            } else {
                let result = 0;
                const rolls = [];
                const weaponRolls = [];

                for (let i=0; i < 1*crit; i++){
                    let roll = Math.floor(Math.random() * 8) + 1;
                    result += roll;
                    weaponRolls.push(roll);
                }
                const weaponRollsString = weaponRolls.join(' + ');
                for (let i=0; i < 2 * crit; i++){
                    let roll = Math.floor(Math.random() * 8) + 1;
                    result += roll;
                    rolls.push(roll);
                }
                const rollsString = rolls.join(' + ');

                result +=strModifier;
                showToast(`Weapon Damage${critString}: ${1*crit}d8${strModString1}+${2*crit}d8 = ${weaponRollsString}${strModString2} + ${rollsString} = ${result}`, 'success');
                const sound = new Audio('sounds/dice.mp3');
                sound.play();
            }
        } else {
            if (holyWeapon.active === false){
                let result = 0;
                const divineStrikeRolls = [];
                const weaponRolls = [];
                
                for (let i=0; i < 1 * crit; i++){
                    let roll = Math.floor(Math.random() * 8) + 1;
                    result += roll;
                    weaponRolls.push(roll);
                }
                const weaponRollsString = weaponRolls.join(' + ');

                for (let i=0; i < 1 * crit; i++){
                    let roll = Math.floor(Math.random() * 8) + 1;
                    result += roll;
                    divineStrikeRolls.push(roll);
                }
                const rollsString = divineStrikeRolls.join(' + ');
                
                result +=strModifier;
                showToast(`Divine Strike${critString}: ${1*crit}d8${strModString1}+${1*crit}d8 = ${weaponRollsString}${strModString2} + ${rollsString} = ${result}`, 'success');
                const sound = new Audio('sounds/dice.mp3');
                sound.play();
            } else {
                let result = 0;
                const divineStrikeRolls = [];
                const weaponRolls = [];
                
                for (let i=0; i < 1 * crit; i++){
                    let roll = Math.floor(Math.random() * 8) + 1;
                    result += roll;
                    weaponRolls.push(roll);
                }
                const weaponRollsString = weaponRolls.join(' + ');

                for (let i=0; i < 3 * crit; i++){
                    let roll = Math.floor(Math.random() * 8) + 1;
                    result += roll;
                    divineStrikeRolls.push(roll);
                }
                const rollsString = divineStrikeRolls.join(' + ');
                
                result +=strModifier;
                showToast(`Divine Strike${critString}: ${1*crit}d8${strModString1}+${3*crit}d8 = ${weaponRollsString}${strModString2} + ${rollsString} = ${result}`, 'success');
                const sound = new Audio('sounds/dice.mp3');
                sound.play();
            }
        }
        attackTracker.value = "";
        attackCrit.value = "";
    }

    function attack() {
        const attackMod = parseInt(document.getElementById('attacktotal').value);
        const attackTracker = document.getElementById('attack-tracker');
        const attackCrit = document.getElementById('attack-crit');

        attackTracker.value = "🔲";

        const roll = d20Throw("Attack",attackMod);
        if (roll == 20){
            attackCrit.value = "🔲";
            showToast("Ctitical Hit!",'success');
        }
        else
            attackCrit.value = "";
    }

    function spellAttack() {
        const spellAttackMod = parseInt(document.getElementById('spellattacktotal').value);
        const spellAttackTracker = document.getElementById('spell-attack-tracker');
        const spellAttackCrit = document.getElementById('spell-attack-crit');

        spellAttackTracker.value = "🔲";

        const roll = d20Throw("Spell Attack",spellAttackMod);
        if (roll == 20){
            spellAttackCrit.value = "🔲";
            showToast("Ctitical Hit!",'success');
        } else {
            spellAttackCrit.value = "";
        }

    }

    function abilityCheck(ability){
        const abilityLower = ability.toLowerCase();
        const abilityMod = parseInt(document.getElementById(`${abilityLower}-modifier`).value);
        const modifiedAbilityMod = Math.abs(abilityMod);
        const advantage = document.getElementById('adv');
        const disadvantage = document.getElementById('dis');
        const guidanceTracker = document.getElementById('guidance-tracker');
        let roll = "";
        let advString = "";
        let d4String1 = "";
        let d4String2 = "";
        let d4roll = 0;
        

        if (guidanceTracker.value != ""){
            d4roll = Math.floor(Math.random() * 4) + 1;
            d4String1 = "+1d4";
            d4String2 = ` + ${d4roll}`;
        }

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantage.value != "") {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (disadvantage.value != ""){
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.min(roll1, roll2);
            advString = "(Dis)";
        }

        const result = roll + abilityMod + d4roll;

        let abilityModStr1 = "";
        if (abilityMod > 0)
            abilityModStr1 = `+${abilityMod}`;
        else if (abilityMod < 0)
            abilityModStr1 = `-${modifiedAbilityMod}`;

        let abilityModStr2 = "";
        if (abilityMod > 0)
            abilityModStr2 = ` + ${abilityMod}`;
        else if (abilityMod < 0)
            abilityModStr2 = ` - ${modifiedAbilityMod}`;

        if (abilityMod==0)
            showToast(`${ability} Ability Check${advString}: 1d20${abilityModStr1}${d4String1} = ${result}`, 'success');
        else
            showToast(`${ability} Ability Check${advString}: 1d20${abilityModStr1}${d4String1} = ${roll}${abilityModStr2}${d4String2} = ${result}`, 'success');

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            const sound = new Audio('sounds/die.mp3');
            sound.play();
        } else{
            const sound = new Audio('sounds/2dice.mp3');
            sound.play();
        }
    }

    function saveCheck(ability){
        const abilityLower = ability.toLowerCase();
        const abilityMod = parseInt(document.getElementById(`${abilityLower}savetotal`).value);
        const modifiedAbilityMod = Math.abs(abilityMod);
        const blessTracker = document.getElementById('bless-tracker');
        const advantage = document.getElementById('adv');
        const disadvantage = document.getElementById('dis');
        let roll = "";
        let advString = ""
        let blessRoll = 0;
        let blessString1 = "";
        let blessString2 = "";

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantage.value != "") {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (disadvantage.value != ""){
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.min(roll1, roll2);
            advString = "(Dis)";
        }

        if (blessTracker.value != "")
            blessRoll = Math.floor(Math.random() * 4) + 1;

        if (blessRoll != 0){
            blessString1 = "+1d4";
            blessString2 = ` + ${blessRoll}`;
        }
            
        const result = roll + abilityMod + blessRoll;

        let abilityModStr1 = "";
        if (abilityMod > 0)
            abilityModStr1 = `+${abilityMod}`;
        else if (abilityMod < 0)
            abilityModStr1 = `-${modifiedAbilityMod}`;

        let abilityModStr2 = "";
        if (abilityMod > 0)
            abilityModStr2 = ` + ${abilityMod}`;
        else if (abilityMod < 0)
            abilityModStr2 = ` - ${modifiedAbilityMod}`;

        if (abilityMod==0)
            showToast(`${ability} Save Check${advString}: 1d20${abilityModStr1}${blessString1} = ${result}`, 'success');
        else
            showToast(`${ability} Save Check${advString}: 1d20${abilityModStr1}${blessString1} = ${roll}${abilityModStr2}${blessString2} = ${result}`, 'success');

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            const sound = new Audio('sounds/die.mp3');
            sound.play();
        } else{
            const sound = new Audio('sounds/2dice.mp3');
            sound.play();
        }
    }

    function celestialSaveCheck(ability){
        const abilityLower = ability.toLowerCase();
        const abilityMod = parseInt(document.getElementById(`celestial-${abilityLower}-modifier`).value);
        const advantage = document.getElementById('adv');
        const disadvantage = document.getElementById('dis');
        let roll = "";
        let advString = "";

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantage.value != "") {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (disadvantage.value != ""){
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.min(roll1, roll2);
            advString = "(Dis)";
        }
      
        const result = roll + abilityMod;

        const abilityModStr1 = `+${abilityMod}`;

        const abilityModStr2 = ` + ${abilityMod}`;

        showToast(`Celestial ${ability} Save Check${advString}: 1d20${abilityModStr1} = ${roll}${abilityModStr2} = ${result}`, 'success');

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            const sound = new Audio('sounds/die.mp3');
            sound.play();
        } else{
            const sound = new Audio('sounds/2dice.mp3');
            sound.play();
        }
    }

    function skillCheck(skillName){

        const skillNameLowerTrim = skillName.toLowerCase().trim().replace(/\s+/g, '');
        const skillTotal = parseInt(document.getElementById(`${skillNameLowerTrim}-total`).value);
        const modifiedSkillTotal = Math.abs(skillTotal);
        const advantage = document.getElementById('adv');
        const disadvantage = document.getElementById('dis');
        let roll = "";
        let advString = ""

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantage.value != "") {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (disadvantage.value != ""){
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.min(roll1, roll2);
            advString = "(Dis)";
        }
        
        const result = roll + skillTotal;

        let skillTotalStr1 = "";
        if (skillTotal > 0)
            skillTotalStr1 = `+${skillTotal}`;
        else if (skillTotal < 0)
            skillTotalStr1 = `-${modifiedSkillTotal}`;

        let skillTotalStr2 = "";
        if (skillTotal > 0)
            skillTotalStr2 = ` + ${skillTotal}`;
        else if (skillTotal < 0)
            skillTotalStr2 = ` - ${modifiedSkillTotal}`;

        if (skillTotal==0)
            showToast(`${skillName} Skill Check${advString}: 1d20${skillTotalStr1} = ${result}`, 'success');
        else
            showToast(`${skillName} Skill Check${advString}: 1d20${skillTotalStr1} = ${roll}${skillTotalStr2} = ${result}`, 'success');

        if ((advantage.value === "" && disadvantage.value === "") || (advantage.value != "" && disadvantage.value != "")){
            const sound = new Audio('sounds/die.mp3');
            sound.play();
        } else{
            const sound = new Audio('sounds/2dice.mp3');
            sound.play();
        }
    }

    function toggleAdvantage(){
        const advInput = document.getElementById('adv');
        if (advInput.value == "")
            advInput.value = "🔲";
        else
            advInput.value = "";
    }

    function toggleDisadvantage(){
        const advInput = document.getElementById('dis');
        if (advInput.value == "")
            advInput.value = "🔲";
        else
            advInput.value = "";
    }

    function addActionEvents(){
        const attackButton = document.getElementById('attack-button');
        attackButton.addEventListener('click',() => attack());
        const spellAttackButton = document.getElementById('spell-attack-button');
        spellAttackButton.addEventListener('click',() => spellAttack());
        const weaponDamageButton = document.getElementById('weapon-damage-button');
        weaponDamageButton.addEventListener('click',() => weaponDamageThrow());
        const divineStrikeButton = document.getElementById('divine-strike-button');
        divineStrikeButton.addEventListener('click',() => weaponDamageThrow(true));
        const healButton = document.getElementById('heal-button');
        healButton.addEventListener('click',() => healHP());
        const damageButton = document.getElementById('damage-button');
        damageButton.addEventListener('click',() => takeDamage());
        const longRestButton = document.getElementById('long-rest-button');
        longRestButton.addEventListener('click',() => longRest());
        const shortRestButton = document.getElementById('short-rest-button');
        shortRestButton.addEventListener('click',() => shortRest());
        const initiativeButton = document.getElementById('initiative-button');
        initiativeButton.addEventListener('click',() => initiative());
        const twilightSanctuaryButton = document.getElementById('twilight-sanctuary-button');
        twilightSanctuaryButton.addEventListener('click',() => twilightSanctuary());
        const strengthAbility = document.getElementById('strength-modifier');
        strengthAbility.addEventListener('click',() => abilityCheck("Strength"));
        const dexterityAbility = document.getElementById('dexterity-modifier');
        dexterityAbility.addEventListener('click',() => abilityCheck("Dexterity"));
        const constitutionAbility = document.getElementById('constitution-modifier');
        constitutionAbility.addEventListener('click',() => abilityCheck("Constitution"));
        const intelligenceAbility = document.getElementById('intelligence-modifier');
        intelligenceAbility.addEventListener('click',() => abilityCheck("Intelligence"));
        const wisdomAbility = document.getElementById('wisdom-modifier');
        wisdomAbility.addEventListener('click',() => abilityCheck("Wisdom"));
        const charismaAbility = document.getElementById('charisma-modifier');
        charismaAbility.addEventListener('click',() => abilityCheck("Charisma"));
        const strengthSave = document.getElementById('strengthsavecheck');
        strengthSave.addEventListener('click',() => saveCheck("Strength"));
        const dexteritySave = document.getElementById('dexteritysavecheck');
        dexteritySave.addEventListener('click',() => saveCheck("Dexterity"));
        const constitutionSave = document.getElementById('constitutionsavecheck');
        constitutionSave.addEventListener('click',() => saveCheck("Constitution"));
        const intelligenceSave = document.getElementById('intelligencesavecheck');
        intelligenceSave.addEventListener('click',() => saveCheck("Intelligence"));
        const wisdomSave = document.getElementById('wisdomsavecheck');
        wisdomSave.addEventListener('click',() => saveCheck("Wisdom"));
        const charismaSave = document.getElementById('charismasavecheck');
        charismaSave.addEventListener('click',() => saveCheck("Charisma"));
        const celestialStrengthSave = document.getElementById('celestial-strength-modifier');
        celestialStrengthSave.addEventListener('click',() => celestialSaveCheck("Strength"));
        const celestialDexteritySave = document.getElementById('celestial-dexterity-modifier');
        celestialDexteritySave.addEventListener('click',() => celestialSaveCheck("Dexterity"));
        const celestialConstitutionSave = document.getElementById('celestial-constitution-modifier');
        celestialConstitutionSave.addEventListener('click',() => celestialSaveCheck("Constitution"));
        const celestialIntelligenceSave = document.getElementById('celestial-intelligence-modifier');
        celestialIntelligenceSave.addEventListener('click',() => celestialSaveCheck("Intelligence"));
        const celestialWisdomSave = document.getElementById('celestial-wisdom-modifier');
        celestialWisdomSave.addEventListener('click',() => celestialSaveCheck("Wisdom"));
        const celestialCharismaSave = document.getElementById('celestial-charisma-modifier');
        celestialCharismaSave.addEventListener('click',() => celestialSaveCheck("Charisma"));
        const radiantBowButton = document.getElementById('radiant-bow');
        radiantBowButton.addEventListener('click',() => radiantBow());
        const radiantMaceButton = document.getElementById('radiant-mace');
        radiantMaceButton.addEventListener('click',() => radiantMace());
        const healingTouchButton = document.getElementById('healing-touch');
        healingTouchButton.addEventListener('click',() => healingTouch());
    }

    function addSkillEvents(){
        skillsWithKeyAbilities.forEach(skill => {
            const skillNameLowerTrim = skill.name.toLowerCase().trim().replace(/\s+/g, '');
            const skillTotal = document.getElementById(`${skillNameLowerTrim}-total`);
            skillTotal.addEventListener('click', () => skillCheck(skill.name));
        })
    }

    const advButton = document.getElementById('adv-button');
    advButton.addEventListener('click', () => toggleAdvantage());
    const disButton = document.getElementById('dis-button');
    disButton.addEventListener('click', () => toggleDisadvantage());

    addActionEvents();
    addSkillEvents();
});
