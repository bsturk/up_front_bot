// main.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Tab Elements ---
    const gameTabButton = document.getElementById('tabGame');
    const setupTabButton = document.getElementById('tabSetup');
    const utilTabButton = document.getElementById('tabUtil'); // Ref needed for showing/hiding
    const gameContent = document.getElementById('gameContent');
    const setupContent = document.getElementById('setupContent');
    const utilContent = document.getElementById('utilContent'); // Ref needed for showing/hiding

    function showTab(tabToShow) {
        // Hide all content sections
        if(gameContent) gameContent.style.display = 'none';
        if(setupContent) setupContent.style.display = 'none';
        if(utilContent) utilContent.style.display = 'none'; // Hide Util Content

        // Remove active class from all buttons
        if(gameTabButton) gameTabButton.classList.remove('active');
        if(setupTabButton) setupTabButton.classList.remove('active');
        if(utilTabButton) utilTabButton.classList.remove('active'); // Deactivate Util Button

        // Show the selected tab content and mark button as active
        if (tabToShow === 'game' && gameContent && gameTabButton) {
            gameContent.style.display = 'block'; // Or 'grid' if it uses grid layout directly
            gameTabButton.classList.add('active');
        } else if (tabToShow === 'setup' && setupContent && setupTabButton) {
            setupContent.style.display = 'block'; // Or 'grid'
            setupTabButton.classList.add('active');
        } else if (tabToShow === 'util' && utilContent && utilTabButton) { // Handle Util Tab
            utilContent.style.display = 'block'; // Or 'grid'
            utilTabButton.classList.add('active');
        } else {
            console.warn(`Attempted to show unknown or unavailable tab: ${tabToShow}`);
             // Fallback: show the first tab if requested tab fails
             if (gameContent && gameTabButton) {
                gameContent.style.display = 'block';
                gameTabButton.classList.add('active');
             }
        }
    }

    // --- Add click listeners for Tab Buttons ---
    if(gameTabButton) gameTabButton.addEventListener('click', () => showTab('game'));
    if(setupTabButton) setupTabButton.addEventListener('click', () => showTab('setup'));
    if(utilTabButton) utilTabButton.addEventListener('click', () => showTab('util')); // Listener for Util Tab

    // --- Initialisation ---

    showTab('setup');

    console.log("Main tab script loaded, default tab shown.");
});