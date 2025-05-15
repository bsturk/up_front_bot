# Up Front SLA (Squad Leader Automa) Web Applet

![SLA Logo Placeholder](YOUR_APP_LOGO_OR_A_GENERIC_UP_FRONT_IMAGE.png)

Welcome to the Up Front - Squad Leader Automa (SLA) web applet! This tool is designed to help solo players manage the AI opponent (SLA) in the board game "Up Front," automating many of the decision-making processes for an opponent.

## 🚀 Features

*   **Action Determination:** Guides you through SLA activation, status calculation, and action selection based on the game's automa rules.
*   **Dynamic Priority Lists:** Shows applicable actions for the SLA group based on its current state (Effective/Stressed) and the drawn RNC value.
*   **Discard Phase Management:** Helps track and select discard actions.
*   **Group Setup:** Optionally generate opponent group composition.
*   **Game Utilities:** Includes tools like a Relative Range Calculator.
*   **Data-Driven:** Loads specific nationality and scenario data.

## 🛠️ Getting Started

1.  **Open the App:** Simply open the `index.html` file in a modern web browser (Chrome, Firefox, Edge, Safari). JavaScript must be enabled.
2.  **Data Loading:** The app will automatically attempt to load necessary game data files.

## 📖 How to Use

The applet is divided into three main tabs: **Group Setup**, **Game Actions**, and **Game Util**.

### 1. Group Setup Tab (Optional)

This tab helps you generate the initial SLA groups for a scenario. Using this is optional; you can manually set up SLA groups if you prefer.

*   **Scenario Selection:**
    1.  Choose the **Scenario** you are playing from the dropdown.
    2.  Select the **SLA Nationality** from the dropdown. This will also populate the Nationality on the "Game Actions" tab.
    3.  The **SLA Stance** dropdown will populate with available stances (Attacker/Defender) for the selected Nationality in that Scenario. Choose the appropriate one.
*   **Generate Groups:** Click the **"Generate Groups"** button.
*   **Results:** The "Generated SLA Groups" section will display the units assigned to each SLA group (A, B, C, D).

    `[img/SCREENSHOT_SETUP_TAB_FILLED_AND_RESULTS.png]`

### 2. Game Actions Tab (Main Gameplay)

This is the primary tab you'll use during the game to determine SLA actions.

#### A. Initial Setup (Each SLA Turn / Before First SLA Group Activation)

1.  **Global Settings (Top Bar):**
    *   **SLA Nationality:** Select the nationality of the SLA. If you used the "Group Setup" tab, this might already be selected.
    *   **Troop Quality:** Choose the troop quality (Line, Elite, etc.). This affects action priorities. (THIS IS NOT IMPLEMENTED YET)
    *   **Hand Size:** This will display automatically based on nationality and whether the SL is pinned/KIA.
    *   **SL Pinned/KIA:** Check this box if the acting SLA leader (SL or promoted ASL) is Pinned or KIA. This affects hand size and stability.
    *   **Nationality Notes:** Any special notes for the selected nationality will appear here.

    `[img/SCREENSHOT_GAME_ACTIONS_GLOBAL_SETTINGS.png]`

2.  **SLA Activation (As per game rules):**
    *   The app reminds you of the process: Draw SLA cards, use the leftmost card's RPN to determine the acting group, and use its RNC for the action calculations.
    *   **Crucially, select the RNC value of this leftmost card** in the "RNC of left-most revealed Action Card" section by clicking the corresponding number (Black or Red).

    `[img/SCREENSHOT_GAME_ACTIONS_RNC_SELECTOR.png]`

3.  **SLA Group Stability Inputs:**
    *   For the **currently acting SLA group**, fill in its status:
        *   **Pinned Units:** Number of pinned units in the group.
        *   **Terrain:** The terrain type the group occupies.
        *   **In Wire, Is Flanking, Is Entrenched, Is Flanked, Is Encircled, Is Moving:** Check applicable boxes.
    *   The **Status Display** (e.g., "Status: Effective", "Status: Stressed") will update automatically.

    `[img/SCREENSHOT_GAME_ACTIONS_STABILITY_INPUTS.png]`

#### B. Player Interaction with SLA (As it Happens)

*   **When Player fires at SLA Group:**
    *   Click **"Check Concealment"**. The result (e.g., "No Concealment", "Concealment (-2)") will be displayed.
*   **When Player places Terrain on SLA Group:**
    1.  Select the **Terrain Type** being placed from the dropdown.
    2.  Click **"Check Acceptance"**. The result will indicate if the SLA group accepts or refuses the terrain, along with any consequences.

    `[img/SCREENSHOT_GAME_ACTIONS_PLAYER_INTERACTION.png]`

#### C. SLA Group Action Selection

Once the RNC is selected and stability inputs are set:

1.  **Action Priority List:** The "<SLA Group> Action Selection" section will display a list of potential actions, prioritized according to the rules.
    *   Each item shows the **Action Type**, **Trigger Conditions**, **Targeting Priority**, and **Instruction**.
2.  **Select Action:** Carefully read down the list. **Click on the *first* valid action** that the SLA group can actually perform given the current game state (cards in hand, available targets, etc.).
3.  **Post-Action Steps:** After clicking an action:
    *   The selected action will be highlighted.
    *   Detailed **"Post-Action Steps (Main Action)"** will appear below it. Follow these steps.
    *   A button **"Done with Main Actions"** will appear.  Only click this after all SLA groups have activated.
    *   If not done with main actions, click go to the next SLA group and repeat the process.

    `[img/SCREENSHOT_GAME_ACTIONS_PRIORITY_LIST_AND_SELECTION.png]`

4.  **Proceed to Discard Phase:** Click **"Done with Main Actions"**.

#### D. Discard Action Phase

1.  **Discard Actions Remaining:** The system will show how many discard actions the SLA can take (based on nationality).
2.  **Discard Priority List:** A list of available discard actions will appear.
    *   **Click on a valid discard action** the SLA can perform, or click **"No Discard Action"** if none are applicable or desired.
3.  **Post-Action Steps:** Similar to the main action, **"Post-Action Steps (Discard Action)"** will appear. Follow them.
4.  **Continue or End:**
    *   If more discard actions are available and one was taken, the button will say **"Choose next Discard Action"**. Click it to refresh the discard list.
    *   If no more discards can be taken, or "No Discard Action" was chosen, the button will say **"End Discard Phase"**. Click it.

    `[img/SCREENSHOT_GAME_ACTIONS_DISCARD_PHASE.png]`

5.  **End of SLA Group Turn:** After clicking "End Discard Phase", the section will indicate the SLA group's turn is complete. Remember to move the rightmost SLA hand card to the leftmost position for the next SLA activation.
    *   If all SLA groups have activated, the main SLA turn is over.

### 3. Game Util Tab

This tab provides helpful utilities for playing the game.

#### Relative Range Calculator

1.  **Input Range Chits:** For two groups (SLA or Player), click the button corresponding to the value on each group's Range Chit (-3 to +8).
2.  **View Result:** The **Relative Range** will be calculated and displayed, along with the formula used.

    `[img/SCREENSHOT_UTIL_TAB_RANGE_CALCULATOR.png]`

## 💡 Tips

*   **Follow Game Rules:** This applet automates SLA decisions but assumes you are following all other "Up Front" game rules regarding movement, combat, card play, etc.
*   **Leftmost Card:** Always remember the importance of the leftmost SLA card for RPN (group activation) and RNC (action determination).
*   **Player Discretion:** If anything is ambiguous or isn't handled by this applet, use an RNC to choose.

---
