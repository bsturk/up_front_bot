const STANCE_BIASES = {
    Attacker: {
        Move: 3,
        Fire: -2,
        Rally: 0,
        Misc: -1,
        Terrain: -1,
        Hold: -3
    },
    Defender: {
        Move: -2,
        Fire: 3,
        Rally: 1,
        Misc: 0,
        Terrain: 2,
        Hold: 1
    },

     Default: {
         Move: 0, Fire: 0, Rally: 0, Misc: 0, Terrain: 0, Hold: 0
     }
};

const ACTIONS = {
    ACQUIRE_WEAPON:        { text: "Acquire Weapon",            type: "Misc" },
    BANZAI:                { text: "Banzai Charge",             type: "Move" },
    CHANGE_CREW:           { text: "Change Crew",               type: "Misc" },
    ENTRENCH:              { text: "Entrench",                  type: "Misc" },
    EXIT_MINEFIELD:        { text: "Exit Minefield",            type: "Move" },
    REMOVE_MINEFIELD:      { text: "Remove Minefield",          type: "Misc" },
    FIRE_CLOSE_THREAT:     { text: "Fire (Close Threat Only)",  type: "Fire" },
    FIRE_DEF:              { text: "Fire (Defensive)",          type: "Fire" },
    FIRE_GEN:              { text: "Fire (General)",            type: "Fire" },
    FIRE_HIGH_OPP:         { text: "Fire (High Opportunity)",   type: "Fire" },
    FIRE_OPP:              { text: "Fire (Opportunity)",        type: "Fire" },
    FIX_WEAPON:            { text: "Fix Weapon",                type: "Misc" },
    HOLD:                  { text: "Hold / No Action",          type: "Hold" },
    INFILTRATE_MORALE:     { text: "Infiltrate (Morale Check)", type: "Move" },
    INFILTRATE_MOVE:       { text: "Infiltrate (Move Card)",    type: "Move" },
    LAY_SMOKE:             { text: "Lay Smoke",                 type: "Terrain" },
    MOVE_ADVANCE:          { text: "Move (Advance)",            type: "Move" },
    MOVE_CAUTIOUS:         { text: "Move (Cautious)",           type: "Move" },
    MOVE_OBJECTIVE:        { text: "Move (Towards Objective)",  type: "Move" },
    MOVE_FLANK:            { text: "Move Sideways (Flank)",     type: "Move" },
    MOVE_RETREAT_SIDEWAYS: { text: "Move (Sideways)",           type: "Move" },
    MOVE_RETREAT:          { text: "Move (Retreat)",            type: "Move" },
    PLACE_TERRAIN_SELF:    { text: "Place Terrain (Self)",      type: "Terrain" },
    RALLY_ALL:             { text: "Rally All",                 type: "Rally" },
    RALLY_NUM:             { text: "Rally #",                   type: "Rally" },
    REMOVE_WIRE:           { text: "Remove Wire",               type: "Terrain" },
    TRANSFER_IND:          { text: "Individual Transfer",       type: "Misc" },
};

const CONDITIONS = {
    "ALWAYS_TRUE": "Default action if other conditions not met",
    "HAS_FIRE_CARD": "Fire card(s) available",
    "HAS_MOVE_CARD": "Movement card available",
    "HAS_FLANK_CARD": "Movement with Flank card available",
    "HAS_RALLY_ALL_CARD": "Rally All card available",
    "HAS_RALLY_NUM_CARD": "Rally # card available",
    "HAS_SMOKE_CARD": "Smoke card available",
    "HAS_SNIPER_CARD": "Sniper card available",
    "HAS_TERRAIN_CARD": "Terrain card available",
    "IN_BENEFICIAL_TERRAIN": "In Beneficial Terrain",
    "IN_MINEFIELD": "In Minefield",
    "IN_WIRE": "In Wire",
    "IS_ENCIRCLED": "Is Encircled",
    "IS_ENTRENCHED": "Is Entrenched",
    "IS_NOT_ENTRENCHED": "Is not Entrenched",
    "IS_MOVING": "Is Moving",
    "IS_NOT_MOVING": "Not Moving",
    "IN_ENTRENCHMENT_TERRAIN": "In legal Entrenchment terrain (not in Open/Marsh/Stream/Wire/Pillbox)",
    "NEARBY_WEAPON_AVAILABLE": "Available unused SLA weapon",
    "NEEDS_CREW_OR_CREW_PINNED": "Possessed weapon needs crew OR designated crewman is Pinned",
    "NOT_IN_BENEFICIAL_TERRAIN": "Not In Beneficial Terrain",
    "NOT_PINNED_LEADER": "SL/ASL Not Pinned/KIA",
    "OBJECTIVE_IN_RANGE": "Scenario has specific range for victory and an SLA group is 1 away",
    "PINNED_ANY": "> Any Pinned units in SLA",
    "PINNED_LEADER": "SL/ASL Pinned/KIA",
    "PLAYER_AT_RR_5": "Any Player group at RR 5",
    "PLAYER_AT_RR_4_OR_5": "Any Player group at RR 4 or 5",
    "PLAYER_AT_RR_LT_5": "Any Player group at RR < 5",
    "SITUATIONAL_PLAYER_JUDGEMENT": "Situational (Player judgement)",
    "WEAPON_MALFUNCTIONED_ANY": "Any current Group weapon malfunctioned",
    "IS_JAPANESE": "Nationality is Japanese",
};

