let slaGroupState = {
    lastActionTaken: null,
    maxDiscardActions: 0,
    discardsTaken: 0,
    selectedNationalityData: null,
    currentPhase: 'main' // 'main', 'discard', 'done'
};

let activeScenarioFeatures = {
    HAS_VICTORY_LOCATION: false,
    LOCATION_CONTEXT: null,
    HAS_VICTORY_POINTS: false,
    VICTORY_POINTS_CONTEXT: null,
};

let pinnedCountInput, slPinnedKIAInput, inWireInput, isFlankedInput, isMovingInput, isFlankingInput;
let isEncircledInput, isEntrenchedInput, isInfiltratedInput, isInfiltratingAnyInput;
let terrainTypeSelect;
let slaTroopQualitySelect, slaNationalitySelect, stanceSelect, statusDisplay, priorityList;
let checkConcealButton, concealResult;
let slaActionSection, rncSelector, rncNumbers, selectedRNCValueInput, terrainPlacedSelect, checkTerrainAcceptanceButton, terrainPlacementResult;
let slaHandSizeDisplay, slaNationalityNotes;
let doneActionsButton;
let discardActionSection;
let discardPriorityList;
let discardActionsRemainingDisplay;
// Define terrains incompatible with movement/entrenching/wire
const nonMovingTerrains = ['Minefield', 'Stream', 'Marsh']; // Add others if needed (Wire handled by checkbox)
const nonEntrenchingTerrains = ['Open Ground', 'Marsh', 'Stream', 'Pillbox', 'Minefield']; // Wire handled by checkbox
const nonWireTerrains = ['Minefield', 'Stream', 'Marsh', 'Pillbox']; // Terrains where wire likely doesn't exist or apply

isMovingInput, inWireInput, isEntrenchedInput;

function requireNationalitySelected() {
    if (!slaNationalitySelect) {
        console.error("SLA Nationality select element not found during check.");
        return false;
    }
    if (!slaNationalitySelect.value) {
        alert("Please select an SLA Nationality first.");
        return false;
    }
    return true;
}

function updateSlaGroupReferences() {
    const groupNameShort = "SLA Group";
    const groupNameLong = "SLA Group";

    document.querySelectorAll('[data-sla-ref="short"]').forEach(el => el.textContent = groupNameShort);
    document.querySelectorAll('[data-sla-ref="long"]').forEach(el => el.textContent = groupNameLong);

    const dynamicStabilityH2 = document.getElementById('dynamicSlaGroupRefStabilityH2');
    if (dynamicStabilityH2) dynamicStabilityH2.textContent = groupNameLong;

    const dynamicStatusH2 = document.getElementById('dynamicSlaGroupRefStatusH2');
    if (dynamicStatusH2) dynamicStatusH2.textContent = groupNameLong;
    const dynamicHint = document.getElementById('dynamicSlaGroupRefHint');
    if (dynamicHint) dynamicHint.textContent = groupNameLong;
}

function calculateStability() {
    let stability = 0;
    stability -= parseInt(pinnedCountInput?.value ?? '0');
    if (slPinnedKIAInput?.checked) stability -= 2;
    if (inWireInput?.checked) stability -= 2;
    if (isFlankedInput?.checked) stability -= 2;
    if (isMovingInput?.checked) stability -= 1;
    if (isEncircledInput?.checked) stability -= 3;
    if (isInfiltratedInput?.checked) stability -= 3; // Same penalty as encircled

    if (isFlankingInput?.checked) stability += 2;
    if (isEntrenchedInput?.checked) stability += 2;
 
    const selectedTerrain = terrainTypeSelect?.value;
    if (selectedTerrain === 'Minefield') {
        stability -= 2;
    } else if (selectedTerrain === 'Woods' || selectedTerrain === 'Buildings') {
        stability += 1;
    }
 
    return stability;
}

function updateDisplayedHandSize() {
    if (!slaNationalitySelect || !slaHandSizeDisplay || !slPinnedKIAInput) {
        console.error("Cannot update hand size display: Required elements missing.");
        if (slaHandSizeDisplay) {
            slaHandSizeDisplay.textContent = '?';
            slaHandSizeDisplay.className = '';
        }
        return;
    }

    const selectedNatName = slaNationalitySelect.value;
    let finalHandSizeText = '-';
    const isLeaderPinned = slPinnedKIAInput.checked;
    let isReduced = false;

    if (selectedNatName && loadedNationalityData[selectedNatName]) {
        const nationData = loadedNationalityData[selectedNatName];
        slaGroupState.selectedNationalityData = nationData;
        const baseHandSize = nationData.hand_capacity ?? '-';

        if (baseHandSize !== '-') {
            const numericHandSize = parseInt(baseHandSize);
            if (!isNaN(numericHandSize)) {
                let finalNumericSize = numericHandSize;
                if (isLeaderPinned && numericHandSize > 0) {
                    finalNumericSize = Math.max(0, numericHandSize - 1);
                    isReduced = true;
                }
                finalHandSizeText = finalNumericSize.toString();
            }
        }
    } else {
        slaGroupState.selectedNationalityData = null;
    }

    slaHandSizeDisplay.textContent = finalHandSizeText;
    slaHandSizeDisplay.className = '';
    if (finalHandSizeText !== '-' && finalHandSizeText !== '?') {
        slaHandSizeDisplay.classList.add(isReduced ? 'hand-size-reduced' : 'hand-size-normal');
    }
}

function resolveTargetingList(targetingKey) {
    if (!targetingKey || !TARGETING[targetingKey]) {
        return null;
    }
    let targetData = TARGETING[targetingKey];
    let depth = 0;

    while (typeof targetData === 'string' && TARGETING[targetData] && depth < 10) {
        targetData = TARGETING[targetData];
        depth++;
    }
     if (depth >= 10) {
        console.error("Maximum alias resolution depth reached for targeting key:", targetingKey);
        return null;
     }

    if (typeof targetData === 'object' && targetData !== null && targetData.title) {
        return targetData;
    } else if (targetData === null && targetingKey === 'NONE') {
        return null;
    } else {
        return null;
    }
}

function renderTargetingInfo(displayKey, targetingListInput) {
    const resolvedData = resolveTargetingList(targetingListInput);

    if (!resolvedData || displayKey === 'NONE' || targetingListInput === 'NONE') {
        return null;
    }

     if (!resolvedData.title) {
         console.warn(`Invalid resolved targeting data structure for key: ${displayKey} - missing title.`, resolvedData);
         return null;
     }


    const targetingDiv = document.createElement('div');
    targetingDiv.classList.add('action-targeting');

    const targetingTitle = document.createElement('strong');
    targetingTitle.textContent = resolvedData.title;
    targetingDiv.appendChild(targetingTitle);

    if (resolvedData.criteria && Array.isArray(resolvedData.criteria)) {
        const ul = document.createElement('ul');
        ul.style.paddingLeft = '20px';
        ul.style.marginTop = '0';
        ul.style.marginBottom = '0';
        resolvedData.criteria.forEach((criterion) => {
            if (criterion?.desc) {
                const li = document.createElement('li');
                li.innerHTML = criterion.desc;
                ul.appendChild(li);
            }
        });
        targetingDiv.appendChild(ul);
    } else if (resolvedData.description && resolvedData.description.desc) {
        const descContent = resolvedData.description.desc;
        const descContainer = document.createElement('div');
        descContainer.style.margin = '2px 0';
        if (Array.isArray(descContent)) {
            descContent.forEach(line => {
                const p = document.createElement('p');
                p.style.margin = '0';
                p.textContent = line;
                descContainer.appendChild(p);
            });
        } else if (typeof descContent === 'string') {
            const p = document.createElement('p');
            p.style.margin = '0';
            p.textContent = descContent;
            descContainer.appendChild(p);
        }
        targetingDiv.appendChild(descContainer);
    } else if (resolvedData.title && !resolvedData.criteria && !resolvedData.description) {
         const pTarget = document.createElement('p');
         pTarget.style.margin = '2px 0';
         pTarget.innerHTML = `<em>(Implicit target or see action rules)</em>`;
         targetingDiv.appendChild(pTarget);
    }
     else {
        const pTarget = document.createElement('p');
        pTarget.style.margin = '2px 0';
        pTarget.innerHTML = `<em>(See Rules/Context for ${displayKey})</em>`;
        targetingDiv.appendChild(pTarget);
        console.warn(`Could not render complete details for targeting key: ${displayKey}`, resolvedData);
    }

    return targetingDiv;
}

function checkRncCondition(actionDef, rncValue, rncIsRed)
{
    const _condition = actionDef.rncCondition;
    const _num       = Math.abs(rncValue);

    if (!_condition ||
        (typeof _condition === 'string' && _condition.toUpperCase() === 'ANY') ||
        (typeof _condition === 'object' && _condition !== null && Object.keys(_condition).length === 0))
    {
        return true;
    }

    if (typeof _condition === 'object' && _condition !== null)
    {
        let _colorSpecificConditions;

        if (rncIsRed)
        {
            if (!_condition.hasOwnProperty('red'))
                return false;
            
            _colorSpecificConditions = _condition.red;
        }
        else
        {
            if (!_condition.hasOwnProperty('black'))
                return false;

            _colorSpecificConditions = _condition.black;
        }

        if (typeof _colorSpecificConditions === 'string' && _colorSpecificConditions.toUpperCase() === 'ANY')
            return true;

        if (Array.isArray(_colorSpecificConditions))
        {
            if (_colorSpecificConditions.length === 0)
                return false;

            for (const _item of _colorSpecificConditions)
            {
                if (typeof _item === 'number')
                {
                    if (_num === _item)
                        return true;
                }
                else if (typeof _item === 'string')
                {
                    // Try to parse as "X...Y" range
                    const _rangeParts = _item.split('...');
                    if (_rangeParts.length === 2)
                    {
                        const _min = parseInt(_rangeParts[0]);
                        const _max = parseInt(_rangeParts[1]);
                        if (!isNaN(_min) && !isNaN(_max) && _num >= _min && _num <= _max)
                            return true;
                    }
                    else // Try to parse as a single number string (e.g., "5")
                    {
                        const _singleNum = parseInt(_item);
                        if (!isNaN(_singleNum) && _num === _singleNum)
                            return true;
                    }
                }
            }
            return false;
        }

        console.warn(`RNC condition for color ("${rncIsRed ? 'red' : 'black'}") is not "ANY" or an array:`, _colorSpecificConditions);
        return false;
    }

    console.warn(`Unexpected rncCondition format encountered:`, _condition);
    return false;
}

