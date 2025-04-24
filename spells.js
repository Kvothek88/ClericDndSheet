document.addEventListener('DOMContentLoaded', function () {

    function diceThrow(diceNumber, diceType, name, modifier=false, blessedStrikes=false, spellAttack=false) {
        let result = 0;
        const rolls = [];
        const wisModifierInput = document.getElementById('wisdom-modifier').value;
        const wisModifier = parseInt(wisModifierInput.replace('+', ''));
        let blessedStrikesRoll = 0;
        const spellAttackTracker = document.getElementById('spell-attack-tracker');
        const spellAttackCrit = document.getElementById('spell-attack-crit');
        let crit = 1;

        if (spellAttack){
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
        }

        const critString = crit == 1 ? "" : "(Crit)";

        const totalDice = diceNumber * crit;

        for (let i = 0; i < totalDice; i++) {
            const roll = Math.floor(Math.random() * diceType) + 1;
            result += roll;
            rolls.push(roll);
        }

        if (modifier === true)
            result += wisModifier;

        if (blessedStrikes === true){
            blessedStrikesRoll = Math.floor(Math.random() * 8) + 1;
            result += blessedStrikesRoll;
        }

        const rollsString = rolls.join(' + ');
        const modifierString1 = modifier ? `+${wisModifier}` : '';
        const modifierString2 = modifier ? ` + ${wisModifier}` : '';
        const blessedStrikesString = blessedStrikes ? '+1d8'  : '';
        const blessedStrikesRollString = blessedStrikes ? ` + ${blessedStrikesRoll}` : '';

        if (diceNumber == 1){
            if (crit==1){
                const sound = new Audio('sounds/die.mp3');
                sound.play();
            } else {
                const sound = new Audio('sounds/dice.mp3');
                sound.play();
            }
        } else {
            const sound = new Audio('sounds/dice.mp3');
            sound.play();
        }

        showToast(`${name}${critString}: ${totalDice}d${diceType}${modifierString1}${blessedStrikesString} = ${rollsString}${blessedStrikesRollString}${modifierString2} = ${result}  `, 'success');

        if (spellAttack){
            spellAttackTracker.value = "";
            spellAttackCrit.value = "";
        }

        return result;
    }

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

    function heal(diceNumber, diceType, name) {
        const savedStats = JSON.parse(localStorage.getItem("dndCharacterStats"))
        const maxHP = parseInt(document.getElementById('max-hp').value);
        const currentHPInput = document.getElementById('cur-hp');
        let currentHP = parseInt(currentHPInput.value);
        let healedHP = 0;

        healedHP = diceThrow(diceNumber, diceType, name, true);

        currentHP += healedHP;

        if (currentHP > maxHP)
            currentHP = maxHP;

        currentHPInput.value = currentHP;
        savedStats['curHp'] = currentHP;
        localStorage.setItem("dndCharacterStats", JSON.stringify(savedStats)); 
    }

    function tollTheDead() {
        let choice = prompt("Choose: 1 if damaged, 2 if unscathed");
        if (choice == 1) {
            diceThrow(2, 12, 'Toll the Dead', false, true);
        } else if (choice == 2) {
            diceThrow(2, 8, 'Toll the Dead', false, true);
        } else {
            showToast('Wrong Choice', 'error');
        }
    }

    function cureWounds(level) {
        let choice = prompt("Choose: 1 if healing self, 2 if healing other");
        if (choice == 1) {
            if (level == 1)
                heal(2 * level, 8, 'Cure Wounds');
            else
                heal(2 * level, 8, `Cure Wounds(Level ${level})`);
        } else if (choice == 2) {
            if (level == 1)
                diceThrow(2 * level, 8, 'Cure Wounds',true);
            else
                diceThrow(2 * level, 8, `Cure Wounds(Level ${level})`,true);
        } else {
            showToast('Wrong Choice', 'error');
        }
    }

    function massCureWounds(level) {
        let choice = prompt("Choose: 1 if you include yourself, 2 if not");
        if (choice == 1) {
            if (level == 5)
                heal(level, 8, 'Mass Cure Wounds');
            else
                heal(level, 8, `Mass Cure Wounds(Level ${level})`);
        } else if (choice == 2) {
            if (level == 5)
                diceThrow(level, 8, 'Mass Cure Wounds',true);
            else
                diceThrow(level, 8, `Mass Cure Wounds(Level ${level})`,true);
        } else {
            showToast('Wrong Choice', 'error');
        }
    }

    function auraOfVitality() {
        let choice = prompt("Choose: 1 if healing self, 2 if healing other");
        if (choice == 1) {
            heal(2, 6, 'Aura of Vitality');
        } else if (choice == 2) {
            diceThrow(2, 6, 'Aura of Vitality');
        } else {
            showToast('Wrong Choice', 'error');
        }
    }

    function flameStrike(level) {
        let result = 0;
        let fireResult = 0;
        let radiantResult = 0;
        const radiantRolls = [];
        const fireRolls = [];

        for (let i = 0; i < level; i++) {
            const fireRoll = Math.floor(Math.random() * 6) + 1;
            const radiantRoll = Math.floor(Math.random() * 6) + 1;
            fireResult += fireRoll;
            radiantResult += radiantRoll;
            result += fireRoll + radiantRoll;
            radiantRolls.push(radiantRoll);
            fireRolls.push(fireRoll);
        }

        const sound = new Audio('sounds/dice.mp3');
        sound.play();

        const fireRollsString = fireRolls.join(' + ');
        const radiantRollsString = radiantRolls.join(' + ');
        showToast(`Flame Strike (Level ${level}): ${level*2}d6 = ${level}d6 Fire + ${level}d6 Radiant = ${fireRollsString} + ${radiantRollsString} = ${fireResult} Fire + ${radiantResult} Radiant = ${result}  `, 'success');
    }

    function buffEffects(spell){
        const guidanceTracker = document.getElementById('guidance-tracker');
        const blessTracker = document.getElementById('bless-tracker');

        if (spell === "guidance"){
            if (guidanceTracker.value == ""){
                guidanceTracker.value = "🔲";
                showToast("Guidance: Active", 'success');
            } else {
                guidanceTracker.value = "";
                showToast("Guidance: Inactive", 'success');
            }
        }

        if (spell === "bless"){
            if (blessTracker.value == ""){
                blessTracker.value = "🔲";
                showToast("Bless: Active", 'success');
            } else {
                blessTracker.value = "";
                showToast("Bless: Inactive", 'success');
            }
        }
    }

    function addEffectsEvents() {
        const sacredFlameEffect = document.querySelector('.sacred-flame-effect');
        sacredFlameEffect.addEventListener('click', () => diceThrow(2, 8, 'Sacred Flame', false, true));

        const tollTheDeadEffect = document.querySelector('.toll-the-dead-effect');
        tollTheDeadEffect.addEventListener('click', () => tollTheDead());

        const guidanceEffect = document.querySelector('.guidance-effect');
        guidanceEffect.addEventListener('click', () => buffEffects("guidance"));

        const blessEffect = document.querySelector('.bless-effect');
        blessEffect.addEventListener('click', () => buffEffects("bless"));

        const guidingBoltEfect = document.querySelector('.guiding-bolt-effect');
        guidingBoltEfect.addEventListener('click', () => diceThrow(4, 6, 'Guiding Bolt', false, false, true));

        const guidingBoltLevel2Effect = document.querySelector('.guiding-bolt-level2-effect');
        guidingBoltLevel2Effect.addEventListener('click', () => diceThrow(5, 6, 'Guiding Bolt (Level2)', false, false, true));

        const guidingBoltLevel3Effect = document.querySelector('.guiding-bolt-level3-effect');
        guidingBoltLevel3Effect.addEventListener('click', () => diceThrow(6, 6, 'Guiding Bolt (Level3)', false, false, true));

        const guidingBoltLevel4Effect = document.querySelector('.guiding-bolt-level4-effect');
        guidingBoltLevel4Effect.addEventListener('click', () => diceThrow(7, 6, 'Guiding Bolt (Level4)', false, false, true));

        const guidingBoltLevel5Effect = document.querySelector('.guiding-bolt-level5-effect');
        guidingBoltLevel5Effect.addEventListener('click', () => diceThrow(8, 6, 'Guiding Bolt (Level5)', false, false, true));

        const cureWoundsEffect = document.querySelector('.cure-wounds-effect');
        cureWoundsEffect.addEventListener('click', () => cureWounds(1));

        const cureWoundsLevel2Effect = document.querySelector('.cure-wounds-level2-effect');
        cureWoundsLevel2Effect.addEventListener('click', () => cureWounds(2));

        const cureWoundsLevel3Effect = document.querySelector('.cure-wounds-level3-effect');
        cureWoundsLevel3Effect.addEventListener('click', () => cureWounds(3));

        const cureWoundsLevel4Effect = document.querySelector('.cure-wounds-level4-effect');
        cureWoundsLevel4Effect.addEventListener('click', () => cureWounds(4));

        const cureWoundsLevel5Effect = document.querySelector('.cure-wounds-level5-effect');
        cureWoundsLevel5Effect.addEventListener('click', () => cureWounds(5));

        const moonbeamEffect = document.querySelector('.moonbeam-effect');
        moonbeamEffect.addEventListener('click', () => diceThrow(2, 10, 'Moonbeam'));

        const moonbeamLevel3Effect = document.querySelector('.moonbeam-level3-effect');
        moonbeamLevel3Effect.addEventListener('click', () => diceThrow(3, 10, 'Moonbeam(Level 3)'));

        const moonbeamLevel4Effect = document.querySelector('.moonbeam-level4-effect');
        moonbeamLevel4Effect.addEventListener('click', () => diceThrow(4, 10, 'Moonbeam(Level 4)'));

        const moonbeamLevel5Effect = document.querySelector('.moonbeam-level5-effect');
        moonbeamLevel5Effect.addEventListener('click', () => diceThrow(5, 10, 'Moonbeam(Level 5)'));

        const spirituaWeaponEffect = document.querySelector('.spiritual-weapon-effect');
        spirituaWeaponEffect.addEventListener('click', () => diceThrow(1, 8, 'Spiritual Weapon', true, false, true));

        const spirituaWeaponLevel3Effect = document.querySelector('.spiritual-weapon-level3-effect');
        spirituaWeaponLevel3Effect.addEventListener('click', () => diceThrow(2, 8, 'Spiritual Weapon(Level3)',true, false, true));

        const spirituaWeaponLevel4Effect = document.querySelector('.spiritual-weapon-level4-effect');
        spirituaWeaponLevel4Effect.addEventListener('click', () => diceThrow(3, 8, 'Spiritual Weapon(Level 4)',true, false, true));

        const spirituaWeaponLevel5Effect = document.querySelector('.spiritual-weapon-level5-effect');
        spirituaWeaponLevel5Effect.addEventListener('click', () => diceThrow(4, 8, 'Spiritual Weapon(Level 5)',true, false, true));

        const auraOfVitalityEffect = document.querySelector('.aura-of-vitality-effect');
        auraOfVitalityEffect.addEventListener('click', () => auraOfVitality());

        const spiritGuardiansEffect = document.querySelector('.spirit-guardians-effect');
        spiritGuardiansEffect.addEventListener('click', () => diceThrow(3, 8, 'Spirit Guardians'));

        const spiritGuardiansLevel4Effect = document.querySelector('.spirit-guardians-level4-effect');
        spiritGuardiansLevel4Effect.addEventListener('click', () => diceThrow(4, 8, 'Spirit Guardians(Level 4)'));

        const spiritGuardiansLevel5Effect = document.querySelector('.spirit-guardians-level5-effect');
        spiritGuardiansLevel5Effect.addEventListener('click', () => diceThrow(5, 8, 'Spirit Guardians(Level 5)'));

        const flamestrike = document.querySelector('.flamestrike');
        flamestrike.addEventListener('click', () => flameStrike(5));

        const massCureWoundsEffect = document.querySelector('.mass-cure-wounds-effect');
        massCureWoundsEffect.addEventListener('click', () => massCureWounds(5));
    }

    addEffectsEvents();

    const spellsStatus = [
        {name: 'guidance', active: false, concentration: true, duration: true, level: 0},
        {name: 'thaumaturgy', active: false, concentration: false, duration: true, level: 0},
        {name: 'guidingbolt', active: false, concentration: false, duration: true, level: 1},
        {name: 'bless', active: false, concentration: true, duration: true, level: 1},
        {name: 'shieldoffaith', active: false, concentration: true, duration: true, level: 1},
        {name: 'curewounds', active: false, concentration: false, duration: false, level: 1},
        {name: 'fairiefire', active: false, concentration: true, duration: true, level: 1},
        {name: 'sleep', active: false, concentration: false, duration: true, level: 1},
        {name: 'moonbeam', active: false, concentration: true, duration: true, level: 2},
        {name: 'seeinvisibility', active: false, concentration: false, duration: true, level: 2},
        {name: 'curewoundslevel2', active: false, concentration: false, duration: false, level: 2},
        {name: 'spiritualweapon', active: false, concentration: true, duration: true, level: 2},
        {name: 'guidingboltlevel2', active: false, concentration: false, duration: true, level: 2},
        {name: 'auraofvitality', active: false, concentration: true, duration: true, level: 3},
        {name: 'bestowcurse', active: false, concentration: true, duration: true, level: 3},
        {name: 'dispelmagic', active: false, concentration: false, duration: false, level: 3},
        {name: 'leomunds', active: false, concentration: false, duration: true, level: 3},
        {name: 'spiritguardians', active: false, concentration: true, duration: true, level: 3},
        {name: 'curewoundslevel3', active: false, concentration: false, duration: false, level: 3},
        {name: 'guidingboltlevel3', active: false, concentration: false, duration: true, level: 3},
        {name: 'moonbeamlevel3', active: false, concentration: true, duration: true, level: 3},
        {name: 'spiritualweaponlevel3', active: false, concentration: true, duration: true, level: 3},
        {name: 'auraoflife', active: false, concentration: true, duration: true, level: 4},
        {name: 'auraofpurity', active: false, concentration: true, duration: true, level: 4},
        {name: 'deathward', active: false, concentration: false, duration: true, level: 4},
        {name: 'greaterinvisibility', active: false, concentration: true, duration: true, level: 4},
        {name: 'guardianoffaith', active: false, concentration: false, duration: true, level: 4},
        {name: 'dispelmagiclevel4', active: false, concentration: false, duration: false, level: 4},
        {name: 'spiritguardianslevel4', active: false, concentration: true, duration: true, level: 4},
        {name: 'curewoundslevel4', active: false, concentration: false, duration: false, level: 4},
        {name: 'guidingboltlevel4', active: false, concentration: false, duration: true, level: 4},
        {name: 'moonbeamlevel4', active: false, concentration: true, duration: true, level: 4},
        {name: 'spiritualweaponlevel4', active: false, concentration: true, duration: true, level: 4},
        {name: 'circleofpower', active: false, concentration: true, duration: true, level: 5},
        {name: 'flamestrike', active: false, concentration: false, duration: false, level: 5},
        {name: 'holyweapon', active: false, concentration: true, duration: true, level: 5},
        {name: 'masscurewounds', active: false, concentration: false, duration: false, level: 5},
        {name: 'spiritguardianslevel5', active: false, concentration: true, duration: true, level: 5},
        {name: 'curewoundslevel5', active: false, concentration: false, duration: false, level: 5},
        {name: 'guidingboltlevel5', active: false, concentration: false, duration: true, level: 5},
        {name: 'moonbeamlevel5', active: false, concentration: true, duration: true, level: 5},
        {name: 'spiritualweaponlevel5', active: false, concentration: true, duration: true, level: 5},
        {name: 'dispelmagiclevel5', active: false, concentration: false, duration: false, level: 5},
        {name: 'mislead', active: false, concentration: true, duration: true, level: 5},
        {name: 'summoncelestial', active: false, concentration: true, duration: true, level: 5},
    ];
    localStorage.getItem("spells") ?? localStorage.setItem("spells", JSON.stringify(spellsStatus));

    const spellSlots = {
        level1slot1:"",
        level1slot2:"",
        level1slot3:"",
        level1slot4:"",
        level2slot1:"",
        level2slot2:"",
        level2slot3:"",
        level3slot1:"",
        level3slot2:"",
        level3slot3:"",
        level4slot1:"",
        level4slot2:"",
        level4slot3:"",
        level5slot1:""
    }
    localStorage.getItem("spellSlots") ?? localStorage.setItem("spellSlots", JSON.stringify(spellSlots));

    function updateSpellSlotsStatus(){
        const storedSlots = JSON.parse(localStorage.getItem("spellSlots"));
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

        level1slot1.value = storedSlots.level1slot1;
        level1slot2.value = storedSlots.level1slot2;
        level1slot3.value = storedSlots.level1slot3;
        level1slot4.value = storedSlots.level1slot4;
        level2slot1.value = storedSlots.level2slot1;
        level2slot2.value = storedSlots.level2slot2;
        level2slot3.value = storedSlots.level2slot3;
        level3slot1.value = storedSlots.level3slot1;
        level3slot2.value = storedSlots.level3slot2;
        level3slot3.value = storedSlots.level3slot3;
        level4slot1.value = storedSlots.level4slot1;
        level4slot2.value = storedSlots.level4slot2;
        level4slot3.value = storedSlots.level4slot3;
        level5slot1.value = storedSlots.level5slot1;
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
        updateSpellSlotsStatus();
    }

    function applyNonDamageEffects(name){
        let savedStats = localStorage.getItem('dndCharacterStats');
        if (name=='shieldoffaith'){
            let stats = savedStats ? JSON.parse(savedStats) : {};

            stats.acother = "2";
            localStorage.setItem('dndCharacterStats', JSON.stringify(stats));
        }
        if (['guidingbolt', 'guidingboltlevel2', 'guidingboltlevel3', 'guidingboltlevel4', 'guidingboltlevel5'].includes(name)){
            const advantage = document.getElementById('adv');
            advantage.value = "🔲";
        }
        if (name=='summoncelestial'){
            const celestial = document.getElementById('celestial');
            let stats = savedStats ? JSON.parse(savedStats) : {};
            celestial.style.display = 'block';
            const choice = parseInt(prompt("Enter 1 if Avenger or 2 if Defender"));
            if (choice != 1 && choice != 2){
                showToast("Wrong choice", 'error');
                return;
            }
            if (choice == 2){
                const defenderTracker = document.getElementById('defender-tracker');
                stats.defenderTracker = "🔲";
                defenderTracker.value = "🔲";
                localStorage.setItem('dndCharacterStats', JSON.stringify(stats));
            }
        }
    }

    function removeNonDamageEffects(name){
        let savedStats = localStorage.getItem('dndCharacterStats');
        if (name=='shieldoffaith'){
            let stats = savedStats ? JSON.parse(savedStats) : {};

            stats.acother = 0;
            localStorage.setItem('dndCharacterStats', JSON.stringify(stats));
        }
        if (['guidingbolt', 'guidingboltlevel2', 'guidingboltlevel3', 'guidingboltlevel4', 'guidingboltlevel5'].includes(name)){
            const advantage = document.getElementById('adv');
            advantage.value = "";
        }
        if (name=='summoncelestial'){
            let stats = savedStats ? JSON.parse(savedStats) : {};
            const celestial = document.getElementById('celestial');
            const defenderTracker = document.getElementById('defender-tracker');
            celestial.style.display = 'none';
            stats.defenderTracker = "";
            defenderTracker.value = "";
            localStorage.setItem('dndCharacterStats', JSON.stringify(stats));
        }
    }

    function emptySlot(level) {
        let storedSlots = JSON.parse(localStorage.getItem("spellSlots"));
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

        if (level == 1){
            if (level1slot4.value !== ""){
                level1slot4.value = "";
                storedSlots.level1slot4 = "";
            } 
            else if (level1slot3.value !== ""){
                level1slot3.value = "";
                storedSlots.level1slot3 = "";
            }
            else if (level1slot2.value !== ""){
                level1slot2.value = "";
                storedSlots.level1slot2 = "";
            }
            else if (level1slot1.value !== ""){
                level1slot1.value = "";
                storedSlots.level1slot1 = "";
            }
            else {
                showToast('All Level 1 spell slots are already empty', 'error');
                return;
            }
        } else if (level == 2){
            if (level2slot3.value !== ""){
                level2slot3.value = "";
                storedSlots.level2slot3 = "";
            } 
            else if (level2slot2.value !== ""){
                level2slot2.value = "";
                storedSlots.level2slot2 = "";
            } 
            else if (level2slot1.value !== ""){
                level2slot1.value = "";
                storedSlots.level2slot1 = "";
            } 
            else {
                showToast('All Level 2 spell slots are already empty', 'error');
                return;
            }
        } else if (level == 3){
            if (level3slot3.value !== ""){
                level3slot3.value = "";
                storedSlots.level3slot3 = "";
            }
            else if (level3slot2.value !== ""){
                level3slot2.value = "";
                storedSlots.level3slot2 = "";
            }
            else if (level3slot1.value !== ""){
                level3slot1.value = "";
                storedSlots.level3slot1 = "";
            } 
            else {
                showToast('All Level 3 spell slots are already empty', 'error');
                return;
            }
        } else if (level == 4){
            if (level4slot3.value !== ""){
                level4slot3.value = "";
                storedSlots.level4slot3 = "";
            }  
            else if (level4slot2.value !== ""){
                level4slot2.value = "";
                storedSlots.level4slot2 = "";
            }
            else if (level4slot1.value !== ""){
                level4slot1.value = "";
                storedSlots.level4slot1 = "";
            }   
            else {
                showToast('All Level 4 spell slots are already empty', 'error');
                return;
            }
        } else if (level == 5){
            if (level5slot1.value !== ""){
                level5slot1.value = "";
                storedSlots.level5slot1 = "";
            }
            else {
                showToast('All Level 5 spell slots are already empty', 'error');
                return;
            }
        }

        localStorage.setItem("spellSlots", JSON.stringify(storedSlots)); 
    }

    function spellCast(name,level) {
        let storedSpells = JSON.parse(localStorage.getItem("spells"));
        let storedSlots = JSON.parse(localStorage.getItem("spellSlots"));
        const spellToUpdate = storedSpells.find(spell => spell.name === name);

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


        if (level == 1){
            if (level1slot1.value === ""){
                level1slot1.value = "🔲";
                storedSlots.level1slot1 = "🔲";
            }
            else if (level1slot2.value === ""){
                level1slot2.value = "🔲";
                storedSlots.level1slot2 = "🔲";
            } 
            else if (level1slot3.value === ""){
                level1slot3.value = "🔲";
                storedSlots.level1slot3 = "🔲";
            }  
            else if (level1slot4.value === ""){
                level1slot4.value = "🔲";
                storedSlots.level1slot4 = "🔲";
            }
            else {
                showToast('All Level 1 spell slots are depleted', 'error');
                return;
            }
        }
        else if (level == 2){
            if (level2slot1.value === ""){
                level2slot1.value = "🔲";
                storedSlots.level2slot1 = "🔲";
            }
            else if (level2slot2.value === ""){
                level2slot2.value = "🔲";
                storedSlots.level2slot2 = "🔲";
            } 
            else if (level2slot3.value === ""){
                level2slot3.value = "🔲";
                storedSlots.level2slot3 = "🔲";
            } 
            else {
                showToast('All Level 2 spell slots are depleted', 'error');
                return;
            }
        }
        else if (level == 3){
            if (level3slot1.value === ""){
                level3slot1.value = "🔲";
                storedSlots.level3slot1 = "🔲";
            }  
            else if (level3slot2.value === ""){
                level3slot2.value = "🔲";
                storedSlots.level3slot2 = "🔲";
            }  
            else if (level3slot3.value === ""){
                level3slot3.value = "🔲";
                storedSlots.level3slot3 = "🔲";
            }
            else {
                showToast('All Level 3 spell slots are depleted', 'error');
                return;
            }
        }
        else if (level == 4){
            if (level4slot1.value === ""){
                level4slot1.value = "🔲";
                storedSlots.level4slot1 = "🔲";
            }
            else if (level4slot2.value === ""){
                level4slot2.value = "🔲";
                storedSlots.level4slot2 = "🔲";
            } 
            else if (level4slot3.value === ""){
                level4slot3.value = "🔲";
                storedSlots.level4slot3 = "🔲";
            }
            else {
                showToast('All Level 4 spell slots are depleted', 'error');
                return;
            }
        }
        else if (level == 5){
            if (level5slot1.value === ""){
                level5slot1.value = "🔲";
                storedSlots.level5slot1 = "🔲";
            }
            else {
                showToast('All Level 5 spell slots are depleted', 'error');
                return;
            }
        }

        if (name==="guidance"){
            const guidanceTracker = document.getElementById('guidance-tracker');
            const choice = parseInt(prompt("Enter 1 if self or 2 if other"));
            if (choice==1)
                guidanceTracker.value = "🔲";
        }

        if (name==="bless"){
            const blessTracker = document.getElementById('bless-tracker');
            const choice = parseInt(prompt("Enter 1 if self or 2 if other"));
            if (choice==1)
                blessTracker.value = "🔲";
        }

        applyNonDamageEffects(name);
        
        if (spellToUpdate.concentration === true) {
            // First deactivate all concentration spells
            storedSpells = storedSpells.map(spell => {
                if (spell.concentration && spell.active) {
                    return { ...spell, active: false };
                }
                return spell;
            });
        }
        
        // Then activate the new spell
        storedSpells = storedSpells.map(spell => {
            if (spell.name === name) {
                return { ...spell, active: true };
            }
            return spell;
        });

        localStorage.setItem("spellSlots", JSON.stringify(storedSlots));
        localStorage.setItem("spells", JSON.stringify(storedSpells));
        updateSpellStatus(storedSpells);
    }
    
    function spellCease(name,level) {
        let storedSpells = JSON.parse(localStorage.getItem("spells"));
        storedSpells = storedSpells.map(spell => {
            if (spell.name === name) {
                return { ...spell, active: false };
            }
            return spell;
        });

        const guidanceTracker = document.getElementById('guidance-tracker');
        guidanceTracker.value = "";

        const blessTracker = document.getElementById('bless-tracker');
        blessTracker.value = "";

        removeNonDamageEffects(name);
        localStorage.setItem("spells", JSON.stringify(storedSpells));
        updateSpellStatus(storedSpells);
    }
    
    function ceaseAllConcentrationSpells() {
        let storedSpells = JSON.parse(localStorage.getItem("spells"));
        storedSpells = storedSpells.map(spell => {
            if (spell.concentration && spell.active) {
                return { ...spell, active: false };
            }
            return spell;
        });
        localStorage.setItem("spells", JSON.stringify(storedSpells));
        updateSpellStatus(storedSpells);
    }

    function addCastEvents() {
        const spells = JSON.parse(localStorage.getItem("spells"));

        spells.forEach(spell => {
            const castButton = document.querySelector(`.${spell.name}-cast`);
            const endButton = document.querySelector(`.${spell.name}-end`);
            if (castButton)
                castButton.addEventListener('click', () => spellCast(spell.name,spell.level));
            if (endButton)
                endButton.addEventListener('click', () => spellCease(spell.name,spell.level));
        });
    }

    function addFreeSlotsEvents() {
        const freeLevel1Slot = document.querySelector('#freeslotlevel1');
        const freeLevel2Slot = document.querySelector('#freeslotlevel2');
        const freeLevel3Slot = document.querySelector('#freeslotlevel3');
        const freeLevel4Slot = document.querySelector('#freeslotlevel4');
        const freeLevel5Slot = document.querySelector('#freeslotlevel5');

        freeLevel1Slot.addEventListener('click', () => emptySlot(1));
        freeLevel2Slot.addEventListener('click', () => emptySlot(2));
        freeLevel3Slot.addEventListener('click', () => emptySlot(3));
        freeLevel4Slot.addEventListener('click', () => emptySlot(4));
        freeLevel5Slot.addEventListener('click', () => emptySlot(5));
    }

    const storedSpellsStatus = JSON.parse(localStorage.getItem("spells"));
    updateSpellStatus(storedSpellsStatus);
    addFreeSlotsEvents()
    addCastEvents();

});
