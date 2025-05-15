document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded. Initializing Util Tab...");

    // --- Relative Range Calculator ---
    // Select all elements with the class 'range-number-button'
    const rangeButtons = document.querySelectorAll('.range-number-button');
    // Select the div where the result will be displayed
    const relativeRangeResultDiv = document.getElementById('relativeRangeResult');
    // Select the paragraph where the explanation will be displayed (specific to utilContent)
    const relativeRangeExplanationP = document.querySelector('#utilContent .util-explanation');

    // Store selected value for group 1, defaulting to '0'
    let selectedRangeGroup1 = '0';
    // Store selected value for group 2, defaulting to '0'
    let selectedRangeGroup2 = '0';

    // Function to set the initial 'selected' class on the default buttons (data-value="0")
    function setInitialRangeSelection() {
        const defaultButton1 = document.querySelector('.range-number-button[data-group="1"][data-value="0"]');
        const defaultButton2 = document.querySelector('.range-number-button[data-group="2"][data-value="0"]');

        if (defaultButton1) {
            defaultButton1.classList.add('selected');
        } else {
            console.warn("Could not find the default button for Group 1 (data-value='0').");
        }
        if (defaultButton2) {
            defaultButton2.classList.add('selected');
        } else {
            console.warn("Could not find the default button for Group 2 (data-value='0').");
        }
    }


    function calculateAndDisplayRelativeRange() {
        // No need to check for null anymore as they default to '0'
        // if (selectedRangeGroup1 === null || selectedRangeGroup2 === null) { ... } // REMOVED

        // Ensure values are numbers. parseInt handles negative strings correctly.
        const range1 = parseInt(selectedRangeGroup1, 10);
        const range2 = parseInt(selectedRangeGroup2, 10);

		// Calculate the sum of the two range chits
		const sum = range1 + range2;
		// According to the rules, if the sum exceeds 5, subtract it from 10.
        // This rule applies to the sum itself, regardless of whether inputs were negative.
		const trueRelativeRange = (sum > 5) ? (10 - sum) : sum;

        // Update the result display
        relativeRangeResultDiv.innerHTML = `<strong>Relative Range: ${trueRelativeRange}</strong>`;
        // Update the explanation
        relativeRangeExplanationP.innerHTML = `Calculation: ${range1} + ${range2} = ${sum}${(sum > 5) ? `, adjusted to 10 - ${sum} = ${trueRelativeRange}` : ''}.`;

        // Ensure display elements are visible (they are hidden by default in the old logic if null)
        relativeRangeResultDiv.style.display = 'block';
        relativeRangeExplanationP.style.display = 'block';
    }

    function handleRangeButtonClick(event) {
        const clickedButton = event.target;

        // Ensure it's a button we care about
        if (!clickedButton.classList.contains('range-number-button')) {
            return;
        }

        const group = clickedButton.dataset.group; // '1' or '2'
        const value = clickedButton.dataset.value; // Can now be '-3' to '8'

        // --- Update State ---
        if (group === '1') {
            selectedRangeGroup1 = value;
        } else if (group === '2') {
            selectedRangeGroup2 = value;
        } else {
             console.warn(`Range button clicked with unknown group: ${group}`);
             return; // Exit if group is invalid
        }


        // --- Update Visual Selection ---
        // 1. Find all buttons belonging to the *same* group
        const groupButtons = document.querySelectorAll(`.range-number-button[data-group="${group}"]`);
        // 2. Remove 'selected' class from all buttons in that group
        groupButtons.forEach(btn => btn.classList.remove('selected'));
        // 3. Add 'selected' class to the *clicked* button
        clickedButton.classList.add('selected');

        // --- Recalculate and Display ---
        calculateAndDisplayRelativeRange();
    }

    // Check if the required elements exist before adding listeners and performing logic
    if (rangeButtons.length > 0 && relativeRangeResultDiv && relativeRangeExplanationP) {
        // Add a single click listener to each button
        rangeButtons.forEach(button => {
            button.addEventListener('click', handleRangeButtonClick);
        });

        // Set the initial visual selection to the '0' buttons
        setInitialRangeSelection();

        // Perform the initial calculation based on the default '0' values
        calculateAndDisplayRelativeRange();

        console.log("Relative Range Calculator logic attached (range -3 to 8, default 0).");

    } else {
         console.warn("Could not find all required elements for the Relative Range Calculator in util.js. Check HTML structure.");
         if (rangeButtons.length === 0) console.warn("Missing: .range-number-button elements (ensure they have data-group and data-value)");
         if (!relativeRangeResultDiv) console.warn("Missing: element with id 'relativeRangeResult'");
         if (!relativeRangeExplanationP) console.warn("Missing: element matching selector '#utilContent .util-explanation'");
    }

    console.log("Util Tab Initialization complete.");

});