const conditionCheckers = {
    "ALWAYS_TRUE": () => true,
    "PINNED_GT1": (inputs) => parseInt(inputs.pinnedCountInput?.value ?? '0') > 1,
    "PINNED_LEADER": (inputs) => inputs.slPinnedKIAInput?.checked ?? false,
    "PINNED_ANY": (inputs) => parseInt(inputs.pinnedCountInput?.value ?? '0') > 0,
    "SLA_NO_PINNED_UNITS": (inputs) => (parseInt(inputs.pinnedCountInput?.value ?? '0') === 0),
    "PINNED_OR_KIA_SL": (inputs) => inputs.slPinnedKIAInput?.checked ?? false,
    "IN_WIRE": (inputs) => inputs.inWireInput?.checked ?? false,
    "IN_MINEFIELD": (inputs) => inputs.terrainTypeSelect?.value === 'Minefield',
    "IS_ENTRENCHED": (inputs) => inputs.isEntrenchedInput?.checked ?? false,
    "IS_INFILTRATED": (inputs) => inputs.isInfiltratedInput?.checked ?? false,
    "IS_INFILTRATING_ANY": (inputs) => inputs.isInfiltratingAnyInput?.checked ?? false,
    "IS_NOT_ENTRENCHED": (inputs) => !(inputs.isEntrenchedInput?.checked ?? false),
    "IS_MOVING": (inputs) => inputs.isMovingInput?.checked ?? false,
    "IS_NOT_MOVING": (inputs) => !(inputs.isMovingInput?.checked ?? false),
    "IS_ENCIRCLED": (inputs) => inputs.isEncircledInput?.checked ?? false,
    "IS_LEADER_EFFECTIVE": (inputs) => !(inputs.slPinnedKIAInput?.checked ?? false),
    "IN_BENEFICIAL_TERRAIN": (inputs) => inputs.terrainTypeSelect?.value === 'Woods' || inputs.terrainTypeSelect?.value === 'Buildings',
    "NOT_IN_BENEFICIAL_TERRAIN": (inputs) => !(inputs.terrainTypeSelect?.value === 'Woods' || inputs.terrainTypeSelect?.value === 'Buildings'),
    "CAN_PLACE_TERRAIN_SELF_NOW": (inputs) => (inputs.isMovingInput?.checked ?? false),
    "RALLY_ELIGIBLE_UNITS_EXIST": (inputs) => { return parseInt(inputs.pinnedCountInput?.value ?? '0') > 0; },
    "HAS_MOVE_CARD": () => true,
    "HAS_FIRE_CARD": () => true,
    "HAS_RALLY_CARD": () => true,
    "HAS_RALLY_NUM_CARD": () => true,
    "HAS_RALLY_ALL_CARD": () => true,
    "HAS_SMOKE_CARD": () => true,
    "HAS_SNIPER_CARD": () => true,
    "HAS_TERRAIN_CARD": () => true,
    "HAS_FLANK_CARD": () => true,
    "CAN_DISCARD_TERRAIN_ON_ENEMY": () => true,
    "PLAYER_AT_RR_LT_5": () => true,
    "PLAYER_AT_RR_4_OR_5": () => true,
    "PLAYER_AT_RR_5": () => true,
    "NEARBY_WEAPON_AVAILABLE": () => true,
    "NEEDS_CREW_OR_CREW_PINNED": () => true,
    "OBJECTIVE_IN_RANGE": () => true,
    "SITUATIONAL_PLAYER_JUDGEMENT": () => true,
    "WAS_TARGETED_BY_SNIPER_LAST_TURN": () => true,
    "WEAPON_MALFUNCTIONED_ANY": () => true,
    "WEAPON_MALFUNCTIONED_PRIMARY": () => true,
    "IS_ATTACKER": (inputs, stance) => stance === "attacker" || stance === "Default",
    "IS_DEFENDER": (inputs, stance) => stance === "defender" || stance === "Default",
    "IN_ENTRENCHMENT_TERRAIN": (inputs) => {
        if (inputs.isMovingInput?.checked || inputs.inWireInput?.checked) {
            return false;
        }
        const currentTerrain = inputs.terrainTypeSelect?.value;
        return !nonEntrenchingTerrains.includes(currentTerrain);
    },
    "IS_JAPANESE": (inputs, stance, nationality) => nationality === NATIONS.JAPANESE,
    "HAS_VICTORY_LOCATION": () => activeScenarioFeatures.HAS_VICTORY_LOCATION,
    "HAS_VICTORY_POINTS": () => activeScenarioFeatures.HAS_VICTORY_POINTS,
};

function processActiveScenarioVictoryConditions(scenarioName) {
    activeScenarioFeatures.HAS_VICTORY_LOCATION = false;
    activeScenarioFeatures.LOCATION_CONTEXT = null;
    activeScenarioFeatures.HAS_VICTORY_POINTS = false;
    activeScenarioFeatures.VICTORY_POINTS_CONTEXT = null;

    if (!scenarioName || !window.loadedScenarioData || !window.loadedScenarioData[scenarioName]) {
        console.warn(`processActiveScenarioVictoryConditions: Scenario data not found for "${scenarioName}". Victory conditions will be false.`);
        return;
    }

    const _scenarioData = window.loadedScenarioData[scenarioName];

    if (_scenarioData.victory_conditions && Array.isArray(_scenarioData.victory_conditions)) {
        _scenarioData.victory_conditions.forEach(conditionObj => {
            if (typeof conditionObj === 'object' && conditionObj !== null) {
                for (const type in conditionObj) {
                    const _context = conditionObj[type];
                    switch (type.toUpperCase()) {
                        case "LOCATION":
                            activeScenarioFeatures.HAS_VICTORY_LOCATION = true;
                            activeScenarioFeatures.LOCATION_CONTEXT = _context;
                            break;
                        case "VICTORY_POINTS":
                            activeScenarioFeatures.HAS_VICTORY_POINTS = true;
                            activeScenarioFeatures.VICTORY_POINTS_CONTEXT = _context;
                            break;
                        default:
                            console.warn(`processActiveScenarioVictoryConditions: Unknown victory condition type "${type}" in scenario "${scenarioName}".`);
                    }
                }
            }
        });
    }
    console.log(`Processed victory conditions for "${scenarioName}":`, activeScenarioFeatures);
}

function computeActionWeight(action, rncValue, rncIsRed, stance) {
    let w = 0;

    // 1. Add Stance Bias based on action.type and STANCE_BIASES
    const stanceKey = STANCE_BIASES[stance] ? stance : 'Default';
    const currentStanceBiases = STANCE_BIASES[stanceKey];
    const actionType = action.type;

    let stanceBias = 0;
    if (actionType && currentStanceBiases && typeof currentStanceBiases[actionType] !== 'undefined') {
         stanceBias = currentStanceBiases[actionType];
    }
    w += stanceBias;

    // RNC bias for Main Actions (as per rule)
    // Discard actions typically don't have RNC bias
    if (action.type !== 'Discard') {
        if (!rncIsRed && action.type === 'Fire') w += 1;
        if (rncIsRed && action.type === 'Move') w -= 1;
    }

    if (action.bias !== undefined) {
         w += action.bias;
    }

    return w;
}

function checkActionConditions(action, currentStateInputs, stance, nationality) {
    const conditions = Array.isArray(action.conditions) ? action.conditions : [];

    for (const conditionKey of conditions) {
        let checkKey = conditionKey;
        let negateResult = false;

        if (checkKey.startsWith('!')) {
            negateResult = true;
            checkKey = checkKey.substring(1);
        }

        const checkerFunc = conditionCheckers[checkKey];

        if (!checkerFunc) {
            console.warn(`No condition checker function found for base key: ${checkKey} (derived from ${conditionKey}) for action: ${action.actionKey || action.text}`);
            return false;
        }

        let conditionMet = checkerFunc(currentStateInputs, stance, nationality);

        if (negateResult) {
            conditionMet = !conditionMet;
        }

        if (!conditionMet) {
            return false;
        }
    }

    return true;
}

function applyExclusivityFilter(actions) {
    const actionsWithGroup = [];
    const actionsWithoutGroup = [];

    for (const action of actions) {
        if (action.exclusivityGroup) {
            actionsWithGroup.push(action);
        } else {
            actionsWithoutGroup.push(action);
        }
    }

    if (actionsWithGroup.length === 0) {
        return actions;
    }

    const grouped = {}; // Stores the chosen action for each exclusivityGroup

    for (const action of actionsWithGroup) {
        const groupName = action.exclusivityGroup;
        const currentPriorityInGroup = action.priorityInGroup !== undefined ? action.priorityInGroup : -Infinity;

        if (!grouped[groupName]) {
            grouped[groupName] = action;
        } else {
            const existingActionInGroup = grouped[groupName];
            const existingPriorityInGroup = existingActionInGroup.priorityInGroup !== undefined ? existingActionInGroup.priorityInGroup : -Infinity;

            let currentIsBetter = false;

            if (currentPriorityInGroup > existingPriorityInGroup) {
                currentIsBetter = true;
            } else if (currentPriorityInGroup === existingPriorityInGroup) {
                const currentSlaPriority = action.priority !== undefined ? action.priority : -Infinity;
                const existingSlaPriority = existingActionInGroup.priority !== undefined ? existingActionInGroup.priority : -Infinity;

                if (currentSlaPriority > existingSlaPriority) {
                    currentIsBetter = true;
                } else if (currentSlaPriority === existingSlaPriority) {
                    if (action._initialIndex < existingActionInGroup._initialIndex) {
                        currentIsBetter = true;
                    }
                }
            }

            if (currentIsBetter) {
                grouped[groupName] = action;
            }
        }
    }

    const finalActions = [...Object.values(grouped), ...actionsWithoutGroup];
    return finalActions;
}
//
//
//

