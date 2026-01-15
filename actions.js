import { spellCease, removeNonDamageEffects, updateSpellStatus } from './spells.js';

const style = document.createElement('style');
style.textContent = `
    .condition-item {
        position: relative;
    }
    
    .tooltip {
        visibility: hidden;
        position: absolute;
        background-color: #f5e6d3;
        color: #3a2a1a;
        padding: 12px 16px;
        border-radius: 8px;
        border: 2px solid #c17a3a;
        font-size: 13px;
        line-height: 1.6;
        max-width: 280px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.2s, visibility 0.2s;
        pointer-events: none;
        white-space: normal;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        
        /* Position below the element */
        top: 100%;
        left: 0;
        margin-top: 8px;
    }
    
    .tooltip p {
        margin: 0 0 8px 0;
    }
    
    .tooltip p:last-child {
        margin-bottom: 0;
    }
    
    .tooltip.show {
        visibility: visible;
        opacity: 1;
    }
    
    /* Arrow */
    .tooltip::before {
        content: '';
        position: absolute;
        bottom: 100%;
        left: 20px;
        border: 6px solid transparent;
        border-bottom-color: #c17a3a;
    }
`;
document.head.appendChild(style);

const conditionDescriptions = {
    blinded: "<p>Can't see and automatically fails any ability check that requires sight.</p><p>Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.</p>",
    charmed: "<p>Can't attack the charmer or target the charmer with harmful abilities or magical effects.</p><p>The charmer has advantage on any ability check to interact socially with the creature.</p>",
    deafened: "<p>Can't hear and automatically fails any ability check that requires hearing.</p>",
    frightened: "<p>Has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.</p><p>The creature can't willingly move closer to the source of its fear.</p>",
    grappled: "<p>Speed becomes 0, and can't benefit from any bonus to speed.</p><p>The condition ends if the grappler is incapacitated.</p>",
    incapacitated: "<p>Can't take actions or reactions.</p>",
    invisible: "<p>Impossible to see without magic or special sense.</p><p>Attack rolls against the creature have disadvantage, and the creature's attack rolls have advantage.</p>",
    paralyzed: "<p>Is incapacitated and can't move or speak. Automatically fails Strength and Dexterity saving throws.</p><p>Attack rolls against the creature have advantage.</p><p>Any attack that hits is a critical hit if the attacker is within 5 feet.</p>",
    petrified: "<p>Transformed into stone. Is incapacitated, can't move or speak, and is unaware of surroundings.</p><p>Has resistance to all damage and is immune to poison and disease.</p>",
    poisoned: "<p>Has disadvantage on attack rolls and ability checks.</p>",
    prone: "<p>Only movement option is to crawl. Has disadvantage on attack rolls.</p><p>Attack rolls against the creature have advantage if attacker is within 5 feet.</p>",
    restrained: "<p>Speed becomes 0. Attack rolls against the creature have advantage, and the creature's attack rolls have disadvantage.</p><p>Has disadvantage on Dexterity saving throws.</p>",
    stunned: "<p>Is incapacitated, can't move, and can speak only falteringly.</p><p>Automatically fails Strength and Dexterity saving throws. Attack rolls against the creature have advantage.</p>",
    unconscious: "<p>Is incapacitated, can't move or speak, and is unaware of surroundings. Drops whatever it's holding and falls prone.</p><p>Automatically fails Strength and Dexterity saving throws.</p><p>Any attack that hits is a critical hit if attacker is within 5 feet.</p>"
};

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

export function loadSavedConditions() {
    const savedConditions = localStorage.getItem('conditions');
    return savedConditions ? JSON.parse(savedConditions) : {};
}

export function saveConditions(condition, isActive) {
    let savedConditions = loadSavedConditions();
    savedConditions[condition] = isActive;
    localStorage.setItem('conditions', JSON.stringify(savedConditions));
}

export function toggleCondition(conditionName) {
    const checkbox = document.getElementById(`toggle-${conditionName}`);
    const newState = !checkbox.checked;
    checkbox.checked = newState;
    saveConditions(conditionName, newState);
}

