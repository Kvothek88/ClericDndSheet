const abilities = [
    { inputId: 'strength', modifierId: 'strength-modifier', key: 'STR' },
    { inputId: 'dexterity', modifierId: 'dexterity-modifier', key: 'DEX' },
    { inputId: 'constitution', modifierId: 'constitution-modifier', key: 'CON' },
    { inputId: 'intelligence', modifierId: 'intelligence-modifier', key: 'INT' },
    { inputId: 'wisdom', modifierId: 'wisdom-modifier', key: 'WIS' },
    { inputId: 'charisma', modifierId: 'charisma-modifier', key: 'CHA' }
];

const skillsWithKeyAbilities = [
    { name: "Acrobatics", keyAbility: "DEX" },
    { name: "Animal Handling", keyAbility: "WIS" },
    { name: "Arcana", keyAbility: "INT" },
    { name: "Athletics", keyAbility: "STR" },
    { name: "Deception", keyAbility: "CHA" },
    { name: "History", keyAbility: "INT" },
    { name: "Insight", keyAbility: "WIS" },
    { name: "Intimidation", keyAbility: "CHA" },
    { name: "Investigation", keyAbility: "INT" },
    { name: "Medicine", keyAbility: "WIS" },
    { name: "Nature", keyAbility: "INT" },
    { name: "Perception", keyAbility: "WIS" },
    { name: "Performance", keyAbility: "CHA" },
    { name: "Religion", keyAbility: "INT" },
    { name: "Sleight Of Hand", keyAbility: "DEX" },
    { name: "Stealth", keyAbility: "DEX" },
    { name: "Survival", keyAbility: "WIS" }
];

const armors = [
    { "name": "Padded Armor", "dex-mod": Number.MAX_SAFE_INTEGER, "armor": 1 },
    { "name": "Leather Armor", "dex-mod": Number.MAX_SAFE_INTEGER, "armor": 1 },
    { "name": "Studded Leather", "dex-mod": Number.MAX_SAFE_INTEGER, "armor": 2 },
    { "name": "Chain Shirt", "dex-mod": 2, "armor": 3 },
    { "name": "Hide Armor", "dex-mod": 2, "armor": 2 },
    { "name": "Scale Mail", "dex-mod": 2, "armor": 4 },
    { "name": "Chain Mail", "dex-mod": 0, "armor": 6 },
    { "name": "Breastplate", "dex-mod": 2, "armor": 4 },
    { "name": "Ring Plate", "dex-mod": 0, "armor": 4 },
    { "name": "Half Plate", "dex-mod": 2, "armor": 5 },
    { "name": "Splint Mail", "dex-mod": 0, "armor": 7 },
    { "name": "Plate Armor", "dex-mod": 0, "armor": 8 }
];

const shields = [
    { "name": "Shield", "armor": 2 },    
    { "name": "Shield + 1", "armor": 3 },
    { "name": "Shield + 2", "armor": 4 },
    { "name": "Shield + 3", "armor": 5 }
];

const magicalItems = [
  // Amulets
  { 
    "name": "Amulet of the Devout + 1", 
    "type": "amulet", 
    "spellSaveDC": 1,
    "spellAttack": 1,
    "other": [] 
  },
  { 
    "name": "Amulet of the Devout + 2", 
    "type": "amulet", 
    "spellSaveDC": 2,
    "spellAttack": 2,
    "other": [] 
  },
  { 
    "name": "Amulet of the Devout + 3", 
    "type": "amulet", 
    "spellSaveDC": 3,
    "spellAttack": 3,
    "other": [] 
  },
  
  // Cloaks
  { 
    "name": "Cloak of Protection", 
    "type": "cloak", 
    "spellSaveDC": 0,
    "spellAttack": 0,
    "other": ["savingThrows +1", "AC +1"] 
  },
  
  // Rings
  { 
    "name": "Ring of Spell Storing", 
    "type": "ring", 
    "spellSaveDC": 1,
    "spellAttack": 1,
    "other": [] 
  },
  
  // Headwear
  { 
    "name": "Helm of Brilliance", 
    "type": "headwear", 
    "spellSaveDC": 0,
    "spellAttack": 0,
    "other": ["Fire spells deal +1d6 damage"] 
  },
  { 
    "name": "Headband of Intellect", 
    "type": "headwear", 
    "spellSaveDC": 0,
    "spellAttack": 0,
    "other": [] 
  },
  
  // Weapons
  {
    "name": "Staff of Power", 
    "type": "weapon", 
    "spellSaveDC": 2,
    "spellAttack": 2,
    "other": ["Various spell abilities"] 
  }
];