function updateSLAState() {
    if (!requireNationalitySelected()) {
        if (priorityList) priorityList.innerHTML = '<div>(Select Nationality and Calculate Status)</div>';
        if (slaActionSection) slaActionSection.style.display = 'none';
        if (discardActionSection) discardActionSection.style.display = 'none';
        if (statusDisplay) { statusDisplay.textContent = 'Status: ---'; statusDisplay.className = 'status-neutral'; }
        if (doneActionsButton) doneActionsButton.style.display = 'none';
        slaGroupState.lastActionTaken = null;
        slaGroupState.maxDiscardActions = 0;
        slaGroupState.discardsTaken = 0;
        slaGroupState.currentPhase = 'main';
        return;
    }

    const gameScenarioSelectElement = document.getElementById('scenarioSelectSetup');
    const currentActiveScenarioName = gameScenarioSelectElement ? gameScenarioSelectElement.value : null;

    if (currentActiveScenarioName) {
        processActiveScenarioVictoryConditions(currentActiveScenarioName);
    } else {
        processActiveScenarioVictoryConditions(null);
        console.warn("updateSLAState: No active game scenario identified. Victory condition checks might be inaccurate.");
    }

    const coreElements = [slaTroopQualitySelect, selectedRNCValueInput, statusDisplay, priorityList, slaActionSection, rncSelector];
    if (coreElements.some(el => !el) || typeof ACTION_DEFINITIONS === 'undefined' || typeof DISCARD_ACTION_DEFINITIONS === 'undefined' || typeof slaPriorities === 'undefined') {
         console.error("Core UI elements or game data definitions missing (ACTION_DEFINITIONS, DISCARD_ACTION_DEFINITIONS, slaPriorities), cannot update SLA state.");
         if(priorityList) priorityList.innerHTML = '<div>Error: UI elements or game data missing. Cannot calculate.</div>';
         return;
    }

    if (discardActionSection) discardActionSection.style.display = 'none';
    if (doneActionsButton) doneActionsButton.style.display = 'none';

    slaGroupState.currentPhase = 'main';

    const selectedRncElement = rncSelector.querySelector('.rnc-selected');
    const rncValue = parseInt(selectedRNCValueInput.value) || 0;
    const rncIsRed = (selectedRncElement && selectedRncElement.classList.contains('rnc-red')) || (rncValue < 0 && rncValue !== 0);

    const stability = calculateStability();
    const troopQuality = slaTroopQualitySelect.value || "Line";
    const isStressed = stability < 0;
    const currentStateKey = isStressed ? 'Stressed' : 'Effective';
    const currentStance = stanceSelect?.value || "Default";
    const currentNationality = slaNationalitySelect.value;


    const currentStateInputs = {
        pinnedCountInput, slPinnedKIAInput, inWireInput, isFlankedInput,
        isMovingInput, isFlankingInput, terrainTypeSelect, isEncircledInput,
        isEntrenchedInput, isInfiltratedInput, isInfiltratingAnyInput
    };

    let statusText = isStressed ? "Stressed" : "Effective";
    let statusClass = '';
    if (isStressed) {
        if (stability <= -4) statusClass = 'status-stressed-severe';
        else if (stability <= -2) statusClass = 'status-stressed-moderate';
        else statusClass = 'status-stressed-mild';
    } else {
        if (stability >= 4) statusClass = 'status-effective-excellent';
        else if (stability >= 2) statusClass = 'status-effective-good';
        else statusClass = 'status-effective-neutral';
    }
    statusDisplay.textContent = `Status: ${statusText}`;
    statusDisplay.className = statusClass;

    slaGroupState.lastActionTaken = null;
    slaGroupState.maxDiscardActions = 0;
    slaGroupState.discardsTaken = 0;


    let basePriorityRefs = [];
    let qualityKey = troopQuality;

    if (!slaPriorities[qualityKey]) {
        console.warn(`No priorities defined for troop quality '${qualityKey}'. Falling back to 'Line'.`);
        qualityKey = "Line";
    }

    if (slaPriorities[qualityKey] && Array.isArray(slaPriorities[qualityKey][currentStateKey])) {
        basePriorityRefs = deepCopy(slaPriorities[qualityKey][currentStateKey]);
    } else {
         console.warn(`No priority list found for quality '${qualityKey}' and state '${currentStateKey}'.`);
    }

    let standardHydratedActions = [];
    for (const pRef of basePriorityRefs) {
         const baseActionDef = ACTION_DEFINITIONS[pRef.actionRef];
         if (!baseActionDef) {
             console.error(`Master definition not found for actionRef: ${pRef.actionRef}`);
             continue;
         }

         const hydratedAction = {
             ...deepCopy(baseActionDef),
             actionKey: pRef.actionRef,
             rncCondition: pRef.rncCondition,
             priority: pRef.priority !== undefined ? pRef.priority : 0,
             conditions: Array.isArray(pRef.conditions) ? pRef.conditions : (Array.isArray(baseActionDef.conditions) ? baseActionDef.conditions : []),
             targetingKey: pRef.overrides?.targetingKey !== undefined ? (Array.isArray(pRef.overrides?.targetingKey) ? pRef.overrides.targetingKey : [pRef.overrides?.targetingKey]) : (Array.isArray(baseActionDef.targetingKey) ? baseActionDef.targetingKey : [baseActionDef.targetingKey || 'NONE']),
             instructionKey: pRef.overrides?.instructionKey || baseActionDef.instructionKey || 'NO_INSTRUCTION',
             postActionInstructionKey: pRef.overrides?.postActionInstructionKey || baseActionDef.postActionInstructionKey || 'NO_POST_ACTION',
             displayTriggerTextKeys: Array.isArray(pRef.displayTriggerTextKeys) ? pRef.displayTriggerTextKeys : (Array.isArray(baseActionDef.displayTriggerTextKeys) ? baseActionDef.displayTriggerTextKeys : []),
             modifier: pRef.overrides?.modifier || baseActionDef.modifier || null,
             bias: pRef.bias !== undefined ? pRef.bias : (baseActionDef.bias !== undefined ? baseActionDef.bias : 0),
             ...(pRef.overrides || {}),
             _initialIndex: standardHydratedActions.length
         };

         if (!Array.isArray(hydratedAction.conditions) || hydratedAction.conditions.length === 0) {
             if (Array.isArray(baseActionDef.conditions)) hydratedAction.conditions = [...baseActionDef.conditions];
             else hydratedAction.conditions = ["ALWAYS_TRUE"];
         }
         if (!Array.isArray(hydratedAction.displayTriggerTextKeys) || hydratedAction.displayTriggerTextKeys.length === 0) {
             hydratedAction.displayTriggerTextKeys = [...hydratedAction.conditions];
         }
         if (!Array.isArray(hydratedAction.targetingKey)) {
             hydratedAction.targetingKey = [hydratedAction.targetingKey || 'NONE'];
         }

         if (!checkRncCondition(hydratedAction, rncValue, rncIsRed)) { continue; }
         if (!checkActionConditions(hydratedAction, currentStateInputs, currentStance, currentNationality)) { continue; }

         standardHydratedActions.push(hydratedAction);
    }

    const holdActionDef = ACTION_DEFINITIONS['HOLD'];
    const isHoldAlreadyIncluded = standardHydratedActions.some(p => p.actionKey === 'HOLD');

    if (!isHoldAlreadyIncluded && holdActionDef) {
         const hydratedHold = {
             ...deepCopy(holdActionDef),
             actionKey: 'HOLD',
             rncCondition: 'ANY',
             conditions: Array.isArray(holdActionDef.conditions) ? holdActionDef.conditions : ["ALWAYS_TRUE"],
             targetingKey: Array.isArray(holdActionDef.targetingKey) ? holdActionDef.targetingKey : [holdActionDef.targetingKey || 'NONE'],
             instructionKey: holdActionDef.instructionKey || 'PROCEED_TO_DISCARD',
             postActionInstructionKey: holdActionDef.postActionInstructionKey || 'HOLD_DISCARD_OPTIONAL',
             displayTriggerTextKeys: Array.isArray(holdActionDef.displayTriggerTextKeys) ? holdActionDef.displayTriggerTextKeys : ["ALWAYS_TRUE"],
             priority: 0,
             _initialIndex: standardHydratedActions.length
         };

         if (!Array.isArray(hydratedHold.displayTriggerTextKeys) || hydratedHold.displayTriggerTextKeys.length === 0) {
             hydratedHold.displayTriggerTextKeys = [...hydatedHold.conditions];
         }
         if (!Array.isArray(hydratedHold.targetingKey)) {
             hydratedHold.targetingKey = [hydratedHold.targetingKey || 'NONE'];
         }

         if (checkActionConditions(hydratedHold, currentStateInputs, currentStance, currentNationality)) {
             standardHydratedActions.push(hydratedHold);
         } else {
              console.warn("HOLD action defined but failed its conditions check.");
         }
    }

    let actionsAfterExclusivity = applyExclusivityFilter(standardHydratedActions);

    actionsAfterExclusivity.sort((a, b) => {
        if (b.priority !== a.priority) {
            return b.priority - a.priority;
        }
        const wa = computeActionWeight(a, rncValue, rncIsRed, currentStance);
        const wb = computeActionWeight(b, rncValue, rncIsRed, currentStance);
        if (wb !== wa) {
            return wb - wa;
        }
        return a._initialIndex - b._initialIndex;
    });

    const allValidActions = actionsAfterExclusivity;

    priorityList.innerHTML = '';

    if (allValidActions.length > 0) {
        allValidActions.forEach((p) => {

             const instructionText = INSTRUCTIONS[p.instructionKey];
             const postActionText = POST_ACTION_INSTRUCTIONS[p.postActionInstructionKey];
             const triggerTextsExist = Array.isArray(p.displayTriggerTextKeys) &&
                 p.displayTriggerTextKeys.every(key => {
                     let baseKey = key.startsWith('!') ? key.substring(1) : key;
                     return CONDITIONS[baseKey] !== undefined;
                 });


             if (!instructionText || !postActionText || !triggerTextsExist) {
                 console.error(`Cannot render priority item "${p.actionKey}" - missing data lookup(s):`,
                     `Instruction: ${p.instructionKey in INSTRUCTIONS}`,
                     `Post-Action: ${p.postActionInstructionKey in POST_ACTION_INSTRUCTIONS}`,
                     `Trigger Texts: ${triggerTextsExist}`,
                     p
                 );
                 const errDiv = document.createElement('div');
                 errDiv.textContent = `Error rendering action: ${p.text || p.actionKey || 'Unknown'}. Data missing or invalid.`;
                 errDiv.style.color = 'red';
                 priorityList.appendChild(errDiv);
                 return;
             }

            let actionDisplay = p.text;

            let triggerDisplayText = "";
            if (Array.isArray(p.displayTriggerTextKeys)) {
                const textParts = p.displayTriggerTextKeys
                    .map(key => {
                        let baseKey = key;
                        let isNegated = false;
                        if (key.startsWith('!')) {
                            isNegated = true;
                            baseKey = key.substring(1);
                        }

                        const baseText = CONDITIONS[baseKey];

                        if (!baseText) {
                            return null;
                        }

                        if (baseKey === "ALWAYS_TRUE" && !isNegated) {
                            return CONDITIONS["ALWAYS_TRUE"];
                        }
                        if (baseKey === "ALWAYS_TRUE" && isNegated) {
                            return null;
                        }

                        if (isNegated) {
                            return `<strong>NOT</strong> ${baseText}`;
                        } else {
                            return baseText;
                        }
                    })
                    .filter(text => text !== null);

                if (textParts.length > 0) {
                    if (textParts.length === 1 && textParts[0] === CONDITIONS["ALWAYS_TRUE"]) {
                         triggerDisplayText = CONDITIONS["ALWAYS_TRUE"];
                    } else {
                         const filteredTextParts = textParts.filter(text => text !== CONDITIONS["ALWAYS_TRUE"]);
                         triggerDisplayText = filteredTextParts.join(" <strong>AND</strong> ");
                    }
                } else if (p.displayTriggerTextKeys.includes("ALWAYS_TRUE") && p.displayTriggerTextKeys.length === 1) {
                    triggerDisplayText = CONDITIONS["ALWAYS_TRUE"] || "(Default Action)";
               } else {
                   triggerDisplayText = `(Trigger conditions not fully rendered)`;
                   console.warn("Priority item failed to render trigger text:", p);
               }

            } else {
                triggerDisplayText = `(Invalid Trigger Format)`;
                console.warn("Priority item has non-array displayTriggerTextKeys:", p);
            }

            const itemDiv = document.createElement('div');
            itemDiv.classList.add('priority-item');
            // Apply specific CSS classes based on priority for styling
            if (p.priority === 1) {
                itemDiv.classList.add('status-stressed-mild');
            } else if (p.priority === 2) {
                itemDiv.classList.add('status-stressed-moderate');
            } else if (p.priority >= 3) { // Assuming 3 or higher should be 'severe'
                itemDiv.classList.add('status-stressed-severe');
            }
            itemDiv.dataset.postActionKey = p.postActionInstructionKey;
            itemDiv.dataset.coreAction = p.type;
            itemDiv.dataset.actionKey = p.actionKey;

            const actionTypeText = document.createElement('strong');
            actionTypeText.classList.add('action-type');
            actionTypeText.textContent = actionDisplay;
            itemDiv.appendChild(actionTypeText);

            if (triggerDisplayText && triggerDisplayText !== CONDITIONS["ALWAYS_TRUE"]) {
                 const triggerElement = document.createElement('p');
                 triggerElement.classList.add('action-trigger');
                 triggerElement.innerHTML = `<strong>Trigger:</strong> ${triggerDisplayText}`;
                 itemDiv.appendChild(triggerElement);
             } else if (p.actionKey === 'HOLD') {
                  const triggerElement = document.createElement('p');
                 triggerElement.classList.add('action-trigger');
                 triggerElement.innerHTML = `<strong>Trigger:</strong> ${CONDITIONS["ALWAYS_TRUE"]}`;
                 itemDiv.appendChild(triggerElement);
             }

            if (Array.isArray(p.targetingKey)) {
                 p.targetingKey.forEach(key => {
                     const targetingInfoDiv = renderTargetingInfo(key, key);
                     if (targetingInfoDiv) {
                         itemDiv.appendChild(targetingInfoDiv);
                     }
                 });
            } else {
                 const targetingInfoDiv = renderTargetingInfo(p.targetingKey, p.targetingKey);
                 if (targetingInfoDiv) {
                     itemDiv.appendChild(targetingInfoDiv);
                 }
            }

            const instructionElement = document.createElement('p');
            instructionElement.classList.add('action-instruction');
            instructionElement.innerHTML = `<strong>Instruction:</strong> ${instructionText}`;
            itemDiv.appendChild(instructionElement);

            if (p.modifier) {
                const modifierNote = document.createElement('p');
                modifierNote.classList.add('action-modifier-note');
                modifierNote.innerHTML = `<em>Note: Apply Green rule modifier: ${p.modifier}</em>`;
                itemDiv.appendChild(modifierNote);
            }

            itemDiv.addEventListener('click', () => {
                priorityList.querySelectorAll('.post-action-details').forEach(el => el.remove());
                if (doneActionsButton) doneActionsButton.style.display = 'none';

                const allItems = priorityList.querySelectorAll('.priority-item');
                allItems.forEach(item => {
                    item.classList.remove('selected-action');
                     item.style.display = 'none';
                });
                itemDiv.classList.add('selected-action');
                itemDiv.style.display = '';

                priorityList.querySelectorAll('.general-instructions').forEach(el => el.style.display = 'none');
                priorityList.querySelectorAll('.green-note').forEach(el => el.style.display = 'none');
                const postActionKey = itemDiv.dataset.postActionKey;
                const coreAction = itemDiv.dataset.coreAction;
                const actionKey = itemDiv.dataset.actionKey;

                if (!postActionKey || !POST_ACTION_INSTRUCTIONS[postActionKey] || !coreAction || !actionKey) {
                   console.error("Clicked priority item is missing essential data attributes:", postActionKey, coreAction, actionKey, p);
                   return;
                }

                slaGroupState.lastActionTaken = actionKey;

                const postActionDetailsDiv = document.createElement('div');
                postActionDetailsDiv.classList.add('post-action-details', 'result-output');
                let postInstructionText = POST_ACTION_INSTRUCTIONS[postActionKey];
                postActionDetailsDiv.innerHTML = `<strong>Post-Action Steps (Main Action):</strong><br>${postInstructionText}`;
                itemDiv.insertAdjacentElement('afterend', postActionDetailsDiv);

                if (doneActionsButton) {
                    doneActionsButton.textContent = 'Done with Main Action(s)';
                    doneActionsButton.style.display = 'block';
                }
            });

            priorityList.appendChild(itemDiv);
        });

        const instructionsPara = document.createElement('p');
        instructionsPara.classList.add('general-instructions');
         instructionsPara.innerHTML = `<em>Evaluate the actual game state (cards in hand, targets, terrain, eligibility etc.). Click the <strong>first valid</strong> action sequence ${"SLA Group"} can take based on the list above. Follow the detailed post-action steps that appear. Then click "Done with Main Action(s)" to proceed to the Discard Action phase.</em>`;
        priorityList.appendChild(instructionsPara);

        if (troopQuality === "Green") {
            const note = document.createElement('p');
            note.classList.add('green-note');
            note.innerHTML = `<em>Remember to apply Green special rules mentally (Hesitation, Inefficiency, Panic Chance, etc.) when evaluating triggers, targeting, and execution for ${"SLA Group"}! Conditions marked with modifiers like 'Hesitation?' still require mental evaluation based on Green rules.</em>`;
            priorityList.appendChild(note);
        }


    } else {
         const holdActionDef = ACTION_DEFINITIONS['HOLD'];
         let holdActionData = null;
         if (holdActionDef) {
             const hydratedHold = {
                  ...deepCopy(holdActionDef),
                  actionKey: 'HOLD',
                  rncCondition: 'ANY',
                  conditions: Array.isArray(holdActionDef.conditions) ? holdActionDef.conditions : ["ALWAYS_TRUE"],
                  targetingKey: Array.isArray(holdActionDef.targetingKey) ? holdActionDef.targetingKey : [holdActionDef.targetingKey || 'NONE'],
                  instructionKey: holdActionDef.instructionKey || 'PROCEED_TO_DISCARD',
                  postActionInstructionKey: holdActionDef.postActionInstructionKey || 'HOLD_DISCARD_OPTIONAL',
                  displayTriggerTextKeys: Array.isArray(holdActionDef.displayTriggerTextKeys) ? holdActionDef.displayTriggerTextKeys : ["ALWAYS_TRUE"],
                  priority: 0,
             };

             if (!Array.isArray(hydratedHold.displayTriggerTextKeys) || hydratedHold.displayTriggerTextKeys.length === 0) {
                 hydratedHold.displayTriggerTextKeys = [...hydratedHold.conditions];
             }
             if (!Array.isArray(hydratedHold.targetingKey)) {
                 hydratedHold.targetingKey = [hydratedHold.targetingKey || 'NONE'];
             }

              if (checkActionConditions(hydratedHold, currentStateInputs, currentStance, currentNationality) && POST_ACTION_INSTRUCTIONS[hydratedHold.postActionInstructionKey]) {
                  holdActionData = hydratedHold;
              } else {
                   console.error("HOLD action failed validity checks during fallback render.");
              }
         }

         if (holdActionData) {
             const div = document.createElement('div');
             div.classList.add('priority-item');
             const holdActionText = holdActionData.text || 'Hold / No Action';
             div.dataset.postActionKey = holdActionData.postActionInstructionKey;
             div.dataset.coreAction = holdActionData.type || 'Hold';
             div.dataset.actionKey = holdActionData.actionKey;

             let triggerDisplayText = "";
              if (Array.isArray(holdActionData.displayTriggerTextKeys)) {
                  const textParts = holdActionData.displayTriggerTextKeys
                      .map(key => CONDITIONS[key]).filter(text => text !== undefined);
                  if (textParts.length > 0) {
                       if(textParts.length === 1 && textParts[0] === CONDITIONS["ALWAYS_TRUE"]){
                          triggerDisplayText = CONDITIONS["ALWAYS_TRUE"];
                       } else {
                         triggerDisplayText = textParts.join(" <strong>AND</strong> ");
                       }
                  } else {
                       triggerDisplayText = CONDITIONS["ALWAYS_TRUE"] || "(Default Action)";
                  }
              } else {
                   triggerDisplayText = CONDITIONS["ALWAYS_TRUE"] || "(Default Action)";
              }

             div.innerHTML = `<strong>${holdActionText}</strong>` +
                             `<p class="action-trigger"><strong>Trigger:</strong> ${triggerDisplayText}</p>`;

             if (Array.isArray(holdActionData.targetingKey)) {
                  holdActionData.targetingKey.forEach(key => {
                      const targetingInfoDiv = renderTargetingInfo(key, key);
                      if (targetingInfoDiv) {
                          div.appendChild(targetingInfoDiv);
                      }
                  });
             }

              const instructionElement = document.createElement('p');
              instructionElement.classList.add('action-instruction');
              instructionElement.innerHTML = `<strong>Instruction:</strong> ${INSTRUCTIONS[holdActionData.instructionKey] || 'See Rules'}`;
              div.appendChild(instructionElement);

             div.addEventListener('click', () => {
                 priorityList.querySelectorAll('.post-action-details').forEach(el => el.remove());
                 if (doneActionsButton) doneActionsButton.style.display = 'none';

                 const allItems = priorityList.querySelectorAll('.priority-item');
                 allItems.forEach(item => {
                     item.classList.remove('selected-action');
                      item.style.display = 'none';
                 });
                 div.classList.add('selected-action');
                 div.style.display = '';

                  priorityList.querySelectorAll('.general-instructions').forEach(el => el.style.display = 'none');
                  priorityList.querySelectorAll('.green-note').forEach(el => el.style.display = 'none');


                 const postActionKey = div.dataset.postActionKey;
                 const coreAction    = div.dataset.coreAction;
                 const actionKey     = div.dataset.actionKey;

                 if (!postActionKey || !POST_ACTION_INSTRUCTIONS[postActionKey] || !coreAction || !actionKey) {
                    console.error("Clicked HOLD item is missing essential data attributes:", postActionKey, coreAction, actionKey, holdActionData);
                    return;
                 }

                 slaGroupState.lastActionTaken = actionKey;

                 const postActionDetailsDiv = document.createElement('div');
                 postActionDetailsDiv.classList.add('post-action-details', 'result-output');
                 let postInstructionText = POST_ACTION_INSTRUCTIONS[postActionKey];
                 postActionDetailsDiv.innerHTML = `<strong>Post-Action Steps (Main Action):</strong><br>${postInstructionText}`;
                 div.insertAdjacentElement('afterend', postActionDetailsDiv);

                 if (doneActionsButton) {
                     doneActionsButton.textContent = 'Done with Main Action(s)';
                     doneActionsButton.style.display = 'block';
                 }
             });

             priorityList.appendChild(div);

             const instructionsPara = document.createElement('p');
             instructionsPara.classList.add('general-instructions');
             instructionsPara.innerHTML = `<em>No other valid actions found for the current state and RNC. Click '${holdActionText}' above then follow the post-action steps for ${"SLA Group"}. Then click "Done with Main Action(s)" to proceed to the Discard Action phase.</em>`;
             priorityList.appendChild(instructionsPara);

         } else {
            priorityList.innerHTML = '<div>No valid actions found for the current state and RNC. This indicates a configuration error or an unusual game state.</div>';
            console.error("Could not render any actions, including HOLD.");
         }
    }

    if(slaActionSection) slaActionSection.style.display = 'block';
    if(concealResult) concealResult.textContent = '';
    if(terrainPlacementResult) terrainPlacementResult.textContent = '';
}