const TARGET_CRITERIA = {
    IS_FLANKED_BY_SLA: { desc: "Flanked by this SLA Group" },
    IS_IN_OPEN: { desc: "In Open Ground" },
    IS_MOVING: { desc: "Moving" },
    HAS_LEADER: { desc: "Has SL/ASL" },
    HAS_UNPINNED_LEADER: { desc: "Has Unpinned SL/ASL" },
    HAS_SPEC_WEAPON_MG: { desc: "Has MG" },
    HAS_SPEC_WEAPON_AT: { desc: "Has Anti-AFV Weapon - (ATR/Bazooka/PF)." },
    HAS_AFV: { desc: "Has AFV" },
    AT_RR_X: (X) => ({ desc: `At RR ${X}` }),
    AT_RR_X_OR_Y: (X, Y) => ({ desc: `At RR ${X} or ${Y}` }),
    CLOSEST_RR: { desc: "Closest (by RR)" },
    HIGHEST_FP_TOTAL: { desc: "Highest Total FP of Unpinned Units (at current RR)" },
    LOWEST_FP_TOTAL: { desc: "Lowest Total FP of Unpinned Units (at current RR)" },
    MOST_UNITS: { desc: "Most Units" },
    FEWEST_UNITS: { desc: "Fewest Units" },
    HIGHEST_PINNED_COUNT: { desc: "Most Pinned Units" },
    LOWEST_PINNED_COUNT: { desc: "Fewest Pinned Units" },
    LOWEST_GROUP_ID: { desc: "Lowest Group ID (A>B>C>D)" },
};

const WEAPON_TARGET_CRITERIA = {
    IS_RADIO: { desc: "Radio" },
    IS_ANTI_AFV: { desc: "Anti-AFV (ATR/Bazooka/PF)" },
    IS_MG: { desc: "MG" },
    IS_FT: { desc: "FT" },
    IS_ATR: { desc: "ATR" },
    PLAYER_CHOICE: { desc: "Player choice" },
};

const RALLY_TARGET_CRITERIA = {
    IS_SL: { desc: "SL" },
    IS_ASL: { desc: "ASL" },
    HAS_HIGHEST_FP: { desc: "Highest FP among pinned" },
    HAS_HIGHEST_MORALE: { desc: "Highest Morale among pinned" },
    IS_CREW: { desc: "Is manning a weapon as Crew" },
    HAS_LOWEST_ID: { desc: "Lowest Unit ID" }
};

const TERRAIN_TYPE_CRITERIA = {
    IS_MINEFIELD: { desc: "Minefield" },
    IS_MARSH: { desc: "Marsh" },
    IS_STREAM: { desc: "Stream" },
    IS_GULLY: { desc: "Gully" },
    IS_WOODS: { desc: "Woods" },
    IS_BUILDING: { desc: "Building" },
    IS_BRUSH: { desc: "Brush" },
    IS_WALLS: { desc: "Walls" },
    IS_HILL: { desc: "Hill" },
    IS_PILLBOX: { desc: "Pillbox" },
    IS_OPEN_GROUND: { desc: "Open Ground" },
};