function debounce(func, delay) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => func.apply(this, args),delay);
    }
}

const characterStats = {
    name: "Radni Embermane",
    dndClass: "Cleric",
    race:"Hill Dwarf",
    background:"Investigator",
    deity: "Selûne",
    domain: "Twilight",
    size: "Medium",
    alignment: "Neutral",
    proficiencies: {
        acrobatics: false,
        animalhandling: false,
        arcana: false,
        athletics: false,
        deception: false,
        history: false,
        insight: true,
        indimidation: false,
        investigation: false,
        medicine: true,
        nature: false,
        perception: true,
        performance: false,
        persuasion: false,
        religion: true,
        sleightofhand: false,
        stealth: false,
        survival: false,
        strength: false,
        dexterity: false,
        constitution: true,
        intelligence: false,
        wisdom: true,
        charisma: true,
    },
    strength: "15",
    dexterity: "12",
    constitution: "16",
    intelligence: "19",
    wisdom: "20",
    charisma: "8",
    weapon1: "Warhammer",
    weapon2: "",
    armor: "Plate Armor",
    shield: "Shield + 1",
    ring: "Ring of Spell Storing",
    amulet: "",
    cloak: "",
    headwear: "",
    armsgear: "",
    curHP: "84",
    tempHP: null,
    level: "9",
    speed: "25",
    hitDice: 9,
    celestialCurHP: null,
    celestialTempHP: null,
    celestialStrength: 16,
    celestialDexterity: 14,
    celestialConstitution: 16,
    celestialIntelligence: 10,
    celestialWisdom: 14,
    celestialCharisma: 16,
    celestialFly: "40ft",
    celestialSpeed: "30ft",
    celestialLevel: "5",
    defenderTracker: ""
  };

if (!localStorage.getItem("dndCharacterStats")) {
    localStorage.setItem("dndCharacterStats", JSON.stringify(characterStats));
}
console.log("test");
let isUpdatingProgrammatically = false;

function attachInputListener(inputElementId, statKey) {
    const inputElement = document.getElementById(inputElementId);

    // Load existing value for the stat and set it as the input's default value
    const savedStats = JSON.parse(localStorage.getItem("dndCharacterStats")) || {};
    if (savedStats[statKey] !== undefined) {
        inputElement.value = savedStats[statKey];
    }

    // Add input event listener with debounce
    inputElement.addEventListener(
        "input",
        debounce(function () {
            if (isUpdatingProgrammatically) return;

            const stats = JSON.parse(localStorage.getItem("dndCharacterStats")) || {};
            stats[statKey] = this.value; // Update the specific stat
            localStorage.setItem("dndCharacterStats", JSON.stringify(stats)); // Save updated stats
        }, 300)
    );
}

attachInputListener("character-name", "name");
attachInputListener("dndclass", "dndClass");
attachInputListener("race", "race");
attachInputListener("background", "background");
attachInputListener("religion", "deity");
attachInputListener("size", "size");
attachInputListener("alignment", "alignment");
attachInputListener("cur-hp", "curHP");
attachInputListener("temp-hp", "tempHP");
attachInputListener("level", "level");
attachInputListener("domain", "domain");
attachInputListener("strength", "strength");
attachInputListener("dexterity", "dexterity");
attachInputListener("constitution", "constitution");
attachInputListener("intelligence", "intelligence");
attachInputListener("wisdom", "wisdom");
attachInputListener("charisma", "charisma");
attachInputListener("speed", "speed");
attachInputListener("profbonus", "profbonus");
attachInputListener("celestial-cur-hp", "celestialCurHP");
attachInputListener("celestial-temp-hp", "celestialTempHP");
attachInputListener("celestial-strength", "celestialStrength");
attachInputListener("celestial-dexterity", "celestialDexterity");
attachInputListener("celestial-constitution", "celestialConstitution");
attachInputListener("celestial-intelligence", "celestialIntelligence");
attachInputListener("celestial-wisdom", "celestialWisdom");
attachInputListener("celestial-charisma", "celestialCharisma");
attachInputListener("celestial-fly", "celestialFly");
attachInputListener("celestial-speed", "celestialSpeed");
attachInputListener("celestial-level", "celestialLevel");
attachInputListener("defender-tracker", "defenderTracker");