function handleStartDiscardPhase() {
    if (!requireNationalitySelected()) return;

    const selectedMainAction = priorityList.querySelector('.priority-item.selected-action');
    if (!selectedMainAction) {
        alert("Please select a main action first.");
        return;
    }

    if (slaActionSection) slaActionSection.style.display = 'none';
    if (discardActionSection) discardActionSection.style.display = 'block';

    slaGroupState.currentPhase = 'discard';
    const selectedNatData = slaGroupState.selectedNationalityData;
    if (selectedNatData) {
        slaGroupState.maxDiscardActions = parseInt(selectedNatData.discard) || 0;
    } else {
         slaGroupState.maxDiscardActions = 0;
    }
    slaGroupState.discardsTaken = 0;
    slaGroupState.lastActionTaken = null;

    if (doneActionsButton) {
        doneActionsButton.textContent = 'Done with Discard Action(s)';
        doneActionsButton.style.display = 'block';
    }

    renderDiscardActions();
}

function handleContinueDiscardPhase() {
    if (slaGroupState.lastActionTaken === 'NO_DISCARD_ACTION' ||
        slaGroupState.discardsTaken >= slaGroupState.maxDiscardActions) {
        endDiscardPhase();
    } else {
        if (discardPriorityList) {
            discardPriorityList.innerHTML = '';
            discardPriorityList.querySelectorAll('.general-instructions').forEach(el => el.style.display = '');
        }
        slaGroupState.lastActionTaken = null;
        renderDiscardActions();
    }
}

