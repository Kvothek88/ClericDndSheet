import { loadSavedConditions, saveConditions, toggleCondition } from './actions.js';

export function spellCease(name,level) {
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

    const deathwardTracker = document.getElementById('deathward-tracker');
    deathwardTracker.value = "";

    removeNonDamageEffects(name);
    localStorage.setItem("spells", JSON.stringify(storedSpells));
    updateSpellStatus(storedSpells);
}

export function updateSpellStatus(spellsStatus) {
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
    const level5slot2 = document.getElementById('level5slot2');
    const level6slot1 = document.getElementById('level6slot1');

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
    level5slot2.value = storedSlots.level5slot2;
    level6slot1.value = storedSlots.level6slot1;
}



function applyNonDamageEffects(name){
    let savedStats = localStorage.getItem('dndCharacterStats');
    if (name=='shieldoffaith'){
        let stats = savedStats ? JSON.parse(savedStats) : {};

        stats.acother = "2";
        localStorage.setItem('dndCharacterStats', JSON.stringify(stats));
    }

    if (['guidingbolt', 'guidingboltlevel2', 'guidingboltlevel3', 'guidingboltlevel4', 'guidingboltlevel5'].includes(name)){
        const guidingBoltTracker = document.getElementById('guidingbolt-tracker');
        if (guidingBoltTracker.value == ""){
            guidingBoltTracker.value = "🔲";
        }
    }

    if (name=='greaterinvisibility'){
        const invisibleBox = document.getElementById('toggle-invisible');
        if (!invisibleBox.checked)
            toggleCondition('invisible');
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

export function removeNonDamageEffects(name){
    let savedStats = localStorage.getItem('dndCharacterStats');
    if (name=='shieldoffaith'){
        let stats = savedStats ? JSON.parse(savedStats) : {};

        stats.acother = 0;
        localStorage.setItem('dndCharacterStats', JSON.stringify(stats));
    }

    if (['guidingbolt', 'guidingboltlevel2', 'guidingboltlevel3', 'guidingboltlevel4', 'guidingboltlevel5'].includes(name)){
        const guidingBoltTracker = document.getElementById('guidingbolt-tracker');
        guidingBoltTracker.value = "";
    }

    if (name=='greaterinvisibility'){
        const invisibleBox = document.getElementById('toggle-invisible');
        if (invisibleBox.checked)
            toggleCondition('invisible');
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

document.addEventListener('DOMContentLoaded', function () {

    function diceThrow(diceNumber, diceType, name, modifier=false, blessedStrikes=false, spellAttack=false) {
        let result = 0;
        const rolls = [];
        const wisModifierInput = document.getElementById('wisdom-modifier').value;
        const wisModifier = parseInt(wisModifierInput.replace('+', ''));
        let blessedStrikesRoll = 0;
        const spellAttackTracker = document.getElementById('spell-attack-tracker');
        const spellAttackCrit = document.getElementById('spell-attack-crit');
        const critical = document.getElementById('crit');
        let crit = 1;

        if (spellAttack){
            if (critical.value !== ""){
                crit = 2;
            } else if (spellAttackTracker.value !== "")
            {
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

        showToast(`${name}${critString}: ${totalDice}d${diceType}${modifierString1}${blessedStrikesString} = ${rollsString}${blessedStrikesRollString}${modifierString2} = ${result}  `, 'magic');

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

    function healSpecific(gainedHP) {
        const savedStats = JSON.parse(localStorage.getItem("dndCharacterStats"))
        const maxHP = parseInt(document.getElementById('max-hp').value);
        const currentHPInput = document.getElementById('cur-hp');
        let currentHP = parseInt(currentHPInput.value);

        currentHP += gainedHP;

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
        showToast(`Flame Strike (Level ${level}): ${level*2}d6 = ${level}d6 Fire + ${level}d6 Radiant = ${fireRollsString} + ${radiantRollsString} = ${fireResult} Fire + ${radiantResult} Radiant = ${result}  `, 'magic');
    }

    function healSpell(level) {
        let choice = prompt("Choose: 1 if you include yourself, 2 if not");
        let hpGained = 70 + (10*(level-6))
        if (choice == 1) {
            healSpecific(hpGained)
            showToast(`You gained ${hpGained} HP`, 'magic');
        }
        else if (choice == 2) {
            showToast(`${hpGained} HP gained`, 'magic');
        }
        else 
        {
            showToast('Wrong Choice', 'error');
        }
    }

    function harmSpell(level) {
        if (level == 6)
            diceThrow(14,6,'Harm');
        else
            diceThrow(14,6,`Harm(Level ${level})`);
    }

    function buffEffects(spell){
        const guidanceTracker = document.getElementById('guidance-tracker');
        const blessTracker = document.getElementById('bless-tracker');
        const deathwardTracker = document.getElementById('deathward-tracker');

        if (spell === "guidance"){
            if (guidanceTracker.value == ""){
                guidanceTracker.value = "🔲";
                showToast("Guidance: Active", 'magic');
            } else {
                guidanceTracker.value = "";
                showToast("Guidance: Inactive", 'magic');
            }
        }

        if (spell === "bless"){
            if (blessTracker.value == ""){
                blessTracker.value = "🔲";
                showToast("Bless: Active", 'magic');
            } else {
                blessTracker.value = "";
                showToast("Bless: Inactive", 'magic');
            }
        }

        if (spell === "deathward"){
            if (deathwardTracker.value == ""){
                deathwardTracker.value = "🔲";
                showToast("Death Ward: Active", 'magic');
            } else {
                deathwardTracker.value = "";
                showToast("Death Ward: Inactive", 'magic');
            }
        }
    }

    function addEffectsEvents() {
        const sacredFlameEffect = document.querySelector('.sacredflame-effect');
        sacredFlameEffect.addEventListener('click', () => diceThrow(2, 8, 'Sacred Flame', false, true));

        const tollTheDeadEffect = document.querySelector('.tollthedead-effect');
        tollTheDeadEffect.addEventListener('click', () => tollTheDead());

        const guidanceEffect = document.querySelector('.guidance-effect');
        guidanceEffect.addEventListener('click', () => buffEffects("guidance"));

        const blessEffect = document.querySelector('.bless-effect');
        blessEffect.addEventListener('click', () => buffEffects("bless"));

        const guidingBoltEfect = document.querySelector('.guidingbolt-effect');
        guidingBoltEfect.addEventListener('click', () => diceThrow(4, 6, 'Guiding Bolt', false, false, true));

        const guidingBoltLevel2Effect = document.querySelector('.guidingboltlevel2-effect');
        guidingBoltLevel2Effect.addEventListener('click', () => diceThrow(5, 6, 'Guiding Bolt (Level2)', false, false, true));

        const guidingBoltLevel3Effect = document.querySelector('.guidingboltlevel3-effect');
        guidingBoltLevel3Effect.addEventListener('click', () => diceThrow(6, 6, 'Guiding Bolt (Level3)', false, false, true));

        const guidingBoltLevel4Effect = document.querySelector('.guidingboltlevel4-effect');
        guidingBoltLevel4Effect.addEventListener('click', () => diceThrow(7, 6, 'Guiding Bolt (Level4)', false, false, true));

        const guidingBoltLevel5Effect = document.querySelector('.guidingboltlevel5-effect');
        guidingBoltLevel5Effect.addEventListener('click', () => diceThrow(8, 6, 'Guiding Bolt (Level5)', false, false, true));

        const guidingBoltLevel6Effect = document.querySelector('.guidingboltlevel6-effect');
        guidingBoltLevel6Effect.addEventListener('click', () => diceThrow(9, 6, 'Guiding Bolt (Level6)', false, false, true));

        const cureWoundsEffect = document.querySelector('.curewounds-effect');
        cureWoundsEffect.addEventListener('click', () => cureWounds(1));

        const cureWoundsLevel2Effect = document.querySelector('.curewoundslevel2-effect');
        cureWoundsLevel2Effect.addEventListener('click', () => cureWounds(2));

        const cureWoundsLevel3Effect = document.querySelector('.curewoundslevel3-effect');
        cureWoundsLevel3Effect.addEventListener('click', () => cureWounds(3));

        const cureWoundsLevel4Effect = document.querySelector('.curewoundslevel4-effect');
        cureWoundsLevel4Effect.addEventListener('click', () => cureWounds(4));

        const deathwardEffect = document.querySelector('.deathward-effect');
        deathwardEffect.addEventListener('click', () => buffEffects("deathward"));

        const cureWoundsLevel5Effect = document.querySelector('.curewoundslevel5-effect');
        cureWoundsLevel5Effect.addEventListener('click', () => cureWounds(5));

        const cureWoundsLevel6Effect = document.querySelector('.curewoundslevel6-effect');
        cureWoundsLevel6Effect.addEventListener('click', () => cureWounds(6));

        const moonbeamEffect = document.querySelector('.moonbeam-effect');
        moonbeamEffect.addEventListener('click', () => diceThrow(2, 10, 'Moonbeam'));

        const moonbeamLevel3Effect = document.querySelector('.moonbeamlevel3-effect');
        moonbeamLevel3Effect.addEventListener('click', () => diceThrow(3, 10, 'Moonbeam(Level 3)'));

        const moonbeamLevel4Effect = document.querySelector('.moonbeamlevel4-effect');
        moonbeamLevel4Effect.addEventListener('click', () => diceThrow(4, 10, 'Moonbeam(Level 4)'));

        const moonbeamLevel5Effect = document.querySelector('.moonbeamlevel5-effect');
        moonbeamLevel5Effect.addEventListener('click', () => diceThrow(5, 10, 'Moonbeam(Level 5)'));

        const moonbeamLevel6Effect = document.querySelector('.moonbeamlevel6-effect');
        moonbeamLevel5Effect.addEventListener('click', () => diceThrow(5, 10, 'Moonbeam(Level 6)'));

        const spirituaWeaponEffect = document.querySelector('.spiritualweapon-effect');
        spirituaWeaponEffect.addEventListener('click', () => diceThrow(1, 8, 'Spiritual Weapon', true, false, true));

        const spirituaWeaponLevel3Effect = document.querySelector('.spiritualweaponlevel3-effect');
        spirituaWeaponLevel3Effect.addEventListener('click', () => diceThrow(2, 8, 'Spiritual Weapon(Level3)',true, false, true));

        const spirituaWeaponLevel4Effect = document.querySelector('.spiritualweaponlevel4-effect');
        spirituaWeaponLevel4Effect.addEventListener('click', () => diceThrow(3, 8, 'Spiritual Weapon(Level 4)',true, false, true));

        const spirituaWeaponLevel5Effect = document.querySelector('.spiritualweaponlevel5-effect');
        spirituaWeaponLevel5Effect.addEventListener('click', () => diceThrow(4, 8, 'Spiritual Weapon(Level 5)',true, false, true));

        const spirituaWeaponLevel6Effect = document.querySelector('.spiritualweaponlevel6-effect');
        spirituaWeaponLevel6Effect.addEventListener('click', () => diceThrow(5, 8, 'Spiritual Weapon(Level 6)',true, false, true));

        const auraOfVitalityEffect = document.querySelector('.auraofvitality-effect');
        auraOfVitalityEffect.addEventListener('click', () => auraOfVitality());

        const spiritGuardiansEffect = document.querySelector('.spiritguardians-effect');
        spiritGuardiansEffect.addEventListener('click', () => diceThrow(3, 8, 'Spirit Guardians'));

        const spiritGuardiansLevel4Effect = document.querySelector('.spiritguardianslevel4-effect');
        spiritGuardiansLevel4Effect.addEventListener('click', () => diceThrow(4, 8, 'Spirit Guardians(Level 4)'));

        const spiritGuardiansLevel5Effect = document.querySelector('.spiritguardianslevel5-effect');
        spiritGuardiansLevel5Effect.addEventListener('click', () => diceThrow(5, 8, 'Spirit Guardians(Level 5)'));

        const spiritGuardiansLevel6Effect = document.querySelector('.spiritguardianslevel6-effect');
        spiritGuardiansLevel6Effect.addEventListener('click', () => diceThrow(6, 8, 'Spirit Guardians(Level 6)'));

        const flamestrike = document.querySelector('.flamestrike-effect');
        flamestrike.addEventListener('click', () => flameStrike(5));

        const massCureWoundsEffect = document.querySelector('.masscurewounds-effect');
        massCureWoundsEffect.addEventListener('click', () => massCureWounds(5));

        const massCureWoundsEffectLevel6Effect = document.querySelector('.masscurewoundslevel6-effect');
        massCureWoundsEffectLevel6Effect.addEventListener('click', () => massCureWounds(6));

        const healEffect = document.querySelector('.heal-effect');
        healEffect.addEventListener('click', () => healSpell(6));

        const harmEffect = document.querySelector('.harm-effect');
        harmEffect.addEventListener('click', () => harmSpell(6));
    }

    addEffectsEvents();

    const spellsStatus = [
        {name: 'guidance', active: false, concentration: true, duration: true, level: 0, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-', effectType: 'Effect'},
        {name: 'thaumaturgy', active: false, concentration: false, duration: true, level: 0, verbal: true, somatic: false, castingTime: '1 Action', range: '30 ft', saveDC: '-',  effectType: 'Control'},
        {name: 'sacredflame', active: false, concentration: false, duration: false, level: 0, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: 'DEX',  effectType: 'Effect'},
        {name: 'tollthedead', active: false, concentration: false, duration: false, level: 0, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: 'WIS',  effectType: 'Effect'},
        {name: 'guidingbolt', active: false, concentration: false, duration: true, level: 1, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'spellattack',  effectType: 'Effect'},
        {name: 'bless', active: false, concentration: true, duration: true, level: 1, verbal: true, somatic: true, castingTime: '1 Action', range: '30 ft', saveDC: '-',  effectType: 'Effect'},
        {name: 'shieldoffaith', active: false, concentration: true, duration: true, level: 1, verbal: true, somatic: true, castingTime: '1 Bonus Action', range: '60 ft', saveDC: '-',  effectType: '+2 AC'},
        {name: 'curewounds', active: false, concentration: false, duration: false, level: 1, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-',  effectType: 'Effect'},
        {name: 'fairiefire', active: false, concentration: true, duration: true, level: 1, verbal: true, somatic: false, castingTime: '1 Action', range: '60 ft', saveDC: 'DEX',  effectType: 'Invisible'},
        {name: 'detectmagic', active: false, concentration: true, duration: true, level: 1, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: '-', effectType: 'Detection'},
        {name: 'detectevilandgood', active: false, concentration: true, duration: true, level: 1, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: '-', effectType: 'Detection'},
        {name: 'sleep', active: false, concentration: false, duration: true, level: 1, verbal: true, somatic: true, castingTime: '1 Action', range: '90 ft', saveDC: '-',  effectType: 'Unconsious'},
        {name: 'moonbeam', active: false, concentration: true, duration: true, level: 2, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'CON', effectType: 'Effect'},
        {name: 'seeinvisibility', active: false, concentration: false, duration: true, level: 2, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: '-', effectType: 'Detection'},
        {name: 'curewoundslevel2', active: false, concentration: false, duration: false, level: 2, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-', effectType: 'Effect'},
        {name: 'spiritualweapon', active: false, concentration: true, duration: true, level: 2, verbal: true, somatic: true, castingTime: '1 Bonus Action', range: '60 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'guidingboltlevel2', active: false, concentration: false, duration: true, level: 2, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'auraofvitality', active: false, concentration: true, duration: true, level: 3, verbal: true, somatic: false, castingTime: '1 Action', range: '30 ft', saveDC: '-', effectType: 'Effect'},
        {name: 'bestowcurse', active: false, concentration: true, duration: true, level: 3, verbal: true, somatic: true, castingTime: '1 Action', range: '30 ft', saveDC: 'WIS', effectType: 'Debuff'},
        {name: 'dispelmagic', active: false, concentration: false, duration: false, level: 3, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: '-', effectType: 'Control'},
        {name: 'leomunds', active: false, concentration: false, duration: true, level: 3, verbal: true, somatic: true, castingTime: '1 Minute', range: 'Self', saveDC: '-', effectType: 'Utility'},
        {name: 'spiritguardians', active: false, concentration: true, duration: true, level: 3, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: 'WIS', effectType: 'Effect'},
        {name: 'curewoundslevel3', active: false, concentration: false, duration: false, level: 3, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-', effectType: 'Effect'},
        {name: 'guidingboltlevel3', active: false, concentration: false, duration: true, level: 3, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'moonbeamlevel3', active: false, concentration: true, duration: true, level: 3, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'CON', effectType: 'Effect'},
        {name: 'spiritualweaponlevel3', active: false, concentration: true, duration: true, level: 3, verbal: true, somatic: true, castingTime: '1 Bonus Action', range: '60 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'auraoflife', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: false, castingTime: '1 Action', range: '30 ft', saveDC: '-', effectType: 'Revive'},
        {name: 'controlwater', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: '300 ft', saveDC: 'STR', effectType: 'Control Water'},
        {name: 'banishment', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: '30 ft', saveDC: 'CHA', effectType: 'Banish'},
        {name: 'auraofpurity', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: false, castingTime: '1 Action', range: '30 ft', saveDC: '-', effectType: 'Buff'},
        {name: 'deathward', active: false, concentration: false, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-', effectType: 'Effect'},
        {name: 'greaterinvisibility', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: '-', effectType: 'Invisible'},
        {name: 'guardianoffaith', active: false, concentration: false, duration: true, level: 4, verbal: true, somatic: false, castingTime: '1 Action', range: '30 ft', saveDC: 'DEX', effectType: '20 Damage'},
        {name: 'dispelmagiclevel4', active: false, concentration: false, duration: false, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: '-', effectType: 'Control'},
        {name: 'spiritguardianslevel4', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: 'WIS', effectType: 'Effect'},
        {name: 'curewoundslevel4', active: false, concentration: false, duration: false, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-', effectType: 'Effect'},
        {name: 'guidingboltlevel4', active: false, concentration: false, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'moonbeamlevel4', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'CON', effectType: 'Effect'},
        {name: 'spiritualweaponlevel4', active: false, concentration: true, duration: true, level: 4, verbal: true, somatic: true, castingTime: '1 Bonus Action', range: '60 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'circleofpower', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: false, castingTime: '1 Action', range: 'Self', saveDC: '-', effectType: 'Buff'},
        {name: 'flamestrike', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: 'DEX', effectType: 'Effect'},
        {name: 'holyweapon', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Bonus Action', range: 'Touch', saveDC: 'CON', effectType: '2d8'},
        {name: 'masscurewounds', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: '-', effectType: 'Effect'},
        {name: 'spiritguardianslevel5', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: 'WIS', effectType: 'Effect'},
        {name: 'curewoundslevel5', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-', effectType: 'Effect'},
        {name: 'guidingboltlevel5', active: false, concentration: false, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'moonbeamlevel5', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'CON', effectType: 'Effect'},
        {name: 'spiritualweaponlevel5', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Bonus Action', range: '60 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'dispelmagiclevel5', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: '-', effectType: 'Control'},
        {name: 'mislead', active: false, concentration: true, duration: true, level: 5, verbal: false, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: '-', effectType: 'Deception'},
        {name: 'summoncelestial', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '90 ft', saveDC: '-', effectType: 'Summoning'},
        {name: 'raisedead', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Hour', range: 'Touch', saveDC: '-', effectType: 'Resurrect'},
        {name: 'heal', active: false, concentration: false, duration: false, level: 6, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: '-', effectType: 'Heal'},
        {name: 'harm', active: false, concentration: false, duration: false, level: 6, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: 'CON', effectType: 'Damage'},
        {name: 'herowsfeast', active: false, concentration: false, duration: true, level: 5, verbal: true, somatic: true, castingTime: '10 minutes', range: 'Touch', saveDC: '-', effectType: 'Buff'},
        {name: 'masscurewoundslevel6', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: '-', effectType: 'Effect'},
        {name: 'spiritguardianslevel6', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: 'Self', saveDC: 'WIS', effectType: 'Effect'},
        {name: 'curewoundslevel6', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: 'Touch', saveDC: '-', effectType: 'Effect'},
        {name: 'guidingboltlevel6', active: false, concentration: false, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'moonbeamlevel6', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '120 ft', saveDC: 'CON', effectType: 'Effect'},
        {name: 'spiritualweaponlevel6', active: false, concentration: true, duration: true, level: 5, verbal: true, somatic: true, castingTime: '1 Bonus Action', range: '60 ft', saveDC: 'spellattack', effectType: 'Effect'},
        {name: 'dispelmagiclevel6', active: false, concentration: false, duration: false, level: 5, verbal: true, somatic: true, castingTime: '1 Action', range: '60 ft', saveDC: '-', effectType: 'Control'},
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
        level5slot1:"",
        level5slot2:"",
        level6slot1:"",
    }
    localStorage.getItem("spellSlots") ?? localStorage.setItem("spellSlots", JSON.stringify(spellSlots));

    const spellNames = [
        "Guidance", "Thaumaturgy", "Sacred Flame", "Toll The Dead", "Guiding Bolt",
        "Bless", "Shield Of Faith", "Cure Wounds", "Fairie Fire", "Detect Magic", "Detect Evil and Good", 
        "Sleep", "Moonbeam", "See Invisibility", "Cure Wounds (Level 2)", "Spiritual Weapon",
        "Guiding Bolt (Level 2)", "Aura Of Vitality", "Bestow Curse", "Dispel Magic",
        "Leomunds", "Spirit Guardians", "Cure Wounds (Level 3)", "Guiding Bolt (Level 3)",
        "Moonbeam (Level 3)", "Spiritual Weapon (Level 3)", "Aura Of Life", "Control Water", "Banishment",
        "Aura Of Purity", "Death Ward", "Greater Invisibility", "Guardian Of Faith", "Dispel Magic (Level 4)",
        "Spirit Guardians (Level 4)", "Cure Wounds (Level 4)", "Guiding Bolt (Level 4)",
        "Moonbeam (Level 4)", "Spiritual Weapon (Level 4)", "Circle Of Power", "Flame Strike",
        "Holy Weapon", "Mass Cure Wounds", "Spirit Guardians (Level 5)", "Cure Wounds (Level 5)",
        "Guiding Bolt (Level 5)", "Moonbeam (Level 5)", "Spiritual Weapon (Level 5)",
        "Dispel Magic (Level 5)", "Mislead", "Summon Celestial", "Raise Dead"
    ];

    const spellNameMap = {};

    spellNames.forEach(name => {
        const key = name.replace(/[\s()]/g, '').toLowerCase();
        spellNameMap[key] = name;
    });

    const ringSlots = {
        ringslot1:"",
        ringslot2:"",
        ringslot3:"",
        ringslot4:"",
        ringslot5:""
    }
    localStorage.getItem("ringSlots") ?? localStorage.setItem("ringSlots", JSON.stringify(ringSlots));

    function populateSpellListDropdown(){
        const spellListDropdown = document.getElementById('spell-list');

        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '-Select a spell to store';
        spellListDropdown.appendChild(defaultOption);

        spellNames.forEach(spellName => {
            const option = document.createElement('option');
            option.value = spellName;
            option.textContent = spellName;
            spellListDropdown.appendChild(option);
        });
    }

    populateSpellListDropdown();

    document.getElementById('storespell').addEventListener('click', function() {
        const selectedSpellName = document.getElementById('spell-list').value;
        if (!selectedSpellName || selectedSpellName === "-Select a spell to store"){
            showToast("Select a spell to add", 'error');
            return;
        }
    
        storeSpell(selectedSpellName);
    });

    function storeSpell(name){
        const formattedName = name.trim().replace(/[\s()]/g, '').toLowerCase();
        let totalLevelsStored = 0;
        const ringSpellsStatus = JSON.parse(localStorage.getItem("ringSpellsStatus")) ?? [];
  
        // Calculate the current total levels stored
        if (ringSpellsStatus.length !== 0){
            ringSpellsStatus.forEach((storedSpell) => {
                let level = spellsStatus.find(spell => spell.name === storedSpell.name).level;
                totalLevelsStored += level;
            })
        }
        const spellToAddLevel = spellsStatus.find(spell => spell.name === formattedName).level;
        if (totalLevelsStored + spellToAddLevel > 5){
            showToast("Ring capacity exceeded", 'error');
            return;
        }
        if (spellToAddLevel === 0){
            showToast("You cannot store cantrips in the Ring", 'error');
            return;     
        }

        // Update ringSpellStatus
        const count = ringSpellsStatus.filter(spell => spell.name === formattedName).length;
        const id = count === 0 ? formattedName : `${formattedName}${count + 1}`;
        ringSpellsStatus.push({
            name: formattedName,
            id: id,
            active: false
        });
        localStorage.setItem("ringSpellsStatus", JSON.stringify(ringSpellsStatus));

        // Update ringSlots
        const ringSlots = JSON.parse(localStorage.getItem("ringSlots"));
        let slotsFilled = 0;
        for (let i = 1; i <= 5 && slotsFilled < spellToAddLevel; i++) {
            const key = `ringslot${i}`;
            if (ringSlots[key] === "") {
                ringSlots[key] = "🔲";
                slotsFilled++;
            }
        }
        localStorage.setItem("ringSlots", JSON.stringify(ringSlots));
        renderRingTable();
        const effect = spellsStatus.find(spell => spell.name === formattedName).effectType;
        if (effect === "Effect"){
            addRingEffectsEvents();
        } 
        addRingCastEvents();
    }

    function renderRingTable(){
        const ringSpellsStatus = JSON.parse(localStorage.getItem("ringSpellsStatus")) ?? [];
        const ringSlots = JSON.parse(localStorage.getItem("ringSlots"));
        const tbody = document.querySelector('#spellTable tbody');
        tbody.innerHTML = '';
        let ringSlotElement = null;

        ringSpellsStatus.forEach((storedSpell) => {
            const spellObj = spellsStatus.find(spell => spell.name === storedSpell.name);
            const spellName = spellNameMap[storedSpell.name];

            let saveDCCell = "";
            if (spellObj.saveDC === '-') {
                saveDCCell = `<td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;">-</td>`;
            } else if (spellObj.saveDC.toLowerCase() === 'spellattack') {
                saveDCCell = `<td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;"><span class="spellattack"></span></td>`;
            } else {
                saveDCCell = `<td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;">${spellObj.saveDC} <span class="saveDC"></span></td>`;
            }
    
            let ceaseCell = '';
            if (spellObj.duration) {
                ceaseCell = `<td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;"><button id="${storedSpell.id}-stored-end">CEASE</button></td>`;
            } else {
                ceaseCell = `<td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;">-</td>`;
            }

            let effectType = '';
            if (spellObj.effectType === "Effect") {
                effectType = `<td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;"><button id="${storedSpell.id}-stored-effect">EFFECT</button></td>`;
            } else {
                effectType = `<td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;">${spellObj.effectType}</td>`;
            }
    
            const row = document.createElement('tr');
            row.innerHTML = `
                <td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;">${spellName}</td>
                <td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;">${spellObj.castingTime}</td>
                <td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;">${spellObj.range}</td>
                ${saveDCCell}
                <td class="${storedSpell.id}-stored-row" style="border: 1px solid #ddd; padding: 8px; text-align: center;"><button id="${storedSpell.id}-stored-cast">CAST</button></td>
                ${ceaseCell}
                ${effectType}
            `;
            tbody.appendChild(row);
        });

        Object.entries(ringSlots).forEach(([key, value]) => {
            if (value === "🔲") {
                ringSlotElement = document.getElementById(key);
                if (ringSlotElement){
                    ringSlotElement.value = "🔲";
                    ringSlotElement.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    const attachedListeners = new Set();

    function addRingEffectsEvents() {
        const ringSpellsStatus = JSON.parse(localStorage.getItem("ringSpellsStatus")) ?? [];
    
        const spellCallbacks = {
            sacredflame: () => diceThrow(2, 8, 'Sacred Flame', false, true),
            tollthedead: () => tollTheDead(),
            guidance: () => buffEffects("guidance"),
            bless: () => buffEffects("bless"),
            guidingbolt: () => diceThrow(4, 6, 'Guiding Bolt', false, false, true),
            guidingboltlevel2: () => diceThrow(5, 6, 'Guiding Bolt (Level2)', false, false, true),
            guidingboltlevel3: () => diceThrow(6, 6, 'Guiding Bolt (Level3)', false, false, true),
            guidingboltlevel4: () => diceThrow(7, 6, 'Guiding Bolt (Level4)', false, false, true),
            guidingboltlevel5: () => diceThrow(8, 6, 'Guiding Bolt (Level5)', false, false, true),
            curewounds: () => cureWounds(1),
            curewoundslevel2: () => cureWounds(2),
            curewoundslevel3: () => cureWounds(3),
            curewoundslevel4: () => cureWounds(4),
            curewoundslevel5: () => cureWounds(5),
            deathward: () => buffEffects("deathward"),
            moonbeam: () => diceThrow(2, 10, 'Moonbeam'),
            moonbeamlevel3: () => diceThrow(3, 10, 'Moonbeam(Level 3)'),
            moonbeamlevel4: () => diceThrow(4, 10, 'Moonbeam(Level 4)'),
            moonbeamlevel5: () => diceThrow(5, 10, 'Moonbeam(Level 5)'),
            spiritualweapon: () => diceThrow(1, 8, 'Spiritual Weapon', true, false, true),
            spiritualweaponlevel3: () => diceThrow(2, 8, 'Spiritual Weapon(Level 3)', true, false, true),
            spiritualweaponlevel4: () => diceThrow(3, 8, 'Spiritual Weapon(Level 4)', true, false, true),
            spiritualweaponlevel5: () => diceThrow(4, 8, 'Spiritual Weapon(Level 5)', true, false, true),
            auraofvitality: () => auraOfVitality(),
            spiritguardians: () => diceThrow(3, 8, 'Spirit Guardians'),
            spiritguardianslevel4: () => diceThrow(4, 8, 'Spirit Guardians(Level 4)'),
            spiritguardianslevel5: () => diceThrow(5, 8, 'Spirit Guardians(Level 5)'),
            flamestrike: () => flameStrike(5),
            masscurewounds: () => massCureWounds(5)
        };

        ringSpellsStatus.forEach(spell => {
            const elementId = `${spell.id}-stored-effect`;
            const element = document.getElementById(elementId);
            const callback = spellCallbacks[spell.name];

            const effect = spellsStatus.find(spl => spl.name === spell.name).effectType;
            if (effect === "Effect"){
                element.addEventListener('click', callback);
            }
        });
    }
    
    function ringSpellCast(name, id) {
        let ringSpellsStatus = JSON.parse(localStorage.getItem("ringSpellsStatus")) ?? [];
        let spells = JSON.parse(localStorage.getItem("spells")) || [];
        const spellToUpdate = spells.find(spell => spell.name === name);
        const isConcentration = spellToUpdate?.concentration;
        const isDuration = spellToUpdate?.duration;
        const ringSlots = JSON.parse(localStorage.getItem("ringSlots"));
    
        const incapacitatedBox = document.getElementById('toggle-incapacitated');
        const handsRestrainedBox = document.getElementById('toggle-hands restrained');
        const silencedBox = document.getElementById('toggle-silenced');
    
        if (incapacitatedBox.checked) {
            showToast("You are incapacitated!", 'info');
            return;
        }
    
        if (spellToUpdate?.verbal && silencedBox.checked) {
            showToast('You cannot cast spells with verbal components because you are silenced', 'tactics');
            return;
        }
    
        if (spellToUpdate?.somatic && handsRestrainedBox.checked) {
            showToast('You cannot cast spells with somatic components because your hands are restrained', 'tactics');
            return;
        }
    
        // Handle concentration logic
        if (isConcentration) {
            const guidanceTracker = document.getElementById('guidance-tracker');
            const blessTracker = document.getElementById('bless-tracker');
            guidanceTracker.value = "";
            blessTracker.value = "";
    
            removeNonDamageEffects('greaterinvisibility');
            removeNonDamageEffects('summoncelestial');
    
            spells = spells.map(spell => {
                if (spell.concentration && spell.active) {
                    return { ...spell, active: false };
                }
                return spell;
            });
        }
    
        // Handle non-damage effects
        applyNonDamageEffects(name);
    
        if (name === "guidance") {
            const guidanceTracker = document.getElementById('guidance-tracker');
            const choice = parseInt(prompt("Enter 1 if self or 2 if other"));
            if (choice === 1) guidanceTracker.value = "🔲";
        }
    
        if (name === "bless") {
            const blessTracker = document.getElementById('bless-tracker');
            const choice = parseInt(prompt("Enter 1 if self or 2 if other"));
            if (choice === 1) blessTracker.value = "🔲";
        }
    
        if (name === "deathward") {
            const deathwardTracker = document.getElementById('deathward-tracker');
            const choice = parseInt(prompt("Enter 1 if self or 2 if other"));
            if (choice === 1) deathwardTracker.value = "🔲";
        }

        // If it's not a duration spell, remove immediately
        if (!isDuration) {
            const cell = document.querySelector(`.${id}-stored-row`);
            if (cell) {
                const row = cell.closest('tr');
                if (row) row.remove();
            }
            const updatedRingSpellsStatus = ringSpellsStatus.filter(spell => spell.id !== id);
            localStorage.setItem("ringSpellsStatus", JSON.stringify(updatedRingSpellsStatus));

            let spells = JSON.parse(localStorage.getItem("spells")) || {};
            let removeSlots = spells.find(spell => spell.name === name).level;
            let countdown = 5;

            while (removeSlots > 0){
                if (ringSlots[`ringslot${countdown}`] !== ""){
                    ringSlots[`ringslot${countdown}`] = "";
                    removeSlots--;
                    countdown--;
                } else {
                    countdown--;
                }
            }
            localStorage.setItem("ringSlots", JSON.stringify(ringSlots));
        } else {
            // Otherwise mark it as active
            ringSpellsStatus = ringSpellsStatus.map(spell => {
                if (spell.id === id) {
                    return { ...spell, active: true };
                }
                return spell;
            });
            localStorage.setItem("ringSpellsStatus", JSON.stringify(ringSpellsStatus));
        }

        updateRingSpellStatus(ringSpellsStatus);
    }

    function ringSpellCease(name,id) {
        let ringSpellsStatus = JSON.parse(localStorage.getItem("ringSpellsStatus")) ?? [];
        let ringSlots = JSON.parse(localStorage.getItem("ringSlots")) || {};
        let spells = JSON.parse(localStorage.getItem("spells")) || {};
        
        let removeSlots = spells.find(spell => spell.name === name).level;
        let countdown = 5;

        while (removeSlots > 0){
            if (ringSlots[`ringslot${countdown}`] !== ""){
                ringSlots[`ringslot${countdown}`] = "";
                removeSlots--;
                countdown--;
            } else {
                countdown--;
            }
        }
        localStorage.setItem("ringSlots", JSON.stringify(ringSlots));

        const updatedRingSpellsStatus = ringSpellsStatus.filter(spell => spell.id !== id);
        localStorage.setItem("ringSpellsStatus", JSON.stringify(updatedRingSpellsStatus));
  
        const rowToRemove = document.querySelector(`.${id}-stored-row`);
        if (rowToRemove) {
            const row = rowToRemove.closest('tr');
            if (row) row.remove();
        }
        
        updateRingSpellStatus(ringSpellsStatus);
    }
    function updateRingSpellStatus(ringSpellStatus) {
        const rowsList = [];
    
        // Collect all matching row elements for each spell by class
        ringSpellStatus.forEach(spell => {
            const spellRows = document.querySelectorAll(`.${spell.id}-stored-row`);
            rowsList.push(spellRows);
        });
    
        const spells = JSON.parse(localStorage.getItem("spells")) || [];
    
        for (let i = 0; i < rowsList.length; i++) {
            const rowNodes = rowsList[i];
            const ringSpell = ringSpellStatus[i];
            const spellInfo = spells.find(s => s.name === ringSpell.name);
            
            if (rowNodes.length > 0 && spellInfo) {
                let color = '';
    
                if (spellInfo.concentration && ringSpell.active) {
                    color = '#B266FF'; // Purple for concentration
                } else if (spellInfo.duration && ringSpell.active) {
                    color = '#66FFB2'; // Green for duration
                }
    
                rowNodes.forEach(cell => {
                    cell.style.backgroundColor = color;
                });
            }
        }
        updateRingSlotStatus();
    }
    
    function updateRingSlotStatus(){
        const slots = JSON.parse(localStorage.getItem('ringSlots'));
        const slot1 = document.getElementById("ringslot1");
        const slot2 = document.getElementById("ringslot2");
        const slot3 = document.getElementById("ringslot3");
        const slot4 = document.getElementById("ringslot4");
        const slot5 = document.getElementById("ringslot5");

        slot1.value = slots.ringslot1;
        slot2.value = slots.ringslot2;
        slot3.value = slots.ringslot3;
        slot4.value = slots.ringslot4;
        slot5.value = slots.ringslot5;
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
        const level5slot2 = document.getElementById('level5slot2');
        const level6slot1 = document.getElementById('level6slot1');

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
            if (level5slot2.value !== ""){
                level5slot2.value = "";
                storedSlots.level5slot2 = "";
            }
            else if (level5slot1.value !== ""){
                level5slot1.value = "";
                storedSlots.level5slot1 = "";
            }  
            else {
                showToast('All Level 5 spell slots are already empty', 'error');
                return;
            }
        } else if (level == 6){
            if (level6slot1.value !== ""){
                level6slot1.value = "";
                storedSlots.level6slot1 = "";
            }
        }

        localStorage.setItem("spellSlots", JSON.stringify(storedSlots)); 
    }

    function spellCast(name,level) {
        let storedSpells = JSON.parse(localStorage.getItem("spells"));
        let storedSlots = JSON.parse(localStorage.getItem("spellSlots"));
        const spellToUpdate = storedSpells.find(spell => spell.name === name);
        const incapacitatedBox = document.getElementById('toggle-incapacitated');
        const handsRestrainedBox = document.getElementById('toggle-hands restrained');
        const silencedBox = document.getElementById('toggle-silenced');

        if (incapacitatedBox.checked){
            showToast("You are incapacitated!",'info');
            return;
        }
        if (storedSpells.find(spell => spell.name === name).verbal === true){
            if (silencedBox.checked){
                showToast('You cannot cast spells with verbal components because you are silenced', 'tactics');
                return;
            }
        }
        if (storedSpells.find(spell => spell.name === name).somatic === true){
            if (handsRestrainedBox.checked){
                showToast('You cannot cast spells with somatic components because your hands are restrained', 'tactics');
                return;
            }
        }

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
        const level5slot2 = document.getElementById('level5slot2');
        const level6slot1 = document.getElementById('level6slot1');


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
            else if (level5slot2.value === ""){
                level5slot2.value = "🔲";
                storedSlots.level5slot2 = "🔲";
            }
            else {
                showToast('All Level 5 spell slots are depleted', 'error');
                return;
            }
        }
        else if (level == 6){
            if (level6slot1.value === ""){
                level6slot1.value = "🔲";
                storedSlots.level6slot1 = "🔲";
            }
            else {
                showToast('All Level 6 spell slots are depleted', 'error');
                return;
            }
        }

        if (spellToUpdate.concentration === true) {
            // Deactivate Concentration spell effects
            const guidanceTracker = document.getElementById('guidance-tracker');
            guidanceTracker.value = "";
    
            const blessTracker = document.getElementById('bless-tracker');
            blessTracker.value = "";

            removeNonDamageEffects('greaterinvisibility');
            removeNonDamageEffects('summoncelestial');

            // First deactivate all concentration spells
            storedSpells = storedSpells.map(spell => {
                if (spell.concentration && spell.active) {
                    return { ...spell, active: false };
                }
                return spell;
            });
        }

        applyNonDamageEffects(name);

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

        if (name==="deathward"){
            const deathwardTracker = document.getElementById('deathward-tracker');
            const choice = parseInt(prompt("Enter 1 if self or 2 if other"));
            if (choice==1)
                deathwardTracker.value = "🔲";
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

    function addRingCastEvents() {
        const ringSpellsStatus = JSON.parse(localStorage.getItem("ringSpellsStatus")) ?? [];

        ringSpellsStatus.forEach(spell => {
            const castButton = document.getElementById(`${spell.id}-stored-cast`);
            const endButton = document.getElementById(`${spell.id}-stored-end`);
            if (castButton && !castButton.dataset.listenerAttached) {
                castButton.addEventListener('click', () => ringSpellCast(spell.name, spell.id));
                castButton.dataset.listenerAttached = "true";
            }
            if (endButton && !endButton.dataset.listenerAttached) {
                endButton.addEventListener('click', () => ringSpellCease(spell.name, spell.id));
                endButton.dataset.listenerAttached = "true";
            }
        });
    }

    function addFreeSlotsEvents() {
        const freeLevel1Slot = document.querySelector('#freeslotlevel1');
        const freeLevel2Slot = document.querySelector('#freeslotlevel2');
        const freeLevel3Slot = document.querySelector('#freeslotlevel3');
        const freeLevel4Slot = document.querySelector('#freeslotlevel4');
        const freeLevel5Slot = document.querySelector('#freeslotlevel5');
        const freeLevel6Slot = document.querySelector('#freeslotlevel6');

        freeLevel1Slot.addEventListener('click', () => emptySlot(1));
        freeLevel2Slot.addEventListener('click', () => emptySlot(2));
        freeLevel3Slot.addEventListener('click', () => emptySlot(3));
        freeLevel4Slot.addEventListener('click', () => emptySlot(4));
        freeLevel5Slot.addEventListener('click', () => emptySlot(5));
        freeLevel6Slot.addEventListener('click', () => emptySlot(6));
    }

    const storedSpellsStatus = JSON.parse(localStorage.getItem("spells"));
    const ringSpellsStatus = JSON.parse(localStorage.getItem("ringSpellsStatus")) ?? [];
    updateSpellStatus(storedSpellsStatus);
    addFreeSlotsEvents()
    addCastEvents();
    renderRingTable();
    addRingEffectsEvents();
    addRingCastEvents();
    updateRingSpellStatus(ringSpellsStatus);
});