const savedStats = JSON.parse(localStorage.getItem("dndCharacterStats"))

function updateDC() {
    let spellSaveDC = document.getElementById("spelldctotal").value;
    let dcElements = document.querySelectorAll(".saveDC");
    dcElements.forEach(element => {
        element.innerText = spellSaveDC;
    });
}

function updateSpellAttack() {
    let spellAttackModifier = document.getElementById("spellattacktotal").value;
    
    // Convert to number and add "+" if positive
    let formattedModifier = parseInt(spellAttackModifier, 10);
    if (!isNaN(formattedModifier) && formattedModifier >= 0) {
        formattedModifier = `+${formattedModifier}`;
    }

    let attackElements = document.querySelectorAll(".spellattack");
    attackElements.forEach(element => {
        element.innerText = formattedModifier;
    });
}

const updateAbilityModifiers = () =>
{
    abilities.forEach(ability =>
    {
        const abilityInput = document.getElementById(ability.inputId);
        const abilityModifier = document.getElementById(ability.modifierId);
        const abilityValue = parseInt(abilityInput.value, 10);
        if (!isNaN(abilityValue))
        {
            let modifier = Math.floor((abilityValue - 10) / 2);

            // Display + if the modifier is positive
            abilityModifier.value = modifier > 0 ? `+${modifier}` : `${modifier}`;
        } else
        {
            abilityModifier.value = '';
        }
    });
}

    // Update skill modifiers based on ability modifiers
const updateSkillModifiers = () =>
{
    skillsWithKeyAbilities.forEach(skill =>
    {
        const skillLower = skill.name.toLowerCase().trim().replace(/\s+/g, '');
        const skillAbilityInput = document.getElementById(`${skillLower}-key`);
        const keyAbility = abilities.find(ability => ability.key === skill.keyAbility).modifierId; // returns e.g "dexterity-modifier"
        const skillProfInput = document.getElementById(`${skillLower}-prof`);
        const skillItemInput = document.getElementById(`${skillLower}-item`);
        const skillTotalInput = document.getElementById(`${skillLower}-total`);
        const profBonus = document.getElementById("profbonus").value;

        const levelInput = document.getElementById("level");

        if (!skillAbilityInput || !skillProfInput || !skillItemInput)
        {
            console.error("One or more Skill related elements not found");
            return;
        }

        const skillName = skillLower;
        const skillItemValue = 0;
        const abilityModifierElement = document.getElementById(keyAbility);
        const abilityModifier = abilityModifierElement.value;

        skillAbilityInput.value = abilityModifier || '0';

        if (savedStats.proficiencies[skillName] == false) {
            skillProfInput.value = '0';
        } else {
            skillProfInput.value = profBonus || '0';
        }

        skillItemInput.value = skillItemValue || '0';
        skillTotalInput.value = parseInt(skillAbilityInput.value) + parseInt(skillProfInput.value) + parseInt(skillItemInput.value);
    });
};


const updateAttackModifiers = () =>
{
    const attackKeyInput = document.getElementById("attackability");
    const attackProfInput = document.getElementById("attackprof");
    const levelInput = document.getElementById("level");
    const attackItemInput = document.getElementById("attackitem");
    const attackTotalInput = document.getElementById("attacktotal");
    const profInput = document.getElementById("profbonus");
    const damageInput = document.getElementById("damage");
    const spells = JSON.parse(localStorage.getItem("spells"));
    const holyWeapon = spells.find(spell => spell.name == "holyweapon");

    if (!attackKeyInput || !attackProfInput || !attackTotalInput || !levelInput)
    {
        console.error("One or more Attack-related elements not found");
        return;
    }

    attackItemInput.value = 0;
    const level = levelInput.value;
    const strengthModifierElement = document.getElementById("strength-modifier");

    if (!strengthModifierElement)
    {
        console.error("Strength modifier element not found");
        return;
    }

    const abilityModifier = strengthModifierElement.value;
    const abilityModifierString = abilityModifier == 0 ? "+0" : `${abilityModifier}`;

    attackKeyInput.value = abilityModifier || '0';
    attackProfInput.value = profInput.value || '0';
    attackItemInput.value = 0;
    if (holyWeapon && holyWeapon.active == false)
        damageInput.value = "1d8" + abilityModifierString + "+1d8"
    else
        damageInput.value = "1d8" + abilityModifierString + "+3d8"

    attackTotalInput.value = parseInt(attackKeyInput.value) + parseInt(attackProfInput.value)  + parseInt(attackItemInput.value);
};