function endDiscardPhase() {
    if (discardActionSection) {
        discardActionSection.style.display = 'none';
    }

    if (discardPriorityList) {
        discardPriorityList.innerHTML = '';
    }

    slaGroupState.maxDiscardActions = 0;
    slaGroupState.discardsTaken = 0;
    slaGroupState.lastActionTaken = null;
    slaGroupState.currentPhase = 'done';

    if (slaActionSection) {
         slaActionSection.style.display = 'block';
    }

    if (priorityList) {
         priorityList.innerHTML = '<div>SLA Group Turn Complete. It is now Player\'s turn.  Click any SLA Group checkbox/RNC to being new SLA turn.</div>';
    }

    if (doneActionsButton) {
        doneActionsButton.style.display = 'none';
        doneActionsButton.textContent = 'Click If All SLA Groups Have Taken an Action';
    }
}

function renderDiscardActions() {
     if (!discardPriorityList || !discardActionsRemainingDisplay || typeof INSTRUCTIONS === 'undefined' || typeof POST_ACTION_INSTRUCTIONS === 'undefined' || typeof CONDITIONS === 'undefined' || typeof TARGETING === 'undefined' || typeof DISCARD_ACTION_DEFINITIONS === 'undefined') {
         console.error("Discard UI elements or required data structures not found during render.");
          if(discardPriorityList) discardPriorityList.innerHTML = '<div>Error: Required data missing for discard actions.</div>';
         return;
     }

     discardPriorityList.innerHTML = '';

     const remainingCount = slaGroupState.maxDiscardActions - slaGroupState.discardsTaken;
     discardActionsRemainingDisplay.textContent = `(${remainingCount} Remaining)`;

     const canTakeMoreDiscards = remainingCount > 0;
     const currentStateInputs = {
        pinnedCountInput, slPinnedKIAInput, inWireInput, isFlankedInput,
        isMovingInput, isFlankingInput, terrainTypeSelect, isEncircledInput,
        isEntrenchedInput
    };
     const currentStance = stanceSelect?.value || "Default";
     const currentNationality = slaNationalitySelect.value;

    const noDiscardDef = DISCARD_ACTION_DEFINITIONS.NO_DISCARD_ACTION;
    if (!noDiscardDef) {
        console.error("CRITICAL: DISCARD_ACTION_DEFINITIONS.NO_DISCARD_ACTION is missing!");
        if(discardPriorityList) discardPriorityList.innerHTML = '<div>Error: "No Discard Action" definition missing.</div>';
        return;
    }

     const noDiscardInstructionExists = INSTRUCTIONS[noDiscardDef.instructionKey] !== undefined;
     const noDiscardPostActionExists = POST_ACTION_INSTRUCTIONS[noDiscardDef.postActionInstructionKey] !== undefined;
     const noDiscardTriggerTextsExist = Array.isArray(noDiscardDef.displayTriggerTextKeys) &&
          noDiscardDef.displayTriggerTextKeys.every(key => {
              let baseKey = key.startsWith('!') ? key.substring(1) : key;
              return CONDITIONS[baseKey] !== undefined;
          });
     const noDiscardTargetingExists = Array.isArray(noDiscardDef.targetingKey) &&
          noDiscardDef.targetingKey.every(key => resolveTargetingList(key) !== null || key === 'NONE');

    const potentialDiscardActions = Object.values(DISCARD_ACTION_DEFINITIONS)
       .filter(def => def.actionKey !== 'NO_DISCARD_ACTION');

    let validDiscardActions = [];

    if(canTakeMoreDiscards) {
        validDiscardActions = potentialDiscardActions.filter(def => {
            if (!checkActionConditions(def, currentStateInputs, currentStance, currentNationality)) {
                return false;
            }

            const instructionExists = INSTRUCTIONS[def.instructionKey] !== undefined;
            const postActionExists = POST_ACTION_INSTRUCTIONS[def.postActionInstructionKey] !== undefined;
            const triggerTextsExist = Array.isArray(def.displayTriggerTextKeys) &&
                 def.displayTriggerTextKeys.every(key => {
                     let baseKey = key.startsWith('!') ? key.substring(1) : key;
                     return CONDITIONS[baseKey] !== undefined;
                 });
             const targetingExists = Array.isArray(def.targetingKey) &&
                  def.targetingKey.every(key => resolveTargetingList(key) !== null || key === 'NONE');


            if (!instructionExists || !postActionExists || !triggerTextsExist || !targetingExists) {
                 console.warn(`Discard action "${def.actionKey}" excluded from list due to missing data references.`, def);
                 return false;
            }
            return true;
        });
    }

    let actionsToRender = [...validDiscardActions];
    if (noDiscardInstructionExists && noDiscardPostActionExists && noDiscardTriggerTextsExist && noDiscardTargetingExists) {
         actionsToRender.push(noDiscardDef);
    } else {
         console.error("Cannot render 'No Discard Action' due to invalid data references.", noDiscardDef);
          if (actionsToRender.length === 0) {
              discardPriorityList.innerHTML = '<div>Error: No valid discard actions found, and "No Discard Action" could not be rendered.</div>';
              return;
          }
    }


    if (actionsToRender.length > 0) {
        actionsToRender.sort((a, b) => {
            if (a.actionKey === 'NO_DISCARD_ACTION') return 1;
            if (b.actionKey === 'NO_DISCARD_ACTION') return -1;
            return a.text.localeCompare(b.text);
        });

        actionsToRender.forEach((def) => {
            const itemDiv = createDiscardActionItem(def);
            discardPriorityList.appendChild(itemDiv);
        });

       const instructionsPara = document.createElement('p');
       instructionsPara.classList.add('general-instructions');
       const hasOtherValidDiscards = validDiscardActions.length > 0;

       if (canTakeMoreDiscards && hasOtherValidDiscards) {
           instructionsPara.innerHTML = `<em>You may perform up to ${remainingCount} more Discard Action(s). Click a valid action below to perform it. Click "No Discard Action" when you are finished or cannot perform any more discards.</em>`;
       } else if (canTakeMoreDiscards && !hasOtherValidDiscards) {
           instructionsPara.innerHTML = `<em>No other applicable Discard Actions found for the current state. Click "No Discard Action" to end the discard phase.</em>`;
       } else if (!canTakeMoreDiscards && noDiscardInstructionExists && noDiscardPostActionExists) {
           instructionsPara.innerHTML = `<em>You have used your maximum ${slaGroupState.maxDiscardActions} Discard Action(s) this turn. Click "No Discard Action" to end the discard phase.</em>`;
       } else {
            instructionsPara.innerHTML = `<em>No discard actions available.</em>`;
       }
       discardPriorityList.appendChild(instructionsPara);

    } else if (noDiscardInstructionExists && noDiscardPostActionExists) {
         const itemDiv = createDiscardActionItem(noDiscardDef);
         discardPriorityList.appendChild(itemDiv);
         const instructionsPara = document.createElement('p');
         instructionsPara.classList.add('general-instructions');
          if (canTakeMoreDiscards) {
             instructionsPara.innerHTML = `<em>No other applicable Discard Actions found for the current state. Click "No Discard Action" to end the discard phase.</em>`;
         } else {
             instructionsPara.innerHTML = `<em>You have used your maximum ${slaGroupState.maxDiscardActions} Discard Action(s) this turn. Click "No Discard Action" to end the discard phase.</em>`;
         }
         discardPriorityList.appendChild(instructionsPara);

    }
     else {
          discardPriorityList.innerHTML = '<div>Error: No discard actions available.</div>';
          console.error("Could not render any discard actions.");
     }
}