export function loadSavedSituations() {
    const savedSituations = localStorage.getItem('situations');
    return savedSituations ? JSON.parse(savedSituations) : {};
}

export function saveSituations(situation, isActive) {
    let savedSituations = loadSavedSituations();
    savedSituations[situation] = isActive;
    localStorage.setItem('situations', JSON.stringify(savedSituations));
}

export function toggleSituation(situationName) {
    const checkbox = document.getElementById(`toggle-${situationName}`);
    const newState = !checkbox.checked;
    checkbox.checked = newState;
    saveSituations(situationName, newState);
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

    const conditions = [
        'blinded',
        'charmed',
        'deafened',
        'frightened',
        'grappled',
        'incapacitated',
        'invisible',
        'paralyzed',
        'petrified',
        'poisoned',
        'prone',
        'restrained',
        'stunned',
        'unconscious'
    ];

    const situations = [
        'flank',
        'hidden',
        '1/2 cover',
        '3/4 cover',
        'total cover',
        'range attack 5ft',
        'enemy blinded',
        'enemy invisible',
        'enemy paralyzed',
        'enemy petrified',
        'enemy prone 5ft',
        'enemy prone >5ft',
        'enemy restrained',
        'enemy stunned',
        'enemy unconscious',
        'enemy hidden',
        'hands restrained',
        'silenced'
    ]; 

    const advantageEnum = {
        'normal': 0,
        'advantage': 1,
        'disadvantage': 2
    }
    
    const conditionsContainer = document.getElementById('conditions-container');

    const savedConditions = loadSavedConditions();
        
    conditions.forEach(condition => {
        const conditionItem = document.createElement('div');
        conditionItem.className = 'condition-item';
        
        const conditionName = document.createElement('span');
        conditionName.className = 'condition-name';
        conditionName.textContent = condition;
        conditionName.setAttribute('data-tooltip', conditionDescriptions[condition]);
        
        const label = document.createElement('label');
        label.className = 'switch';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `toggle-${condition}`;

        if (savedConditions[condition]) {
            input.checked = true;
        }

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = conditionDescriptions[condition];
        
        // Add event listeners
        conditionName.addEventListener('mouseenter', () => {
            tooltip.classList.add('show');
        });
        
        conditionName.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        label.appendChild(input);
        label.appendChild(slider);
        
        conditionItem.appendChild(conditionName);
        conditionItem.appendChild(tooltip);
        conditionItem.appendChild(label);
        
        conditionsContainer.appendChild(conditionItem);
    
        input.addEventListener('change', function(event) {
            const lowerName = this.id.replace('toggle-', '');
            const conditionName = lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
            const paralyzedBox = document.getElementById('toggle-paralyzed');
            const petrifiedBox = document.getElementById('toggle-petrified');
            const stunnedBox = document.getElementById('toggle-stunned');
            const unconsciousBox = document.getElementById('toggle-unconscious');

            saveConditions(lowerName, event.target.checked);

            if (event.target.checked) {
                showToast(`${conditionName}`,'info');
                if (conditionName === 'Paralyzed' || conditionName === 'Stunned' || conditionName === 'Petrified') {
                    const incapacitatedBox = document.getElementById('toggle-incapacitated');
                    if (!incapacitatedBox.checked){
                        toggleCondition('incapacitated');
                    }
                }
    
                if (conditionName === 'Unconscious') {
                    const incapacitatedBox = document.getElementById('toggle-incapacitated');
                    const proneBox = document.getElementById('toggle-prone');
                    if (!incapacitatedBox.checked){
                        toggleCondition('incapacitated');
                    }
                    if (!proneBox.checked){
                        toggleCondition('prone');
                    }
                }
            } else {
                showToast(`${conditionName} Off`,'info');
                if (conditionName === 'Paralyzed' || conditionName === 'Stunned' || conditionName === 'Petrified' || conditionName === 'Unconscious') {
                    const incapacitatedBox = document.getElementById('toggle-incapacitated');
                    if (incapacitatedBox.checked && !paralyzedBox.checked && !petrifiedBox.checked
                        && !stunnedBox.checked && !unconsciousBox.checked)
                    {
                        toggleCondition('incapacitated');
                    }
                }
            }
        });

    });

    const exhaustionItem = document.createElement('div');
    exhaustionItem.className = 'condition-item';
    
    const exhaustionName = document.createElement('span');
    exhaustionName.className = 'condition-name';
    exhaustionName.textContent = 'exhaustion';
    
    const exhaustionControl = document.createElement('div');
    exhaustionControl.className = 'exhaustion-control';
    
    const inputContainer = document.createElement('div');
    inputContainer.className = 'exhaustion-input-container';
    
    const exhaustionInput = document.createElement('input');
    exhaustionInput.type = 'number';
    exhaustionInput.id = 'exhaustion-level';
    exhaustionInput.className = 'exhaustion-input';
    exhaustionInput.min = 0;
    exhaustionInput.max = 6;
    exhaustionInput.step = 1;
    exhaustionInput.value = savedConditions['exhaustion'] || 0;
    
    inputContainer.appendChild(exhaustionInput);
    exhaustionControl.appendChild(inputContainer);
    
    exhaustionItem.appendChild(exhaustionName);
    exhaustionItem.appendChild(exhaustionControl);
    
    conditionsContainer.appendChild(exhaustionItem);
    
    // Handle exhaustion level changes
    exhaustionInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        
        // Validate input range
        if (isNaN(value) || value < 0) {
            value = 0;
        } else if (value > 6) {
            value = 6;
        }
        
        this.value = value;
        
        // Save to localStorage
        saveConditions('exhaustion', value);
        
        showToast(`Exhaustion Level: ${value}`, 'info');

        if (value === 6)
            showToast('You are Dead!', 'error');
    });

    const situationsContainer = document.getElementById('situations-container');

    const savedSituations = loadSavedSituations();
        
    situations.forEach(situation => {
        const situationItem = document.createElement('div');
        situationItem.className = 'situation-item';
        
        const situationName = document.createElement('span');
        situationName.className = 'situation-name';
        situationName.textContent = situation;
        
        const label = document.createElement('label');
        label.className = 'switch';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = `toggle-${situation}`;
        input.style = "margin-left:100px";

        if (savedSituations[situation]) {
            input.checked = true;
        }
        
        const slider = document.createElement('span');
        slider.className = 'slider';
        
        label.appendChild(input);
        label.appendChild(slider);
        
        situationItem.appendChild(situationName);
        situationItem.appendChild(label);
        
        situationsContainer.appendChild(situationItem);
    
        input.addEventListener('change', function(event) {
            const lowerName = this.id.replace('toggle-', '');
            const situationName = lowerName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            const critTracker = document.getElementById('crit');
            const enemyParalyzedBox = document.getElementById('toggle-enemy paralyzed');
            const enemyUnconsciousBox = document.getElementById('toggle-enemy unconscious');

            saveSituations(lowerName, event.target.checked);

            if (event.target.checked) {
                showToast(`${situationName}`,'tactics');
                if (situationName === "Enemy Paralyzed" || situationName === "Enemy Unconscious"){
                    critTracker.value = "🔲";
                }
            } else {
                showToast(`${situationName} Off`,'tactics');
                if (situationName === "Enemy Paralyzed" || situationName === "Enemy Unconscious"){
                    if (!enemyParalyzedBox.checked && !enemyUnconsciousBox.checked){
                        critTracker.value = "";
                    }
                }
            }
        });

    });

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
            showToast(`Temporary HP gained: ${result}`,'twilight');
            if (result > tempHP){
                tempHP = result;
                tempHPInput.value = tempHP;
                charStats.tempHP = tempHP;
                localStorage.setItem("dndCharacterStats", JSON.stringify(charStats));
            }
        } else {
            const roll = Math.floor(Math.random() * 6) + 1;
            const result = roll + level;
            showToast(`Temporary HP gained: ${result}`,'twilight');
        }
    }

    function initiative() {
        const initMod = parseInt(document.getElementById('initiative').value);
        const d20Roll1 = Math.floor(Math.random() * 20) + 1;
        const d20Roll2 = Math.floor(Math.random() * 20) + 1;
        const rollResult = Math.max(d20Roll1, d20Roll2);
        const result = rollResult + initMod;
        const initString = initMod == 0 ? "" : ` + ${initMod}`;
        showToast(`Initiative: 1d20(Adv)${initString} = ${result}`,'twilight');
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
        const petrifiedBox = document.getElementById('toggle-petrified');
        const deathwardTracker = document.getElementById('deathward-tracker');
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

        if (damageType == 6 && petrifiedBox.checked){
            showToast("You are immune to poison because you are petrified",'info');
            return;
        } else if (petrifiedBox.checked){
            damage /= 2;
        } else {
            if (damageTypeResistance)
                damage /= 2;
    
            if (damageTypeVulnerability)
                damage *= 2;
        }

        if (tempHP == 0){
            currentHP -= damage;
            if (currentHP <= 0){
                if (deathwardTracker.value !== ""){
                    currentHP = 1;
                    spellCease('deathward',level);
                } else {
                    currentHP = 0;
                }
            }
            currentHPInput.value = currentHP;
        } else{
            if (tempHP - damage >= 0){
                tempHP -= damage;
                tempHPInput.value = tempHP;
            } else {
                currentHP -= (damage - tempHP);
                if (currentHP <= 0){
                    if (deathwardTracker.value !== ""){
                        currentHP = 1;
                        spellCease('deathward',level);
                    } else {
                        currentHP = 0;
                    }
                }
                tempHP = 0;
                tempHPInput.value = tempHP;
                currentHPInput.value = currentHP;
            }
        }
        savedStats['curHP'] = currentHP;
        savedStats['tempHP'] = tempHP;
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
        const advantageInput = document.getElementById('adv');
        const disadvantageInput = document.getElementById('dis');
        const blessTracker = document.getElementById('bless-tracker');
        const exhaustionInput = document.getElementById('exhaustion-level');
        const guidingBoltTracker = document.getElementById('guidingbolt-tracker');
        const flankBox = document.getElementById('toggle-flank');
        const range5ftBox = document.getElementById('toggle-range attack 5ft');
        const hiddenBox = document.getElementById('toggle-hidden');
        const enemyBlindedBox = document.getElementById('toggle-enemy blinded');
        const enemyInvisibleBox = document.getElementById('toggle-enemy invisible');
        const enemyParalyzedBox = document.getElementById('toggle-enemy paralyzed');
        const enemyRetrifiedBox = document.getElementById('toggle-enemy petrified');
        const enemyProne5ftBox = document.getElementById('toggle-enemy prone 5ft');
        const enemyProneBeyond5ftBox = document.getElementById('toggle-enemy prone >5ft');
        const enemyRestrainedBox = document.getElementById('toggle-enemy restrained');
        const enemyStunnedBox = document.getElementById('toggle-enemy stunned');
        const enemyUnconsciousBox = document.getElementById('toggle-enemy unconscious');
        const enemyHiddenBox = document.getElementById('toggle-enemy hidden');
        let roll = "";
        let blessRoll = 0;
        let advString = "";
        let blessString1 = "";
        let blessString2 = "";
        let advantageStatus = advantageEnum.normal;
        let adv = false;
        let dis = false;
        const conditionBoxesMap = {};

        conditions.forEach(condition => {
            const conditionBox = document.getElementById(`toggle-${condition}`);
            conditionBoxesMap[condition] = conditionBox;
        })

        if (advantageInput.value != "" && disadvantageInput.value === ""){
            advantageStatus = advantageEnum.advantage
        } else if (disadvantageInput.value != "" && advantageInput.value === ""){
            advantageStatus = advantageEnum.disadvantage;
        } else if (advantageInput.value === "" && disadvantageInput.value === ""){
            if (conditionBoxesMap['invisible'].checked || guidingBoltTracker.value != "" || flankBox.checked
                || hiddenBox.checked || enemyBlindedBox.checked || enemyParalyzedBox.checked || enemyRetrifiedBox.checked
                || enemyProne5ftBox.checked || enemyRestrainedBox.checked || enemyStunnedBox.checked || enemyUnconsciousBox.checked
            ){
                adv = true;
            }
            if (conditionBoxesMap['blinded'].checked || conditionBoxesMap['prone'].checked
                || conditionBoxesMap['restrained'].checked || conditionBoxesMap['poisoned'].checked
                || conditionBoxesMap['frightened'].checked || exhaustionInput.value >= 3
                || range5ftBox.checked || enemyInvisibleBox.checked || enemyProneBeyond5ftBox.checked || enemyHiddenBox.checked
            ){
                dis = true;
            }

            if (adv && !dis){
                advantageStatus = advantageEnum.advantage;
            } else if (!adv && dis){
                advantageStatus = advantageEnum.disadvantage;
            }
        }

        if (advantageStatus === advantageEnum.normal) {
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantageStatus === advantageEnum.advantage) {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (advantageStatus === advantageEnum.disadvantage) {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.min(roll1, roll2);
            advString = "(Dis)";
        }

        if (blessTracker.value != ""){
            blessRoll = Math.floor(Math.random() * 4) + 1;
        }
            
        result = roll + plus + blessRoll;

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

        if ((advantageStatus === advantageEnum.normal)){
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
        const critical = document.getElementById('crit');
        let crit = 1;

        if (critical.value !== ""){
            crit = 2;
        }
        else if (spellAttackTracker.value !== ""){
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
        const critical = document.getElementById('crit');
        const charStats = JSON.parse(localStorage.getItem('dndCharacterStats'));
        const tempHPInput = document.getElementById('temp-hp');
        let crit = 1;

        if (critical.value !== ""){
            crit = 2;
        }
        else if (spellAttackTracker.value !== ""){
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
        const critical = document.getElementById('crit');

        let crit = 1;

        if (critical.value !== ""){
            crit = 2;
        } else if (attackTracker.value !== "")
        {
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
        const incapacitatedBox = document.getElementById('toggle-incapacitated');

        if (incapacitatedBox.checked){
            showToast("You are incapacitated!",'info');
            return;
        }

        attackTracker.value = "🔲";

        const roll = d20Throw("Attack",attackMod);
        if (roll == 20){
            attackCrit.value = "🔲";
            showToast("Critical Hit!",'success');
        }
        else
            attackCrit.value = "";
    }

    function spellAttack() {
        const spellAttackMod = parseInt(document.getElementById('spellattacktotal').value);
        const spellAttackTracker = document.getElementById('spell-attack-tracker');
        const spellAttackCrit = document.getElementById('spell-attack-crit');
        const incapacitatedBox = document.getElementById('toggle-incapacitated');

        if (incapacitatedBox.checked){
            showToast("You are incapacitated!",'info');
            return;
        }

        spellAttackTracker.value = "🔲";

        const roll = d20Throw("Spell Attack",spellAttackMod);
        if (roll == 20){
            spellAttackCrit.value = "🔲";
            showToast("Critical Hit!",'success');
        } else {
            spellAttackCrit.value = "";
        }

    }

    function abilityCheck(ability){
        const abilityLower = ability.toLowerCase();
        const abilityMod = parseInt(document.getElementById(`${abilityLower}-modifier`).value);
        const modifiedAbilityMod = Math.abs(abilityMod);
        const advantageInput = document.getElementById('adv');
        const disadvantageInput = document.getElementById('dis');
        const guidanceTracker = document.getElementById('guidance-tracker');
        const exhaustionInput = document.getElementById('exhaustion-level');
        let roll = "";
        let advString = "";
        let d4String1 = "";
        let d4String2 = "";
        let d4roll = 0;
        let advantageStatus = advantageEnum.normal;
        const conditionBoxesMap = {};

        conditions.forEach(condition => {
            const conditionBox = document.getElementById(`toggle-${condition}`);
            conditionBoxesMap[condition] = conditionBox;
        })
        

        if (advantageInput.value != "" && disadvantageInput.value === ""){
            advantageStatus = advantageEnum.advantage
        } else if (disadvantageInput.value != "" && advantageInput.value === ""){
            advantageStatus = advantageEnum.disadvantage;
        } else if (advantageInput.value === "" && disadvantageInput.value === ""){
            if (conditionBoxesMap['frightened'].checked || conditionBoxesMap['poisoned'].checked || exhaustionInput.value >= 1){
                advantageStatus = advantageEnum.disadvantage;
            }
        }

        if (advantageStatus === advantageEnum.normal) {
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantageStatus === advantageEnum.advantage) {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (advantageStatus === advantageEnum.disadvantage) {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.min(roll1, roll2);
            advString = "(Dis)";
        }

        if (guidanceTracker.value != ""){
            d4roll = Math.floor(Math.random() * 4) + 1;
            d4String1 = "+1d4";
            d4String2 = ` + ${d4roll}`;
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

        if ((advantageStatus === advantageEnum.normal)){
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
        const advantageInput = document.getElementById('adv');
        const disadvantageInput = document.getElementById('dis');
        const exhaustionInput = document.getElementById('exhaustion-level');
        const halfCoverBox = document.getElementById('toggle-1/2 cover');
        const threeQuartersCoverBox = document.getElementById('toggle-3/4 cover');
        let coverBonus = 0;
        let coverString1 = "";
        let coverString2 = "";
        let roll = "";
        let advString = ""
        let blessRoll = 0;
        let blessString1 = "";
        let blessString2 = "";
        let advantageStatus = advantageEnum.normal;
        const conditionBoxesMap = {};

        conditions.forEach(condition => {
            const conditionBox = document.getElementById(`toggle-${condition}`);
            conditionBoxesMap[condition] = conditionBox;
        })

        if ((conditionBoxesMap['paralyzed'].checked || conditionBoxesMap['petrified'].checked || conditionBoxesMap['stunned'].checked || conditionBoxesMap['unconscious'].checked) 
            && (ability == "Strength" || ability == "Dexterity")){
            if (conditionBoxesMap['paralyzed'].checked && !conditionBoxesMap['petrified'].checked && !conditionBoxesMap['stunned'].checked && !conditionBoxesMap['unconscious'].checked){
                showToast(`${ability} saves fail because you are paralyzed`, 'info');
                return;
            }
            else if (!conditionBoxesMap['paralyzed'].checked && conditionBoxesMap['petrified'].checked && !conditionBoxesMap['stunned'].checked && !conditionBoxesMap['unconscious'].checked){
                showToast(`${ability} saves fail because you are petrified`, 'info');
                return;
            }
            else if (!conditionBoxesMap['paralyzed'].checked && !conditionBoxesMap['petrified'].checked && conditionBoxesMap['stunned'].checked && !conditionBoxesMap['unconscious'].checked){
                showToast(`${ability} saves fail because you are stunned`, 'info');
                return;
            }
            else if (!conditionBoxesMap['paralyzed'].checked && !conditionBoxesMap['petrified'].checked && !conditionBoxesMap['stunned'].checked && conditionBoxesMap['unconscious'].checked){
                showToast(`${ability} saves fail because you are unconscious`, 'info');
                return;
            }
            else {
                showToast(`You automatically fail ${ability} saves`, 'info');
                return;
            }
        }

        if (advantageInput.value != "" && disadvantageInput.value === ""){
            advantageStatus = advantageEnum.advantage
        } else if (disadvantageInput.value != "" && advantageInput.value === ""){
            advantageStatus = advantageEnum.disadvantage;
        } else if (advantageInput.value === "" && disadvantageInput.value === ""){
            if (conditionBoxesMap['restrained'].checked || exhaustionInput.value >= 3){
                advantageStatus = advantageEnum.disadvantage;
            }
        }

        if (advantageStatus === advantageEnum.normal) {
            roll = Math.floor(Math.random() * 20) + 1;
        } else if (advantageStatus === advantageEnum.advantage) {
            const roll1 = Math.floor(Math.random() * 20) + 1;
            const roll2 = Math.floor(Math.random() * 20) + 1;
            roll = Math.max(roll1, roll2);
            advString = "(Adv)";
        } else if (advantageStatus === advantageEnum.disadvantage) {
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

        if (ability === "Dexterity"){
            if (threeQuartersCoverBox.checked){
                coverBonus += 5;
                coverString1 = `+${coverBonus}(Three Quarters Cover Bonus)`;
                coverString2 = ` + ${coverBonus}`;
            } else if (halfCoverBox.checked){
                coverBonus += 2;
                coverString1 = `+${coverBonus}(Half Cover Bonus)`
                coverString2 = ` + ${coverBonus}`;
            }
        }

        const result = roll + abilityMod + blessRoll + coverBonus;

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
            showToast(`${ability} Save Check${advString}: 1d20${abilityModStr1}${blessString1}${coverString1} = ${result}`, 'success');
        else
            showToast(`${ability} Save Check${advString}: 1d20${abilityModStr1}${blessString1}${coverString1} = ${roll}${abilityModStr2}${blessString2}${coverString2} = ${result}`, 'success');

        if (advantageStatus === advantageEnum.normal){
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

    function toggleCritical(){
        const critInput = document.getElementById('crit');
        const attackTracker = document.getElementById('attack-tracker');
        const attackCrit = document.getElementById('attack-crit');
        if (critInput.value == ""){
            critInput.value = "🔲";
            attackTracker.value = "";
            attackCrit.value = "";
        } else
            critInput.value = "";
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
    const critButton = document.getElementById('crit-button');
    critButton.addEventListener('click', () => toggleCritical());

    addActionEvents();
    addSkillEvents();

    const canvas = document.getElementById("diceCanvas");
    const ctx = canvas.getContext("2d");
    const diceImages = [
      { name: "d4", src: "images/d4.png", value: 4},
      { name: "d6", src: "images/d6.png", value: 6},
      { name: "d8", src: "images/d8.png", value: 8},
      { name: "d10", src: "images/d10.png", value: 10 },
      { name: "d12", src: "images/d12.png", value: 12 },
      { name: "d20", src: "images/d20.png", value: 20 },
      { name: "d100", src: "images/d100.png", value: 100 },
    ];
    const dice = [];
    const spacing = 10;
    const dicePerRow = 2;
    // Using the original size of 55x55 instead of stretching to 85x85
    const dieSize = 55;
    // Amount to grow when hovering
    const hoverGrowth = 7;
    // Tracking which die is being hovered
    let hoveredDieIndex = -1;
    let loaded = 0;
    
    diceImages.forEach((dieInfo, i) => {
      const img = new Image();
      img.src = dieInfo.src;
      img.onload = () => {
        const col = i % dicePerRow;
        const row = Math.floor(i / dicePerRow);
        const x = col * (dieSize + spacing) + spacing;
        const y = row * (dieSize + spacing) + spacing;
        dice.push({
          name: dieInfo.name,
          img,
          x,
          y,
          w: dieSize,
          h: dieSize,
        });
        loaded++;
        if (loaded === diceImages.length) {
          const totalRows = Math.ceil(dice.length / dicePerRow);
          canvas.width = dicePerRow * (dieSize + spacing) + spacing;
          canvas.height = totalRows * (dieSize + spacing) + spacing;
          drawDice();
        }
      };
      img.onerror = () => {
        console.error("Failed to load image:", dieInfo.src);
      };
    });
    
    function drawDice() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set high quality rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        dice.forEach((die, index) => {
          ctx.save();
          
          // If this die is hovered, make it bigger and add the shadow effect
          if (index === hoveredDieIndex) {
            // Add the shadow effect
            ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
            ctx.shadowBlur = 15;
            
            const growAmount = hoverGrowth;
            const newWidth = die.w + growAmount;
            const newHeight = die.h + growAmount;
            
            // Draw directly with better scaling
            ctx.drawImage(
              die.img, 
              die.x - growAmount/2, 
              die.y - growAmount/2,
              newWidth,
              newHeight
            );
          } else {
            // Draw normal size
            ctx.drawImage(die.img, die.x, die.y, die.w, die.h);
          }
          
          ctx.restore();
        });
    }
    
    // Function to get canvas coordinates from mouse position
    function getCanvasCoordinates(e) {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }
    
    // Check if a point is inside a die
    function isPointInDie(x, y, die) {
      return (
        x >= die.x &&
        x < die.x + die.w &&
        y >= die.y &&
        y < die.y + die.h
      );
    }
    
    // Handle mouse movement for hover effects
    canvas.addEventListener("mousemove", (e) => {
      const coords = getCanvasCoordinates(e);
      let foundHover = false;
      
      for (let i = 0; i < dice.length; i++) {
        if (isPointInDie(coords.x, coords.y, dice[i])) {
          if (hoveredDieIndex !== i) {
            hoveredDieIndex = i;
            canvas.style.cursor = "pointer";
            drawDice();
            const sound = new Audio('sounds/whoosh.mp3');
            sound.volume = 0.9;
            sound.play();
          }
          foundHover = true;
          break;
        }
      }
      
      // If we're not hovering over any die anymore
      if (!foundHover && hoveredDieIndex !== -1) {
        hoveredDieIndex = -1;
        canvas.style.cursor = "default";
        drawDice();
      }
    });
    
    // Handle mouse leaving the canvas
    canvas.addEventListener("mouseleave", () => {
      if (hoveredDieIndex !== -1) {
        hoveredDieIndex = -1;
        canvas.style.cursor = "default";
        drawDice();
      }
    });
    
    // Handle clicks
    canvas.addEventListener("click", (e) => {
      const coords = getCanvasCoordinates(e);
      
      for (let i = 0; i < dice.length; i++) {
        if (isPointInDie(coords.x, coords.y, dice[i])) {
            const diceValue = parseInt(diceImages.find(x => x.name == dice[i].name).value);
            let inputValue = document.getElementById('countInput').value;
            let count;
            let result = 0;
            const rolls = [];

            if (!isNaN(inputValue) && inputValue !== null && inputValue.trim() !== "" && inputValue != 0){
                count = parseInt(inputValue);
            } else {
                showToast("Invalid data in dice count",'error');
                return;
            }

            if (diceValue === 100 && count != 1){
                showToast("You can only throw one die for percentage", 'error');
                return;
            }

            if (diceValue === 20 && count > 2){
                showToast("You cannot throw more than two d20 dice", 'error');
                return;
            }

            if (diceValue === 20 && count == 2){
                let choice = prompt("Choose 1 to throw with Advantage or 2 to throw with Disadvantage");
                const roll1 = Math.floor(Math.random() * diceValue) + 1;
                const roll2 = Math.floor(Math.random() * diceValue) + 1;
                const sound = new Audio('sounds/2dice.mp3');
                switch (choice){
                    case "1":
                        const maxValue = Math.max(roll1,roll2);
                        showToast(`2d20(Adv) = Max(${roll1},${roll2}) = ${maxValue}`, 'dice');
                        sound.play();
                        break;
                    case "2":
                        const minValue = Math.min(roll1,roll2);
                        showToast(`2d20(Dis) = Min(${roll1},${roll2}) = ${minValue}`, 'dice');
                        sound.play();
                        break;
                    default:
                        showToast('Wrong choice', 'error');
                        break;
                }
                return;
            }

            if (count == 1){
                const roll = Math.floor(Math.random() * diceValue) + 1;
                showToast(`${count}d${diceValue} = ${roll}`, 'dice');
                const sound = new Audio('sounds/die.mp3');
                sound.play();
            } else {
                for (let i = 0; i < count; i++) {
                    const roll = Math.floor(Math.random() * diceValue) + 1;
                    result += roll;
                    rolls.push(roll);
                }
                const rollsString = rolls.join(' + ');
                showToast(`${count}d${diceValue} = ${rollsString} = ${result}`, 'dice');
                if (count == 2){
                    const sound = new Audio('sounds/2dice.mp3');
                    sound.play();
                } else {
                    const sound = new Audio('sounds/dice.mp3');
                    sound.play();
                }
            }
            
          return;
        }
      }
    });

    const input = document.getElementById("countInput");
    const btnPlus = document.getElementById("increase");
    const btnMinus = document.getElementById("decrease");

    btnPlus.addEventListener("click", () => {
    input.value = parseInt(input.value) + 1;
    });

    btnMinus.addEventListener("click", () => {
    input.value = Math.max(1, parseInt(input.value) - 1);
    });
});