const calculateItemBonus = (characterStats, bonusType) => {
  let totalBonus = 0;
  
  // Check each equipment slot for items that might affect the specified bonus type
  const itemSlots = ['amulet', 'cloak', 'ring', 'headwear', 'weapon1', 'weapon2', 'armor', 'shield'];
  
  for (const slot of itemSlots) {
    const itemName = characterStats[slot];
    if (itemName && itemName !== "") {
      // Find the item in our magicalItems collection
      const item = magicalItems.find(item => item.name === itemName);
      if (item && item[bonusType] !== undefined) {
        totalBonus += item[bonusType];
      }
    }
  }
  
  return totalBonus;
};

const updateSpellAttackModifiers = () =>
{
    const spellAttackKeyInput = document.getElementById("spellattackability");
    const spellAttackProfInput = document.getElementById("spellattackprof");
    const levelInput = document.getElementById("level");
    const spellAttackItemInput = document.getElementById("spellattackitem");
    const spellAttackTotalInput = document.getElementById("spellattacktotal");
    const profInput = document.getElementById("profbonus");

    if (!spellAttackKeyInput || !spellAttackProfInput || !spellAttackTotalInput || !levelInput)
    {
        console.error("One or more Attack-related elements not found");
        return;
    }

    const itemBonus = calculateItemBonus(savedStats, "spellSaveDC");
    spellAttackItemInput.value = itemBonus;
    
    const wisdomModifierElement = document.getElementById("wisdom-modifier");

    if (!wisdomModifierElement)
    {
        console.error("Wisdom modifier element not found");
        return;
    }
    
    const abilityModifier = wisdomModifierElement.value;

    spellAttackKeyInput.value = abilityModifier || '0';
    spellAttackProfInput.value = profInput.value || '0';
    spellAttackItemInput.value = 0;
    spellAttackTotalInput.value = parseInt(spellAttackKeyInput.value) + parseInt(spellAttackProfInput.value)  + parseInt(spellAttackItemInput.value);
};

const updateSpellSaveDC = () =>
    {
        const spellDCKeyInput = document.getElementById("spelldcability");
        const spellDCProfInput = document.getElementById("spelldcprof");
        const levelInput = document.getElementById("level");
        const spellDCItemInput = document.getElementById("spelldcitem");
        const spellDCTotalInput = document.getElementById("spelldctotal");
        const profInput = document.getElementById("profbonus");

        if (!spellDCKeyInput || !spellDCProfInput || !spellDCTotalInput || !levelInput)
        {
            console.error("One or more Attack-related elements not found");
            return;
        }

          const itemBonus = calculateItemBonus(savedStats, "spellSaveDC");
          spellDCItemInput.value = itemBonus;
        
        const wisdomModifierElement = document.getElementById("wisdom-modifier");

        if (!wisdomModifierElement)
        {
            console.error("Wisdom modifier element not found");
            return;
        }

        const abilityModifier = wisdomModifierElement.value;

        spellDCKeyInput.value = abilityModifier || '0';
        spellDCProfInput.value = profInput.value || '0';
        spellDCItemInput.value = 0;
        spellDCTotalInput.value =8 + parseInt(spellDCKeyInput.value) + parseInt(spellDCProfInput.value)  + parseInt(spellDCItemInput.value);
    };

const updateInitiative = () => 
{
    const initiativeInput = document.getElementById("initiative");
    const dexModifier = document.getElementById("dexterity-modifier").value;

    initiativeInput.value = dexModifier;
}