function createDiscardActionItem(def) {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('priority-item', 'discard-item');
    itemDiv.dataset.postActionKey = def.postActionInstructionKey;
    itemDiv.dataset.actionKey = def.actionKey;

    const instructionText = INSTRUCTIONS[def.instructionKey];
    const postActionText = POST_ACTION_INSTRUCTIONS[def.postActionInstructionKey];
     const triggerTextsExist = Array.isArray(def.displayTriggerTextKeys) &&
         def.displayTriggerTextKeys.every(key => {
             let baseKey = key.startsWith('!') ? key.substring(1) : key;
             return CONDITIONS[baseKey] !== undefined;
         });

    if (!instructionText || !postActionText || !triggerTextsExist) {
         itemDiv.textContent = `Error rendering discard action: ${def.text || def.actionKey || 'Unknown'}`;
         itemDiv.style.color = 'red';
         return itemDiv;
    }

    let triggerDisplayText = "";
     if (Array.isArray(def.displayTriggerTextKeys)) {
         const textParts = def.displayTriggerTextKeys
             .map(key => {
                 let baseKey = key;
                 let isNegated = false;
                 if (key.startsWith('!')) {
                     isNegated = true;
                     baseKey = key.substring(1);
                 }
                 const baseText = CONDITIONS[baseKey];
                  if (!baseText) return null;

                 if (baseKey === "ALWAYS_TRUE" && !isNegated) return CONDITIONS["ALWAYS_TRUE"];
                  if (baseKey === "ALWAYS_TRUE" && isNegated) return null;

                 return isNegated ? `<strong>NOT</strong> ${baseText}` : baseText;

             })
             .filter(text => text !== null);

         if (textParts.length > 0) {
            if (textParts.length === 1 && textParts[0] === CONDITIONS["ALWAYS_TRUE"]) {
                 triggerDisplayText = CONDITIONS["ALWAYS_TRUE"];
            } else {
                const filteredTextParts = textParts.filter(text => text !== CONDITIONS["ALWAYS_TRUE"]);
                triggerDisplayText = filteredTextParts.join(" <strong>AND</strong> ");
            }
         } else if (def.displayTriggerTextKeys.includes("ALWAYS_TRUE") && def.displayTriggerTextKeys.length === 1) {
             triggerDisplayText = CONDITIONS["ALWAYS_TRUE"] || "(Default Action)";
         } else {
              triggerDisplayText = `(Trigger conditions not fully rendered)`;
              console.warn("Discard item failed to render trigger text:", def);
         }
     } else {
         triggerDisplayText = `(Invalid Trigger Format)`;
         console.warn("Discard item has non-array displayTriggerTextKeys:", def);
     }


    const actionTypeElement = document.createElement('strong');
    actionTypeElement.classList.add('action-type');
    actionTypeElement.textContent = def.text;
    itemDiv.appendChild(actionTypeElement);


    if (Array.isArray(def.targetingKey)) {
         def.targetingKey.forEach(key => {
             const targetingInfoDiv = renderTargetingInfo(key, key);
             if (targetingInfoDiv) {
                 itemDiv.appendChild(targetingInfoDiv);
             }
         });
    }


    if (triggerDisplayText) {
        const triggerElement = document.createElement('p');
        triggerElement.classList.add('action-trigger');
        triggerElement.innerHTML = `<strong>Trigger:</strong> ${triggerDisplayText}`;
        itemDiv.appendChild(triggerElement);
    }

    const instructionElement = document.createElement('p');
    instructionElement.classList.add('action-instruction');
    instructionElement.innerHTML = `<strong>Instruction:</strong> ${instructionText}`;
    itemDiv.appendChild(instructionElement);

    return itemDiv;
}


function handleStateChangeExclusivity(event) {
    const changedElement = event.target;
    const terrain = terrainTypeSelect?.value;
    let stateChanged = false;

    if (changedElement.type === 'checkbox') {
        const checkboxId = changedElement.id;
        const isChecked = changedElement.checked;

        if (isChecked) {
            if (checkboxId === 'isMoving') {
                if (terrain !== 'Open Ground') { terrainTypeSelect.value = 'Open Ground'; stateChanged = true; }
                if (inWireInput?.checked) { inWireInput.checked = false; stateChanged = true; }
                if (isEntrenchedInput?.checked) { isEntrenchedInput.checked = false; stateChanged = true; }
            }
            else if (checkboxId === 'inWire') {
                if (nonWireTerrains.includes(terrain)) { terrainTypeSelect.value = 'Open Ground'; stateChanged = true; }
                if (isMovingInput?.checked) { isMovingInput.checked = false; stateChanged = true; }
                if (isEntrenchedInput?.checked) { isEntrenchedInput.checked = false; stateChanged = true; }
            }
            else if (checkboxId === 'isEntrenched') {
                if (nonEntrenchingTerrains.includes(terrain) || nonMovingTerrains.includes(terrain) || nonWireTerrains.includes(terrain)) {
                    terrainTypeSelect.value = 'Brush'; // Default entrenchable terrain
                    stateChanged = true;
                }
                if (isMovingInput?.checked) { isMovingInput.checked = false; stateChanged = true; }
                if (inWireInput?.checked) { inWireInput.checked = false; stateChanged = true; }
            }
        }
    }
    else if (changedElement.id === 'terrainType') {
        if (nonMovingTerrains.includes(terrain)) {
            if (isMovingInput?.checked) { isMovingInput.checked = false; stateChanged = true; }
        }
        if (nonEntrenchingTerrains.includes(terrain)) {
            if (isEntrenchedInput?.checked) { isEntrenchedInput.checked = false; stateChanged = true; }
        }
        if (nonWireTerrains.includes(terrain)) {
            if (inWireInput?.checked) { inWireInput.checked = false; stateChanged = true; }
        }
    }

    if (slaNationalitySelect?.value && selectedRNCValueInput) {
         updateSLAState();
    }
}

function handleDoneActions() {
     if (slaGroupState.currentPhase === 'main') {
         handleStartDiscardPhase();
     } else if (slaGroupState.currentPhase === 'discard') {
         handleContinueDiscardPhase();
     }
}