const TARGETING = {
    NONE: null,
    FIRE_AGG_EFF_HIGH_OPP: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.HAS_LEADER, TARGET_CRITERIA.HAS_SPEC_WEAPON_MG, TARGET_CRITERIA.HAS_SPEC_WEAPON_AT, TARGET_CRITERIA.HAS_AFV, TARGET_CRITERIA.IS_FLANKED_BY_SLA, TARGET_CRITERIA.AT_RR_X(5), TARGET_CRITERIA.IS_MOVING, TARGET_CRITERIA.IS_IN_OPEN, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_AGG_STR_THREAT: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HAS_LEADER, TARGET_CRITERIA.HAS_SPEC_WEAPON_MG, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_CAU_EFF_DEF: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.IS_MOVING, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_CAU_STR_CLOSE: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.AT_RR_X_OR_Y(4, 5), TARGET_CRITERIA.LOWEST_FP_TOTAL, TARGET_CRITERIA.FEWEST_UNITS, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    INFILTRATE: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.LOWEST_FP_TOTAL, TARGET_CRITERIA.FEWEST_UNITS, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_EVA_CORNERED: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_GRN_EFF_GEN: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_GRN_EFF_OPP: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.IS_FLANKED_BY_SLA, TARGET_CRITERIA.IS_MOVING, TARGET_CRITERIA.IS_IN_OPEN, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_GRN_STR_DEF: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.AT_RR_X_OR_Y(4, 5), TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_STD_EFF_GEN: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.IS_MOVING, TARGET_CRITERIA.IS_IN_OPEN, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_STD_EFF_OPP: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.IS_FLANKED_BY_SLA, TARGET_CRITERIA.IS_MOVING, TARGET_CRITERIA.IS_IN_OPEN, TARGET_CRITERIA.HAS_LEADER, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.LOWEST_PINNED_COUNT, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    FIRE_STD_STR_DEF: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.AT_RR_X_OR_Y(4, 5), TARGET_CRITERIA.IS_MOVING, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    MOVE_DIR_ADVANCE: {
        title: "Movement Direction:",
        description: { desc: ["Forward."] }
    },
    MOVE_DIR_OBJECTIVE: {
        title: "Movement Direction:",
        description: { desc: ["Closer to Objective."] }
    },
    MOVE_DIR_RETREAT: {
        title: "Movement Direction:",
        description: { desc: ["Backward."] }
    },
    MOVE_DIR_FLANK_HIGHEST_THREAT: {
        title: "Movement Direction:",
        description: { desc: ["Sideways to flank an opposed, adjacent Player Group that is not flanking this SLA Group."] }
    },
    TARGET_RALLY_PRIORITY: {
        title: "Unit Priority:",
        criteria: [ RALLY_TARGET_CRITERIA.IS_SL, RALLY_TARGET_CRITERIA.IS_ASL, RALLY_TARGET_CRITERIA.HAS_HIGHEST_FP, RALLY_TARGET_CRITERIA.HAS_HIGHEST_MORALE, RALLY_TARGET_CRITERIA.HAS_LOWEST_ID ]
    },
    TARGET_ADJ_GROUP_LOWEST_ID: {
        title: "Target Group:",
        description: { desc: ["Adjacent friendly group with lowest ID (A>B>C>D) for Transfer."] }
    },
    TARGET_ALL_PINNED_IN_GROUP: {
        title: "Target:",
        description: { desc: ["All pinned units in this group."] }
    },
    TARGET_CREWMAN_NEEDED: {
        title: "Target Personality:",
        description: { desc: ["Specific crewman needed for weapon."] }
    },
    TARGET_CREWMAN_PINNED: {
        title: "Target Personality:",
        description: { desc: ["Pinned crewman (Lowest ID if multiple)."] }
    },
    TARGET_OWN_GROUP: {
        title: "Target Group:",
        description: { desc: ["This SLA group."] }
    },
    TARGET_ENEMY_GROUP_SNIPER: {
        title: "Target Group Priority:",
        criteria: [ TARGET_CRITERIA.HAS_LEADER, TARGET_CRITERIA.LOWEST_PINNED_COUNT, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    TARGET_ENEMY_GROUP_MOVING: {
        title: "Target Moving Group Priority:",
        criteria: [ TARGET_CRITERIA.CLOSEST_RR, TARGET_CRITERIA.HIGHEST_FP_TOTAL, TARGET_CRITERIA.HAS_LEADER, TARGET_CRITERIA.LOWEST_GROUP_ID ]
    },
    PLACE_TERRAIN_SELF_CARD_PRIORITY: {
        title: "Terrain Card Priority:",
        criteria: [
            TERRAIN_TYPE_CRITERIA.IS_HILL, TERRAIN_TYPE_CRITERIA.IS_BUILDING, TERRAIN_TYPE_CRITERIA.IS_WOODS, TERRAIN_TYPE_CRITERIA.IS_WALLS,
            TERRAIN_TYPE_CRITERIA.IS_GULLY, TERRAIN_TYPE_CRITERIA.IS_PILLBOX, TERRAIN_TYPE_CRITERIA.IS_BRUSH
        ]
    },
    PLACE_TERRAIN_ENEMY_CARD_PRIORITY: {
        title: "Terrain Card Priority:",
        criteria: [
            TERRAIN_TYPE_CRITERIA.IS_MINEFIELD, TERRAIN_TYPE_CRITERIA.IS_SWAMP, TERRAIN_TYPE_CRITERIA.IS_MARSH, TERRAIN_TYPE_CRITERIA.IS_STREAM
        ]
    },
    TARGET_WEAPON: {
        title: "Target Weapon:",
        description: { desc: ["Weapon chit"] },
        criteria: [ WEAPON_TARGET_CRITERIA.IS_RADIO, WEAPON_TARGET_CRITERIA.IS_ANTI_AFV, WEAPON_TARGET_CRITERIA.IS_MG, WEAPON_TARGET_CRITERIA.IS_FT, WEAPON_TARGET_CRITERIA.IS_ATR, WEAPON_TARGET_CRITERIA.PLAYER_CHOICE ]
    },
};

const INSTRUCTIONS = {
    CHANGE_CREW_DESIGNATE_REMOVE: "Designate new/remove current assistant crewman.",
    DRAW_RNC: "Draw RNC.",
    FIRE_ANY_CARD_CORNERED: "Fire at highest priority target. Use any available Fire card.",
    FIRE_PLAYER_CHOICE_CLOSE_THREAT: "Fire at highest priority valid target (RR 4/5). Use lowest usable FP cost Fire card.",
    FIRE_PLAYER_CHOICE: "Fire using the highest FP Fire card(s) possible (at current RR to priority target).",
    INFILTRATE_PLAY_MOVE_CARD: "Choose any Movement card for Infiltration attempt.",
    LAY_SMOKE_PLAYER_CHOICE: "Choose Smoke card.",
    MOVE_PLAYER_CHOICE_ADVANCE: "Choose any Movement card for Advance (+).",
    MOVE_PLAYER_CHOICE_OBJECTIVE: "Choose any Movement card.",
    MOVE_PLAYER_CHOICE_FLANK: "Choose any Movement card with Flank.",
    MOVE_PLAYER_CHOICE_RETREAT: "Choose Movement card for Retreat (-).",
    MOVE_PLAYER_CHOICE_SIDE: "Choose Movement card for Sideways move.",
    PLACE_TERRAIN_ENEMY: "Choose Terrain card and place on Player group over Movement card.",
    PLAY_SNIPER_CARD: "Choose Sniper card and play on Player group.",
    PLACE_TERRAIN_SELF: "Choose Terrain card and place on current SLA group over Movement card.",
    PLAY_ANY_MOVE_TEMP: "Choose any Movement card.",
    PROCEED_TO_DISCARD: "No action card used. If this was last SLA group to activate, proceed to Discard Phase.",
    RALLY_ALL: "Use Rally All card on this group and any other eligible group (adj if only 1 non-Pinned leader, non-adj if both groups have non-Pinned leader). If used on an additional group, it counts as an action for that group as well.",
    RALLY_NUM: "Use Numbered Rally card that would rally the most pinned units in the SLA group.",
    TRANSFER_PLAY_MOVE_DISCARD: "Play Movement card to Discard.",
    DISCARD_CARD_DRAW_ONE: "Discard 1 card of the specified type from the SLA hand.",
    DISCARD_NO_ACTION: "Choose not to take a Discard Action.",
};

const POST_ACTION_INSTRUCTIONS = {
    BANZAI_POST: "Discard the Movement card used. Rally all pinned units in the group. Place a Banzai counter on the group.",
    DISCARD_FIRE_DRAW: "Discard the Fire(s) card used.",
    DISCARD_MOVE_DRAW: "Place the Movement card used on the SLA group.",
    DISCARD_RALLY_NUM_DRAW: "Discard the Numbered Rally card used.",
    DISCARD_RALLY_ALL_DRAW: "Discard the 'Rally All' card used. **!!NOTE!!** If used on two groups, this also counts as the other group's action.",
    DISCARD_SMOKE_DRAW: "Discard the Smoke card used.",
    PLACE_TERRAIN_CHECK: "Place Terrain card on moving Group. If placed on Enemy, use Check SLA Acceptance. If accepted or placed on own group, discard cards underneath.",
    DISCARD_MOVE_CARD: "Discard the Movement card used.",
    DISCARD_SNIPER_CARD: "Discard the Sniper card used.",
    ENTRENCH_RESULT: "Entrenchment status applied (if successful).",
    FIX_WEAPON_RESULT: "Weapon status updated based on RNC result.",
    ACQUIRE_WEAPON_RESULT: "If RNC is Black, Weapon acquired.",
    CHANGE_CREW_RESULT: "Crew status updated.",
    TRANSFER_IND_RESULT: "Individual transferred.",
    HOLD_DISCARD_OPTIONAL: "No action card was used.",
    RNC_LT_MINEFIELD_FIRE_STRENGTH: "If RNC < Minefield Fire Strength, remove Minefield.",
    INFILTRATION_ATTEMPT_MORALE: "Take a morale check (pass if RNC < Morale, ignoring color). If successful, check RPN column under group size with modifiers. Success if number is red - place an Infiltration marker on target Player group.",
    INFILTRATION_ATTEMPT_MOVE: "Check RPN column under group size with modifiers. Success if number is red - place an Infiltration marker on target Player group.",
    END_DISCARD_PHASE: "The turn is over for the SLA player.",
};


const ACTION_DEFINITIONS = {
    RALLY_ALL: {
        text: ACTIONS.RALLY_ALL.text, type: ACTIONS.RALLY_ALL.type,
        conditions: ["PINNED_ANY", "HAS_RALLY_ALL_CARD"],
        targetingKey: "TARGET_ALL_PINNED_IN_GROUP",
        instructionKey: "RALLY_ALL",
        postActionInstructionKey: "DISCARD_RALLY_ALL_DRAW",
        displayTriggerTextKeys: ["PINNED_ANY", "HAS_RALLY_ALL_CARD"]
    },
    RALLY_NUM: {
        text: ACTIONS.RALLY_NUM.text, type: ACTIONS.RALLY_NUM.type,
        conditions: ["PINNED_ANY", "HAS_RALLY_NUM_CARD"],
        targetingKey: "TARGET_RALLY_PRIORITY",
        instructionKey: "RALLY_NUM",
        postActionInstructionKey: "DISCARD_RALLY_NUM_DRAW",
        displayTriggerTextKeys: ["PINNED_ANY", "HAS_RALLY_NUM_CARD"]
    },
    PLACE_TERRAIN_SELF: {
        text: ACTIONS.PLACE_TERRAIN_SELF.text, type: ACTIONS.PLACE_TERRAIN_SELF.type,
        conditions: ["HAS_TERRAIN_CARD", "IS_MOVING"],
        targetingKey: ["TARGET_OWN_GROUP", "PLACE_TERRAIN_SELF_CARD_PRIORITY"],
        instructionKey: "PLACE_TERRAIN_SELF",
        postActionInstructionKey: "PLACE_TERRAIN_CHECK",
        displayTriggerTextKeys: ["HAS_TERRAIN_CARD", "IS_MOVING"]
    },
    FIRE_HIGH_OPP: {
        text: ACTIONS.FIRE_HIGH_OPP.text, type: ACTIONS.FIRE_HIGH_OPP.type,
        conditions: ["HAS_FIRE_CARD"],
        targetingKey: "FIRE_AGG_EFF_HIGH_OPP",
        instructionKey: "FIRE_PLAYER_CHOICE",
        postActionInstructionKey: "DISCARD_FIRE_DRAW",
        displayTriggerTextKeys: ["HAS_FIRE_CARD"]
    },
    FIRE_OPP: {
        text: ACTIONS.FIRE_OPP.text, type: ACTIONS.FIRE_OPP.type,
        conditions: ["HAS_FIRE_CARD"],
        targetingKey: "FIRE_STD_EFF_OPP",
        instructionKey: "FIRE_PLAYER_CHOICE",
        postActionInstructionKey: "DISCARD_FIRE_DRAW",
        displayTriggerTextKeys: ["HAS_FIRE_CARD"]
    },
    FIRE_GEN: {
        text: ACTIONS.FIRE_GEN.text, type: ACTIONS.FIRE_GEN.type,
        conditions: ["HAS_FIRE_CARD"],
        targetingKey: "FIRE_STD_EFF_GEN",
        instructionKey: "FIRE_PLAYER_CHOICE",
        postActionInstructionKey: "DISCARD_FIRE_DRAW",
        displayTriggerTextKeys: ["HAS_FIRE_CARD"]
    },
    MOVE_FLANK: {
        text: ACTIONS.MOVE_FLANK.text, type: ACTIONS.MOVE_FLANK.type,
        conditions: ["NOT_IN_BENEFICIAL_TERRAIN", "IS_NOT_MOVING", "HAS_FLANK_CARD", "!PINNED_ANY"],
        targetingKey: "MOVE_DIR_FLANK_HIGHEST_THREAT",
        instructionKey: "MOVE_PLAYER_CHOICE_FLANK",
        postActionInstructionKey: "DISCARD_MOVE_DRAW",
        displayTriggerTextKeys: ["HAS_FLANK_CARD", "IS_NOT_MOVING"]
    },
    MOVE_ADVANCE: {
        text: ACTIONS.MOVE_ADVANCE.text, type: ACTIONS.MOVE_ADVANCE.type,
        conditions: ["HAS_MOVE_CARD", "PLAYER_AT_RR_LT_5", "!PINNED_ANY", "IS_ATTACKER"],
        targetingKey: "MOVE_DIR_ADVANCE",
        instructionKey: "MOVE_PLAYER_CHOICE_ADVANCE",
        postActionInstructionKey: "DISCARD_MOVE_DRAW",
        displayTriggerTextKeys: ["HAS_MOVE_CARD", "PLAYER_AT_RR_LT_5"]
    },
    MOVE_CAUTIOUS: {
        text: ACTIONS.MOVE_CAUTIOUS.text, type: ACTIONS.MOVE_CAUTIOUS.type,
        conditions: ["HAS_MOVE_CARD", "!PINNED_ANY", "IS_ATTACKER"],
        targetingKey: "MOVE_DIR_ADVANCE",
        instructionKey: "MOVE_PLAYER_CHOICE_ADVANCE",
        postActionInstructionKey: "DISCARD_MOVE_DRAW",
        displayTriggerTextKeys: ["HAS_MOVE_CARD"]
    },
    MOVE_OBJECTIVE: {
        text: ACTIONS.MOVE_OBJECTIVE.text, type: ACTIONS.MOVE_OBJECTIVE.type,
        conditions: ["HAS_MOVE_CARD", "IS_NOT_MOVING", "!PINNED_ANY"],
        targetingKey: "MOVE_DIR_OBJECTIVE",
        instructionKey: "MOVE_PLAYER_CHOICE_OBJECTIVE",
        postActionInstructionKey: "DISCARD_MOVE_DRAW",
        displayTriggerTextKeys: ["HAS_MOVE_CARD", "IS_NOT_MOVING"]
    },
    MOVE_RETREAT: {
        text: ACTIONS.MOVE_RETREAT.text, type: ACTIONS.MOVE_RETREAT.type,
        conditions: ["HAS_MOVE_CARD", "IS_NOT_MOVING", "!IN_MINEFIELD"],
        targetingKey: "MOVE_DIR_RETREAT",
        instructionKey: "MOVE_PLAYER_CHOICE_RETREAT",
        postActionInstructionKey: "DISCARD_MOVE_DRAW",
        displayTriggerTextKeys: ["HAS_MOVE_CARD", "IS_NOT_MOVING"]
    },
    MOVE_RETREAT_SIDEWAYS: {
        text: ACTIONS.MOVE_RETREAT_SIDEWAYS.text, type: ACTIONS.MOVE_RETREAT_SIDEWAYS.type,
        conditions: ["HAS_MOVE_CARD", "IS_NOT_MOVING", "!PINNED_ANY"],
        targetingKey: "MOVE_DIR_RETREAT",
        instructionKey: "MOVE_PLAYER_CHOICE_SIDE",
        postActionInstructionKey: "DISCARD_MOVE_DRAW",
        displayTriggerTextKeys: ["HAS_MOVE_CARD", "IS_NOT_MOVING"]
    },
    EXIT_MINEFIELD: {
        text: ACTIONS.EXIT_MINEFIELD.text, type: ACTIONS.EXIT_MINEFIELD.type,
        conditions: ["IN_MINEFIELD"],
        targetingKey: "TARGET_OWN_GROUP",
        instructionKey: "MOVE_PLAYER_CHOICE_SIDE",
        postActionInstructionKey: "DISCARD_MOVE_DRAW",
        displayTriggerTextKeys: ["IN_MINEFIELD", "HAS_MOVE_CARD"]
    },
    REMOVE_MINEFIELD: {
        text: ACTIONS.REMOVE_MINEFIELD.text, type: ACTIONS.REMOVE_MINEFIELD.type,
        conditions: ["IN_MINEFIELD"],
        targetingKey: "TARGET_OWN_GROUP",
        instructionKey: "DRAW_RNC",
        postActionInstructionKey: "RNC_LT_MINEFIELD_FIRE_STRENGTH",
        displayTriggerTextKeys: ["IN_MINEFIELD"]
    },
    REMOVE_WIRE: {
        text: ACTIONS.REMOVE_WIRE.text, type: ACTIONS.REMOVE_WIRE.type,
        conditions: ["IN_WIRE"],
        targetingKey: "NONE",
        instructionKey: "PLAY_ANY_MOVE_TEMP",
        postActionInstructionKey: "DISCARD_MOVE_CARD",
        displayTriggerTextKeys: ["IN_WIRE","HAS_MOVE_CARD"]
    },
    ENTRENCH: {
        text: ACTIONS.ENTRENCH.text, type: ACTIONS.ENTRENCH.type,
        conditions: ["IN_ENTRENCHMENT_TERRAIN","IS_NOT_ENTRENCHED","IS_DEFENDER"],
        targetingKey: "NONE",
        instructionKey: "DRAW_RNC",
        postActionInstructionKey: "ENTRENCH_RESULT",
        displayTriggerTextKeys: ["IN_ENTRENCHMENT_TERRAIN","IS_NOT_ENTRENCHED"]
    },
    FIX_WEAPON: {
        text: ACTIONS.FIX_WEAPON.text, type: ACTIONS.FIX_WEAPON.type,
        conditions: ["WEAPON_MALFUNCTIONED_ANY"],
        targetingKey: "TARGET_WEAPON",
        instructionKey: "DRAW_RNC",
        postActionInstructionKey: "FIX_WEAPON_RESULT",
        displayTriggerTextKeys: ["WEAPON_MALFUNCTIONED_ANY"]
    },
    ACQUIRE_WEAPON: {
        text: ACTIONS.ACQUIRE_WEAPON.text, type: ACTIONS.ACQUIRE_WEAPON.type,
        conditions: ["NEARBY_WEAPON_AVAILABLE"],
        targetingKey: "TARGET_WEAPON",
        instructionKey: "DRAW_RNC",
        postActionInstructionKey: "ACQUIRE_WEAPON_RESULT",
        displayTriggerTextKeys: ["NEARBY_WEAPON_AVAILABLE"]
    },
    CHANGE_CREW: {
        text: ACTIONS.CHANGE_CREW.text, type: ACTIONS.CHANGE_CREW.type,
        conditions: ["NEEDS_CREW_OR_CREW_PINNED"],
        targetingKey: "TARGET_CREWMAN_NEEDED",
        instructionKey: "CHANGE_CREW_DESIGNATE_REMOVE",
        postActionInstructionKey: "CHANGE_CREW_RESULT",
        displayTriggerTextKeys: ["NEEDS_CREW_OR_CREW_PINNED"]
    },
    TRANSFER_IND: {
        text: ACTIONS.TRANSFER_IND.text, type: ACTIONS.TRANSFER_IND.type,
        conditions: ["SITUATIONAL_PLAYER_JUDGEMENT"],
        targetingKey: "TARGET_ADJ_GROUP_LOWEST_ID",
        instructionKey: "TRANSFER_PLAY_MOVE_DISCARD",
        postActionInstructionKey: "TRANSFER_IND_RESULT",
        displayTriggerTextKeys: ["SITUATIONAL_PLAYER_JUDGEMENT"]
    },
    BANZAI: {
        text: ACTIONS.BANZAI.text, type: ACTIONS.BANZAI.type,
        conditions: ["HAS_MOVE_CARD", "IS_JAPANESE", "!PINNED_LEADER", "PINNED_ANY"],
        targetingKey: "NONE",
        instructionKey: "PLAY_ANY_MOVE_TEMP",
        postActionInstructionKey: "BANZAI_POST",
        displayTriggerTextKeys: ["HAS_MOVE_CARD", "NOT_PINNED_LEADER"]
    },
    HOLD: {
        text: ACTIONS.HOLD.text, type: ACTIONS.HOLD.type,
        conditions: ["ALWAYS_TRUE"],
        targetingKey: "NONE",
        instructionKey: "PROCEED_TO_DISCARD",
        postActionInstructionKey: "HOLD_DISCARD_OPTIONAL",
        displayTriggerTextKeys: ["ALWAYS_TRUE"]
    },
    LAY_SMOKE: {
        text: ACTIONS.LAY_SMOKE.text, type: ACTIONS.LAY_SMOKE.type,
        conditions: ["HAS_SMOKE_CARD", "!IN_MINEFIELD", "!PINNED_LEADER" ],
        targetingKey: "TARGET_OWN_GROUP",
        instructionKey: "LAY_SMOKE_PLAYER_CHOICE",
        postActionInstructionKey: "DISCARD_SMOKE_DRAW",
        displayTriggerTextKeys: ["HAS_SMOKE_CARD"]
    },
    FIRE_DEF: {
        text: ACTIONS.FIRE_DEF.text, type: ACTIONS.FIRE_DEF.type,
        conditions: ["HAS_FIRE_CARD", "PLAYER_AT_RR_4_OR_5"],
        targetingKey: "FIRE_STD_STR_DEF",
        instructionKey: "FIRE_PLAYER_CHOICE",
        postActionInstructionKey: "DISCARD_FIRE_DRAW",
        displayTriggerTextKeys: ["HAS_FIRE_CARD", "PLAYER_AT_RR_4_OR_5"]
    },
    FIRE_CLOSE_THREAT: {
        text: ACTIONS.FIRE_CLOSE_THREAT.text, type: ACTIONS.FIRE_CLOSE_THREAT.type,
        conditions: ["HAS_FIRE_CARD", "PLAYER_AT_RR_4_OR_5"],
        targetingKey: "FIRE_CAU_STR_CLOSE",
        instructionKey: "FIRE_PLAYER_CHOICE_CLOSE_THREAT",
        postActionInstructionKey: "DISCARD_FIRE_DRAW",
        displayTriggerTextKeys: ["HAS_FIRE_CARD", "PLAYER_AT_RR_4_OR_5"]
    },
    INFILTRATE_MORALE: {
        text: ACTIONS.INFILTRATE_MORALE.text, type: ACTIONS.INFILTRATE_MORALE.type,
        conditions: ["IS_NOT_MOVING", "!PINNED_ANY", "!IN_MINEFIELD", "!IN_WIRE", "IS_ATTACKER"],
        targetingKey: "INFILTRATE",
        instructionKey: "DRAW_RNC",
        postActionInstructionKey: "INFILTRATION_ATTEMPT_MORALE",
        displayTriggerTextKeys: ["!PINNED_ANY", "PLAYER_AT_RR_5"]
     },
     INFILTRATE_MOVE: {
        text: ACTIONS.INFILTRATE_MOVE.text, type: ACTIONS.INFILTRATE_MOVE.type,
        conditions: ["PLAYER_AT_RR_5", "IS_NOT_MOVING", "!PINNED_ANY", "!IN_MINEFIELD", "!IN_WIRE", "IS_ATTACKER"],
        targetingKey: "INFILTRATE",
        instructionKey: "INFILTRATE_PLAY_MOVE_CARD",
        postActionInstructionKey: "INFILTRATION_ATTEMPT_MOVE",
        displayTriggerTextKeys: ["HAS_MOVE_CARD", "PLAYER_AT_RR_5"]
     },
};

const DISCARD_ACTION_DEFINITIONS = {
    DISCARD_TERRAIN_ON_ENEMY: {
        actionKey: "DISCARD_TERRAIN_ON_ENEMY",
        text: "Discard Terrain Card",
        type: "Discard",
        targetingKey: ["TARGET_ENEMY_GROUP_MOVING", "PLACE_TERRAIN_ENEMY_CARD_PRIORITY"],
        conditions: ["HAS_TERRAIN_CARD"],
        instructionKey: "PLACE_TERRAIN_ENEMY",
        postActionInstructionKey: "PLACE_TERRAIN_CHECK",
        displayTriggerTextKeys: ["HAS_TERRAIN_CARD"]
    },
    DISCARD_SNIPER: {
        actionKey: "DISCARD_SNIPER",
        text: "Discard Sniper Card",
        type: "Discard",
        targetingKey: ["TARGET_ENEMY_GROUP_SNIPER"],
        conditions: ["HAS_SNIPER_CARD"],
        instructionKey: "PLAY_SNIPER_CARD",
        postActionInstructionKey: "DISCARD_SNIPER_CARD",
        displayTriggerTextKeys: ["HAS_SNIPER_CARD"]
    },
    NO_DISCARD_ACTION: {
        actionKey: "NO_DISCARD_ACTION",
        text: "No Discard Action",
        type: "Discard",
        targetingKey: ["NONE"],
        conditions: ["ALWAYS_TRUE"],
        instructionKey: "DISCARD_NO_ACTION",
        postActionInstructionKey: "END_DISCARD_PHASE",
        displayTriggerTextKeys: ["ALWAYS_TRUE"]
    }
};

// PRIORITY_COLORS is no longer used, colors are handled by CSS classes.

const slaPriorities = {
    Line: {
        Effective: [
            { actionRef: "RALLY_ALL",           rncCondition: {},                                priority: 0 },
            { actionRef: "RALLY_NUM",           rncCondition: {},                                priority: 0 },
            { actionRef: "PLACE_TERRAIN_SELF",  rncCondition: { red: "ANY" },                    priority: 0 },
            { actionRef: "FIRE_HIGH_OPP",       rncCondition: { black: ["0...1"] },              priority: 2 },
            { actionRef: "FIRE_OPP",            rncCondition: { black: ["2...6"] },              priority: 0 },
            { actionRef: "FIRE_GEN",            rncCondition: { red: "ANY" },                    priority: 0 },
            { actionRef: "INFILTRATE_MOVE",     rncCondition: {},                                priority: 0 },
            { actionRef: "INFILTRATE_MORALE",   rncCondition: { black: "ANY" },                  priority: 0 },
            { actionRef: "MOVE_FLANK",          rncCondition: { black: ["2...6"] },              priority: 0 },
            { actionRef: "MOVE_ADVANCE",        rncCondition: { black: "ANY", red: ["0...2"] },  priority: 0 },
            { actionRef: "MOVE_OBJECTIVE",      rncCondition: {},                                priority: 3 },
            { actionRef: "LAY_SMOKE",           rncCondition: { black: "ANY" },                  priority: 0 },
            { actionRef: "ENTRENCH",            rncCondition: { red: ["2...6"] },                priority: 0 },
            { actionRef: "FIX_WEAPON",          rncCondition: {},                                priority: 0 },
            { actionRef: "ACQUIRE_WEAPON",      rncCondition: {},                                priority: 0 },
            { actionRef: "CHANGE_CREW",         rncCondition: {},                                priority: 0 },
            { actionRef: "TRANSFER_IND",        rncCondition: {},                                priority: 0 },
            { actionRef: "PLACE_TERRAIN_SELF",  rncCondition: {},                                priority: 0 },
            { actionRef: "HOLD",                rncCondition: {},                                priority: 0 }
        ],
        Stressed: [
            { actionRef: "REMOVE_MINEFIELD",    rncCondition: {},                                priority: 0 },
            { actionRef: "EXIT_MINEFIELD",      rncCondition: {},                                priority: 0 },
            { actionRef: "REMOVE_WIRE",         rncCondition: {},                                priority: 2 },
            { actionRef: "BANZAI",              rncCondition: {},                                priority: 3 },
            { actionRef: "RALLY_ALL",           rncCondition: {},                                priority: 0 },
            { actionRef: "RALLY_NUM",           rncCondition: {},                                priority: 0 },
            { actionRef: "PLACE_TERRAIN_SELF",  rncCondition: {},                                priority: 0 },
            { actionRef: "MOVE_RETREAT",        rncCondition: {},                                priority: 0 },
            { actionRef: "MOVE_RETREAT_SIDEWAYS", rncCondition: { red: ["2...6"] },              priority: 0 },
            { actionRef: "LAY_SMOKE",           rncCondition: {},                                priority: 0 },
            { actionRef: "FIX_WEAPON",          rncCondition: {},                                priority: 0 },
            { actionRef: "ENTRENCH",            rncCondition: { red: ["4...6"] },                priority: 0 },
            { actionRef: "FIRE_DEF",            rncCondition: {},                                priority: 0 },
            { actionRef: "FIRE_CLOSE_THREAT",   rncCondition: { red: ["3...6"] },                priority: 0 },
            { actionRef: "MOVE_CAUTIOUS",       rncCondition: {},                                priority: 0 },
            { actionRef: "HOLD",                rncCondition: {},                                priority: 0 }
        ]
    }
};

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

slaPriorities["Second Line"]     = deepCopy(slaPriorities.Line);
slaPriorities["Partisans (Rus)"] = deepCopy(slaPriorities.Line);
// slaPriorities["Marines (US)"]    = deepCopy(slaPriorities.Elite);    // TODO: Add Green and Elite when Line actions are solidified

const NATIONS = {
    GERMAN: 'Germany', AMERICAN: 'America', RUSSIAN: 'Russia',
    BRITISH: 'Britain', JAPANESE: 'Japan', FRENCH: 'France', ITALIAN: 'Italy'
};

window.concealmentCardData = [
    { value: -1, count: 6, usableBy: [NATIONS.GERMAN, NATIONS.AMERICAN, NATIONS.RUSSIAN, NATIONS.BRITISH, NATIONS.JAPANESE, NATIONS.FRENCH, NATIONS.ITALIAN], id: "C-1_all"},
    { value: -1, count: 4, usableBy: [NATIONS.RUSSIAN, NATIONS.BRITISH, NATIONS.FRENCH], id: "C-1_RBF" },
    { value: -1, count: 2, usableBy: [NATIONS.GERMAN, NATIONS.AMERICAN, NATIONS.RUSSIAN, NATIONS.BRITISH, NATIONS.JAPANESE, NATIONS.FRENCH], id: "C-1_noIT" },
    { value: -2, count: 3, usableBy: [NATIONS.GERMAN, NATIONS.AMERICAN, NATIONS.RUSSIAN, NATIONS.BRITISH, NATIONS.JAPANESE, NATIONS.FRENCH, NATIONS.ITALIAN], id: "C-2_all" },
    { value: -2, count: 1, usableBy: [NATIONS.RUSSIAN, NATIONS.BRITISH, NATIONS.FRENCH], id: "C-2_RBF" },
    { value: -2, count: 1, usableBy: [NATIONS.GERMAN, NATIONS.JAPANESE, NATIONS.BRITISH, NATIONS.FRENCH, NATIONS.RUSSIAN], id: "C-2_noUSIT" },
    { value: -3, count: 2, usableBy: [NATIONS.GERMAN, NATIONS.AMERICAN, NATIONS.RUSSIAN, NATIONS.BRITISH, NATIONS.JAPANESE, NATIONS.FRENCH, NATIONS.ITALIAN], id: "C-3_all" },
];

window.totalDeckSize = 162;