const updateProfBonus = () => 
{
    const profBonusInput = document.getElementById("profbonus");
    const level = document.getElementById("level").value;

    profBonusInput.value = Math.ceil(level / 4) + 1;
}

const updateSavesModifiers = () =>
{
    abilities.forEach(ability => {
        const saveTotalInput = document.getElementById(ability.inputId + "savetotal");
        const saveKeyInput = document.getElementById(ability.inputId + "savekey");
        const saveProfInput = document.getElementById(ability.inputId + "saveprof");
        const saveItemInput = document.getElementById(ability.inputId + "saveitem");
        const saveAbilityModifier = document.getElementById(ability.modifierId).value || '0';
        const profBonus = document.getElementById("profbonus").value || '0';

        saveKeyInput.value = saveAbilityModifier;
        if (savedStats.proficiencies[ability.inputId] == false) {
            saveProfInput.value = '0';
        } else {
            saveProfInput.value = profBonus;
        }
        saveItemInput.value = '0';
        saveTotalInput.value = parseInt(saveKeyInput.value) + parseInt(saveProfInput.value) + parseInt(saveItemInput.value);
    });
}

const updateArmorModifiers = () =>
{
    const acAbilityInput = document.getElementById("ac-dex");
    const acArmorInput = document.getElementById("ac-armor");
    const acShieldInput = document.getElementById("ac-shield");
    const acItemInput = document.getElementById("ac-item");
    const acTotalInput = document.getElementById("ac-total");
    const acOtherInput = document.getElementById("ac-other");   
    const dexModifier = document.getElementById("dexterity-modifier").value;
    const spells = JSON.parse(localStorage.getItem("spells"));
    const shieldOfFaith = spells.find(spell => spell.name == "shieldoffaith");

    if (!acAbilityInput || !acArmorInput || !acShieldInput || !acItemInput)
    {
        console.error("One or more AC-related elements not found");
        return;
    }

    if (shieldOfFaith && shieldOfFaith.active == false)
        acOtherInput.value = "0";
    else
        acOtherInput.value = "2";

    acItemInput.value = "0";

    if (savedStats["armor"] == "") {
        acArmorInput.value = 0;
    } else {
        acArmorInput.value = armors.find(armor => armor.name == savedStats["armor"]).armor;
    }

    if (savedStats["shield"] == "") {
        acShieldInput.value = 0;
    } else {
        acShieldInput.value = shields.find(shield => shield.name == savedStats["shield"])?.armor ?? 2;
    }

    if (acArmorInput.value == 0)
        acAbilityInput.value = dexModifier;
    else
        acAbilityInput.value = Math.min(dexModifier, armors.find(armor => armor.name == savedStats["armor"])["dex-mod"]);

    acTotalInput.value = parseInt(acArmorInput.value) + parseInt(acShieldInput.value) + parseInt(acItemInput.value) + parseInt(acAbilityInput.value) + parseInt(acOtherInput.value) + 10;
}

const updateHpMax = () =>
{
    const level = document.getElementById("level").value;
    const conModifier = document.getElementById("constitution-modifier").value;
    const maxHPInput = document.getElementById("max-hp");
    const maxHP = 8 + (level - 1) * 5 + level * conModifier + level * 1;
    if (level === "" || level === null || conModifier === "" || conModifier === null)
        maxHPInput.value = "";
    else
        maxHPInput.value = maxHP;
};

const updateCelestial = () => {
    const celestialAC = document.getElementById('celestial-ac');
    const celestialMaxHP = document.getElementById('celestial-max-hp');
    const celestialLevel = document.getElementById('celestial-level');
    const celestialDefenderTracker = document.getElementById('defender-tracker');
    let storedSpells = JSON.parse(localStorage.getItem("spells"));
    const spell = storedSpells.find(spell => spell.name === 'summoncelestial');
    const celestial = document.getElementById('celestial');
    let ac = 11 + parseInt(celestialLevel.value);

    const maxHP = 40 + (celestialLevel.value-5) * 10;
    celestialMaxHP.value = maxHP;
    if (celestialDefenderTracker.value != "")
        ac += 2;

    celestialAC.value = ac;
    if (spell.active === true)
        celestial.style.display = 'block';
}