function handleConcealCheck()
{
    if (!requireNationalitySelected())
        return;

    const _selectedNatName = slaNationalitySelect.value;

    if (!_selectedNatName ||
        !window.concealmentCardData ||
        !window.loadedNationalityData ||
        !window.loadedNationalityData[_selectedNatName] ||
        typeof window.totalDeckSize === 'undefined' ||
        window.totalDeckSize <= 0)
    {
        concealResult.innerHTML = `<strong>Error:</strong> Cannot check concealment. Nationality data, concealment data, or total deck size missing/invalid.`;
        concealResult.className = 'instruction result-output status-stressed-severe';
        console.error("Concealment check failed: Missing global data. Details:", {
            selectedNatName: _selectedNatName,
            isNatNameFalsy: !_selectedNatName,
            concealmentCardDataExists: !!window.concealmentCardData,
            isConcealmentDataFalsy: !window.concealmentCardData,
            loadedNationalityDataExists: !!window.loadedNationalityData,
            isLoadedNatDataFalsy: !window.loadedNationalityData,
            specificNationDataExists: (_selectedNatName && window.loadedNationalityData) ? !!window.loadedNationalityData[_selectedNatName] : 'N/A',
            isSpecificNationDataFalsy: (_selectedNatName && window.loadedNationalityData) ? !window.loadedNationalityData[_selectedNatName] : 'N/A',
            totalDeckSize: window.totalDeckSize,
            isTotalDeckSizeUndefined: typeof window.totalDeckSize === 'undefined',
            isTotalDeckSizeInvalid: (typeof window.totalDeckSize === 'number' ? window.totalDeckSize <= 0 : 'N/A')
        });
        return;
    }

    const _nationConcealmentCards = window.concealmentCardData.filter(_card =>
        Array.isArray(_card.usableBy) && _card.usableBy.includes(window.loadedNationalityData[_selectedNatName].nation_id || _selectedNatName)
    );

    const _totalApplicableCount = _nationConcealmentCards.reduce((_sum, _card) => _sum + _card.count, 0);
    const _probabilityOfAnyConcealment = _totalApplicableCount / window.totalDeckSize;
    const _draw = Math.random();

    if (_totalApplicableCount === 0 || _draw > _probabilityOfAnyConcealment)
    {
        concealResult.innerHTML = `<strong>Result:</strong> No Concealment card drawn for current ${"SLA Group"}.`;
        concealResult.className = 'instruction result-output status-stressed-mild';
    }
    else
    {
        let _drawnCard = null;
        // To correctly simulate drawing a specific card from the applicable ones:
        // We scale the random draw to the sum of counts of applicable cards.
        // The original _draw is a value from 0 to P(any concealment).
        // We want to find which card this _draw corresponds to within the subset of applicable cards.
        let _scaledDrawValue = _draw * window.totalDeckSize; // This gives a value from 0 to totalApplicableCount (approximately)

        for (const _card of _nationConcealmentCards)
        {
            _scaledDrawValue -= _card.count;
            if (_scaledDrawValue <= 0)
            {
                _drawnCard = _card;
                break;
            }
        }

        if (_drawnCard)
        {
            concealResult.innerHTML = `<strong>Result:</strong> Concealment card <strong>${_drawnCard.value}</strong> drawn for current ${"SLA Group"}!`;
            concealResult.className = 'instruction result-output status-good';
        }
        else
        {
            concealResult.innerHTML = `<strong>Result:</strong> No Concealment card drawn (edge case). Probability: ${_probabilityOfAnyConcealment.toFixed(4)}, Draw: ${_draw.toFixed(4)}`;
            concealResult.className = 'instruction result-output status-stressed-moderate';
            console.warn("Concealment draw logic reached an unexpected state.", {
                totalApplicableCount: _totalApplicableCount,
                probabilityOfAnyConcealment: _probabilityOfAnyConcealment,
                draw: _draw,
                scaledDrawAttempt: _draw * window.totalDeckSize,
                nationConcealmentCards: _nationConcealmentCards
            });
        }
    }

    if(terrainPlacementResult) terrainPlacementResult.textContent = '';
}

function handleTerrainAcceptanceCheck() {
    if (!requireNationalitySelected()) return;

    const requiredElements = [terrainPlacementResult, terrainPlacedSelect, slaTroopQualitySelect];
    if (requiredElements.some(el => !el)) {
         console.error("Missing elements for Terrain Acceptance Check.");
         if (terrainPlacementResult) terrainPlacementResult.innerHTML = "<strong>Error:</strong> UI elements missing.";
         terrainPlacementResult.className = 'instruction result-output status-stressed-severe';
         return;
    }

    const terrainType = terrainPlacedSelect.value;
    const troopQuality = slaTroopQualitySelect.value || "Line";
    const currentTerrainIsBeneficial = (terrainTypeSelect?.value === 'Woods' || terrainTypeSelect?.value === 'Buildings');

    let accept = true;
    let reason = "";

    if (!terrainType) {
        alert("Please select the Terrain Type being placed.");
        terrainPlacementResult.textContent = '';
        terrainPlacementResult.className = 'instruction result-output';
        return;
    }

    const nonRejectableTerrain = ["Stream", "Minefield", "Wire"];
    const difficultTerrain = ["Marsh", "Gully"];
    const coverTerrain = ["Brush", "Woods", "Buildings", "Walls", "Hill", "Pillbox"];

    if (nonRejectableTerrain.includes(terrainType)) {
        accept = true;
        reason = "cannot be rejected";
    } else if (terrainType === "Open Ground") {
         terrainPlacementResult.innerHTML = `<strong>Error:</strong> Open Ground cannot be placed on an opponent this way.`;
         terrainPlacementResult.className = 'instruction result-output status-stressed-severe';
         if(concealResult) concealResult.textContent = '';
 		 return;
    }
    else {
        if (troopQuality === "Green") {
            let rejectionChance = 0;
            if (difficultTerrain.includes(terrainType)) {
                rejectionChance = 0.50;
                reason = `hesitates due to difficult/hazardous terrain (${terrainType})`;
            } else if (coverTerrain.includes(terrainType)) {
                rejectionChance = 0.15;
                reason = `hesitates even at potential cover (${terrainType})`;
            } else {
                 accept = true;
                 reason = `is not affected by Green hesitation for this terrain type (${terrainType})`;
            }

            if (rejectionChance > 0) {
                const roll = Math.random();
                if (roll < rejectionChance) {
                   accept = false;
                } else {
                    reason = reason.replace('hesitates', 'considered hesitating');
                    const newTerrainIsBeneficial = (terrainType === 'Woods' || terrainType === 'Buildings');
                    if (newTerrainIsBeneficial) {
                         reason += " and accepts beneficial terrain.";
                    } else if (coverTerrain.includes(terrainType)) {
                         reason += " and accepts cover.";
                    } else {
                        reason += " and accepts the terrain.";
                    }
                }
            }
        } else {
             accept = true;
             reason = `does not reject placed terrain (Rule 7.32)`;
        }
    }

    if (accept) {
        let acceptanceNote = `Place the ${terrainType} Terrain card on the ${"SLA Group"} stack. Discard cards underneath.`;
        if (terrainType === "Wire") acceptanceNote = `Place the Wire card on the ${"SLA Group"} stack. Discard cards underneath.`;

        let resultText = `<strong>Result:</strong> ${"SLA Group"} ACCEPTS the ${terrainType}`;
        if (reason) {
             resultText += ` (${reason}).`;
        } else {
             resultText += '.';
        }
         resultText += ` ${acceptanceNote}`;
        terrainPlacementResult.innerHTML = resultText;
        terrainPlacementResult.className = 'instruction result-output status-effective-good';
    } else {
        terrainPlacementResult.innerHTML = `<strong>Result:</strong> ${"SLA Group"} REFUSES the ${terrainType} (${reason}).`
            + `<br><strong>Player Action Required (Rule 7.32):</strong>`
            + `<br> 1. Change the ${"SLA Group"}'s current Movement card to **Sideways** mode (adjust range chit accordingly).`
            + `<br> 2. If the ${"SLA Group"}'s Movement card was *already* Sideways, discard that Movement card instead.`
            + `<br> 3. Discard the refused ${terrainType} card.`
            + `<br><em>(The ${"SLA Group"} implicitly uses an action via the rejection consequence if movement changed/card discarded).</em>`;
        terrainPlacementResult.className = 'instruction result-output status-stressed-moderate';
    }

    if(concealResult) concealResult.textContent = '';
}