const updateCelestialAbilityModifiers = () =>
{
    abilities.forEach(ability =>
    {
        const abilityInput = document.getElementById(`celestial-${ability.inputId}`);
        const abilityModifier = document.getElementById(`celestial-${ability.modifierId}`);
        const abilityValue = parseInt(abilityInput.value, 10);
        if (!isNaN(abilityValue))
        {
            let modifier = Math.floor((abilityValue - 10) / 2);

            // Display + if the modifier is positive
            abilityModifier.value = modifier > 0 ? `+${modifier}` : `${modifier}`;
        } else
        {
            abilityModifier.value = '';
        }
    });
}

const updateSheet = () =>
{
    updateAbilityModifiers();
    updateProfBonus();
    updateInitiative();
    updateHpMax();
    updateSkillModifiers();
    updateAttackModifiers();
    updateSpellAttackModifiers();
    updateSpellSaveDC();
    updateArmorModifiers();
    updateDC();
    updateSpellAttack();
    updateSavesModifiers();
    updateCelestial();
    updateCelestialAbilityModifiers();
}

document.addEventListener('DOMContentLoaded', function ()
{
    // Render skills dynamically
    const skillsContainer = document.getElementById('skills-container');

    skillsWithKeyAbilities.forEach(skill =>
    {
        const skillBlock = document.createElement('div');
        skillBlock.classList.add('input-column');
        const skillNameLowerTrim = skill.name.toLowerCase().trim().replace(/\s+/g, '');

        skillBlock.innerHTML = `
                <div class="input-column">
                    <label for="${skill.name.toLowerCase()}-total" style="font-size: 22px; text-align: center;">
                        ${skill.name.toUpperCase()} (${skill.keyAbility})
                    </label>
                    <div class="smaller-container">
                        <div class="input-with-text">
                            <div class="mid-input-container">
                                <label for="${skill.name.toLowerCase()}-total" style="font-size: 20px; text-align: center;">TOTAL</label>
                                <input type="text" class="skill-base-input" id="${skillNameLowerTrim}-total" readonly
                                    style="caret-color: transparent; cursor:pointer"
                                    onmouseover="this.style.backgroundColor='lightgray';"
                                    onmouseout="this.style.backgroundColor='';"
                                    onfocus="this.style.backgroundColor='lightgray';"
                                    onblur="this.style.backgroundColor='';"
                                >
                            </div>
                            <div class="mid-input-container">
                                <label for="${skill.name.toLowerCase()}-key" style="font-size: 20px; text-align: center;">${skill.keyAbility}</label>
                                <input type="text" class="skill-mid-input" id="${skillNameLowerTrim}-key">
                            </div>
                            <div class="mid-input-container">
                                <label for="${skill.name.toLowerCase()}-prof" style="font-size: 20px; text-align: center;">PROF</label>
                                <input type="text" class="skill-mid-input" id="${skillNameLowerTrim}-prof">
                            </div>
                            <div class="mid-input-container">
                                <label for="${skill.name.toLowerCase()}-item" style="font-size: 20px; text-align: center;">ITEM</label>
                                <input type="text" class="skill-mid-input" id="${skillNameLowerTrim}-item">
                            </div>
                        </div>
                    <div>
                </div>
        `;

        skillsContainer.appendChild(skillBlock);
    });

    abilities.forEach(ability =>
    {
        const abilityInput = document.getElementById(ability.inputId);

        abilityInput.addEventListener('input', function ()
        {
            updateSheet();
        });
    });

    document.getElementById("level").addEventListener('input', () => {
        updateSheet();
    })

    const holyweaponRows = document.querySelectorAll('.holyweapon-row');
    const shieldOfFaithRows = document.querySelectorAll('.shieldoffaith-row');
    const summonCelestialRows = document.querySelectorAll('.summoncelestial-row');

    // Create a MutationObserver
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                updateSheet();
            }
        });
    });

    // Configure and start observing each row
    holyweaponRows.forEach(row => {
        observer.observe(row, { attributes: true, attributeFilter: ['style'] });
    });

    shieldOfFaithRows.forEach(row => {
        observer.observe(row, { attributes: true, attributeFilter: ['style'] });
    });

    summonCelestialRows.forEach(row => {
        observer.observe(row, { attributes: true, attributeFilter: ['style'] });
    });


});

window.onload = function() {
    updateSheet();
};