function initializeGameLogic() {

    pinnedCountInput = document.getElementById('pinnedCount');
    slPinnedKIAInput = document.getElementById('slPinnedKIA');
    inWireInput = document.getElementById('inWire');
    isFlankedInput = document.getElementById('isFlanked');
    isMovingInput = document.getElementById('isMoving');
    isFlankingInput = document.getElementById('isFlanking');
    terrainTypeSelect = document.getElementById('terrainType'); // Added
    isEncircledInput = document.getElementById('isEncircled');
    isEntrenchedInput = document.getElementById('isEntrenched');
    isInfiltratedInput = document.getElementById('isInfiltrated');
    isInfiltratingAnyInput = document.getElementById('isInfiltratingAny');
    slaTroopQualitySelect = document.getElementById('slaTroopQuality');
    slaNationalitySelect = document.getElementById('slaNationality');
    stanceSelect = document.getElementById('stanceSelect');
    statusDisplay = document.getElementById('statusDisplay');
    priorityList = document.getElementById('priorityList');
    checkConcealButton = document.getElementById('checkConcealButton');
    concealResult = document.getElementById('concealResult');
    slaActionSection = document.getElementById('slaActionSection');
    rncSelector = document.getElementById('rncSelector');
    rncNumbers = document.querySelectorAll('.rnc-number');
    selectedRNCValueInput = document.getElementById('selectedRNCValue');
    terrainPlacedSelect = document.getElementById('terrainPlaced');
    checkTerrainAcceptanceButton = document.getElementById('checkTerrainAcceptanceButton');
    terrainPlacementResult = document.getElementById('terrainPlacementResult');
    slaHandSizeDisplay = document.getElementById('slaHandSizeDisplay');
    slaNationalityNotes = document.getElementById('slaNationalityNotes');
    doneActionsButton = document.getElementById('doneActionsButton');
    discardActionSection = document.getElementById('discardActionSection');
    discardPriorityList = document.getElementById('discardPriorityList');
    discardActionsRemainingDisplay = document.getElementById('discardActionsRemainingDisplay');


    allExclusionCheckboxes = {};

    const essentialElements = [
        pinnedCountInput, slPinnedKIAInput, inWireInput, isFlankedInput, isMovingInput, isFlankingInput,
        terrainTypeSelect, isEncircledInput, isEntrenchedInput, isInfiltratedInput, isInfiltratingAnyInput,
        slaTroopQualitySelect, slaNationalitySelect, statusDisplay, priorityList, checkConcealButton,
        concealResult, slaActionSection, rncSelector, selectedRNCValueInput, terrainPlacedSelect,
        checkTerrainAcceptanceButton, terrainPlacementResult, slaHandSizeDisplay, slaNationalityNotes,
        stanceSelect, doneActionsButton, discardActionSection, discardPriorityList, discardActionsRemainingDisplay
    ];
    if (essentialElements.some(el => !el) || !rncNumbers || rncNumbers.length === 0 || typeof ACTION_DEFINITIONS === 'undefined' || typeof DISCARD_ACTION_DEFINITIONS === 'undefined' || typeof slaPriorities === 'undefined') {
        console.error("CRITICAL ERROR: One or more essential DOM elements or game data definitions (ACTION_DEFINITIONS, DISCARD_ACTION_DEFINITIONS, slaPriorities) could not be found. Script cannot proceed reliably.");
        const errorMsg = '<p style="color:red; font-weight:bold; border: 2px solid red; padding: 10px;">Error: Required UI elements or game data for Game Tab not found. App cannot start correctly.</p>';
        document.body?.insertAdjacentHTML('afterbegin', errorMsg);
        return;
    }

    if (typeof window.loadedNationalityData !== 'undefined') {
        slaNationalitySelect.innerHTML = '<option value="">-- Select --</option>';
        Object.keys(window.loadedNationalityData).sort().forEach(natName => {
             if (Object.hasOwnProperty.call(window.loadedNationalityData, natName)) {
                 const option = document.createElement('option');
                 option.value = natName;
                 option.textContent = natName;
                 slaNationalitySelect.appendChild(option);
             }
        });
    } else {
         console.error("Nationality data (loadedNationalityData) not found.");
         slaNationalitySelect.innerHTML = '<option value="">Error loading</option>';
    }

    const terrainTypesForPlacement = ["Brush", "Woods", "Buildings", "Walls", "Gully", "Stream", "Marsh", "Wire", "Minefield", "Hill", "Pillbox", "Open Ground"];
    terrainPlacedSelect.innerHTML = '<option value="">-- Select Terrain --</option>';
    terrainTypesForPlacement.sort().forEach(type => {
        const option = document.createElement('option');
        option.value = type;
        option.textContent = type;
        terrainPlacedSelect.appendChild(option);
    });

    const defaultRNC = rncSelector.querySelector('.rnc-number.rnc-black[data-value="0"]');
    if (defaultRNC) {
        defaultRNC.classList.add('rnc-selected');
        selectedRNCValueInput.value = "0";
    } else {
        console.warn("Default RNC button (0 Black) not found during init.");
        selectedRNCValueInput.value = "0";
    }

    rncNumbers.forEach(span => {
        span.addEventListener('click', () => {
            rncNumbers.forEach(s => s.classList.remove('rnc-selected'));
            span.classList.add('rnc-selected');
            const value = span.getAttribute('data-value');
            selectedRNCValueInput.value = value;
            if (slaNationalitySelect.value) {
                updateSLAState();
            }
        });
    });

    isMovingInput = document.getElementById('isMoving');
    inWireInput = document.getElementById('inWire');
    isEntrenchedInput = document.getElementById('isEntrenched');
 
    [isMovingInput, inWireInput, isEntrenchedInput, terrainTypeSelect].forEach(input => {
        if (input) {
            input.addEventListener('change', handleStateChangeExclusivity);
        } else {
            console.warn("An input element required for exclusivity handling was not found.");
        }
    });


    const stateChangeInputs = [
        pinnedCountInput, slaTroopQualitySelect, slPinnedKIAInput, inWireInput, isFlankedInput,
        isMovingInput, isFlankingInput, isEncircledInput, isEntrenchedInput, isInfiltratedInput, isInfiltratingAnyInput, terrainTypeSelect, stanceSelect
    ];

    stateChangeInputs.forEach(input => {
        if (input) {
             if (![isMovingInput, inWireInput, isEntrenchedInput, terrainTypeSelect].includes(input)) {
                 input.addEventListener('change', () => {
                     if (input === slPinnedKIAInput) updateDisplayedHandSize();
                     if (slaNationalitySelect.value) {
                         updateSLAState();
                     }
                 });
             }
        }
    });

    if (slaNationalitySelect) {
        slaNationalitySelect.addEventListener('change', () => {
            const selectedNatName = slaNationalitySelect.value;
            updateDisplayedHandSize();

            if (selectedNatName && window.loadedNationalityData && window.loadedNationalityData[selectedNatName]) {
                const nationData = window.loadedNationalityData[selectedNatName];
                slaNationalityNotes.innerHTML = nationData.notes || '';
                slaNationalityNotes.style.display = nationData.notes ? 'block' : 'none';
                slaGroupState.selectedNationalityData = nationData;

                updateSLAState();

            } else {
                slaNationalityNotes.textContent = '';
                slaNationalityNotes.style.display = 'none';
                slaGroupState.selectedNationalityData = null;

                statusDisplay.textContent = 'Status: ---';
                statusDisplay.className = 'status-neutral';
                priorityList.innerHTML = '<div>(Select Nationality)</div>';
                discardPriorityList.innerHTML = '';
                slaActionSection.style.display = 'none';
                discardActionSection.style.display = 'none';
                if (doneActionsButton) doneActionsButton.style.display = 'none';
                concealResult.textContent = '';
                terrainPlacementResult.textContent = '';
                if (terrainPlacedSelect) terrainPlacedSelect.value = '';
            }
        });
    }

    if (checkConcealButton) checkConcealButton.addEventListener('click', handleConcealCheck);
    if (checkTerrainAcceptanceButton) checkTerrainAcceptanceButton.addEventListener('click', handleTerrainAcceptanceCheck);

    if (doneActionsButton) {
        doneActionsButton.addEventListener('click', handleDoneActions);
    }

    if (discardPriorityList) {
        discardPriorityList.addEventListener('click', (event) => {
            const clickedItem = event.target.closest('.priority-item.discard-item');
            if (!clickedItem) return;

            const actionKey = clickedItem.dataset.actionKey;
            const remainingBeforeClick = slaGroupState.maxDiscardActions - slaGroupState.discardsTaken;

            discardPriorityList.querySelectorAll('.selected-discard-action').forEach(item => item.classList.remove('selected-discard-action'));
            discardPriorityList.querySelectorAll('.post-action-details').forEach(el => el.remove());
            discardPriorityList.querySelectorAll('.general-instructions').forEach(el => el.style.display = 'none');

            discardPriorityList.querySelectorAll('.priority-item.discard-item').forEach(item => {
                item.style.display = '';
            });

            if (actionKey !== 'NO_DISCARD_ACTION' && remainingBeforeClick <= 0) {
                const errorDiv = document.createElement('div');
                errorDiv.classList.add('post-action-details', 'result-output', 'status-stressed-mild');
                errorDiv.innerHTML = "<strong>Cannot take more Discard Actions this turn.</strong> Please select 'No Discard Action' below to finish.";
                clickedItem.insertAdjacentElement('afterend', errorDiv);

                const noDiscardItem = discardPriorityList.querySelector('.priority-item.discard-item[data-action-key="NO_DISCARD_ACTION"]');
                discardPriorityList.querySelectorAll('.priority-item.discard-item').forEach(item => {
                    if (item === clickedItem || (noDiscardItem && item === noDiscardItem)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });

                if(noDiscardItem) {
                    noDiscardItem.classList.add('selected-discard-action');
                    const noDiscardDetailsDiv = document.createElement('div');
                    noDiscardDetailsDiv.classList.add('post-action-details', 'result-output');
                    const postActionText = POST_ACTION_INSTRUCTIONS['END_DISCARD_PHASE'] || 'See Rules/Context.';
                    noDiscardDetailsDiv.innerHTML = `<strong>Post-Action Steps (Discard Action):</strong><br>${postActionText}`;
                    noDiscardItem.insertAdjacentElement('afterend', noDiscardDetailsDiv);

                     if (doneActionsButton) {
                          doneActionsButton.textContent = 'End Discard Phase';
                          doneActionsButton.style.display = 'block';
                     }
                } else {
                     if (doneActionsButton) {
                          doneActionsButton.textContent = 'Done with Discard Action(s) (Error)';
                          doneActionsButton.style.display = 'block';
                     }
                }

                return;
            }

            clickedItem.classList.add('selected-discard-action');
            discardPriorityList.querySelectorAll('.priority-item.discard-item').forEach(item => {
                if (item !== clickedItem) {
                    item.style.display = 'none';
                } else {
                     item.style.display = '';
                }
            });

            const postActionKey = clickedItem.dataset.postActionKey;
            const postActionDetailsDiv = document.createElement('div');
            postActionDetailsDiv.classList.add('post-action-details', 'result-output');
            const postActionText = POST_ACTION_INSTRUCTIONS[postActionKey] || 'See Rules/Context.';
            postActionDetailsDiv.innerHTML = `<strong>Post-Action Steps (Discard Action):</strong><br>${postActionText}`;
            clickedItem.insertAdjacentElement('afterend', postActionDetailsDiv);

            slaGroupState.lastActionTaken = actionKey;

            if (actionKey !== 'NO_DISCARD_ACTION') {
                 slaGroupState.discardsTaken++;
                 const remainingAfterClick = slaGroupState.maxDiscardActions - slaGroupState.discardsTaken;
                 discardActionsRemainingDisplay.textContent = `(${remainingAfterClick} Remaining)`;

                 if (doneActionsButton) {
                     if (remainingAfterClick > 0) {
                          doneActionsButton.textContent = 'Choose next Discard Action';
                     } else {
                          doneActionsButton.textContent = 'Done with Discard Action(s)';
                     }
                      doneActionsButton.style.display = 'block';
                 }

            } else {
                 discardActionsRemainingDisplay.textContent = `(${slaGroupState.maxDiscardActions - slaGroupState.discardsTaken} Remaining)`;

                 if (doneActionsButton) {
                     doneActionsButton.textContent = 'End Discard Phase';
                      doneActionsButton.style.display = 'block';
                 }
            }
        });
    }

    slaGroupState.currentPhase = 'main';
    statusDisplay.textContent = 'Status: ---';
    statusDisplay.className = 'status-neutral';
    priorityList.innerHTML = (slaNationalitySelect.value) ? '<div>(Calculate Status)</div>' : '<div>(Select Nationality)</div>';
    discardPriorityList.innerHTML = '';
    slaActionSection.style.display = 'none';
    discardActionSection.style.display = 'none';
    if (doneActionsButton) doneActionsButton.style.display = 'none';
    concealResult.textContent = '';
    terrainPlacementResult.textContent = '';

    updateSlaGroupReferences();

    if (slaNationalitySelect.value !== "") {
        updateDisplayedHandSize();
    } else {
        updateDisplayedHandSize();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.gameDataReady && !window.gameLogicInitialized) {
        initializeGameLogic();
        window.gameLogicInitialized = true;
    } else if (!window.gameDataReady) {
        document.addEventListener('dataReady', () => {
            if (!window.gameLogicInitialized) {
                initializeGameLogic();
                 window.gameLogicInitialized = true;
            }
        }, { once: true });
    }
});

if (document.readyState === 'interactive' || document.readyState === 'complete') {
     if (window.gameDataReady && !window.gameLogicInitialized) {
         initializeGameLogic();
         window.gameLogicInitialized = true;
     }
}
