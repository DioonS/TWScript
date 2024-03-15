// Configuring twSDK library configuration
var scriptConfig = {
    scriptData: {
        prefix: 'FilteringTroopContinents',
        name: 'Filtering Troop by Continents',
        version: '1.0.0',
        author: 'DioonS',
        authorUrl: 'https://www.github.com/DioonS/',
    },
    translations: {
        en: {
            filterContinent: 'Filter Continent',
            onTheWay: 'On the way',
            errorMessage: "This script is intended to run on the 'Ally' screen."
        },
        pt_PT: {
            filterContinent: 'Filtrar Continente',
            onTheWay: 'A Caminho',
            errorMessage: "Este script destina-se a ser executado na tela 'Ally'."
        },
        pt_BR: {
            filterContinent: 'Filtrar Continente',
            onTheWay: 'A Caminho',
            errorMessage: "Este script destina-se a ser executado na tela 'Ally'."
        }
    },
    allowedScreens: ['ally'], // Add the screens where the script will be allowed
    isDebug: false, // Set to true if you want to enable debug mode
};

// Determining language automatically based on browser
var language = navigator.language.substring(0, 2);

// Checks if the language is supported by scriptConfig
if (!(language in scriptConfig.translations)) {
    // If the language is not supported, set it to English as the default
    language = 'en';
}

// URL base
var baseUrl = window.location.origin + '/game.php?';

/**
 * Function to initialize the script SDK and display K numbers.
 * Checks if the current screen is 'ally'. If not, shows an error message and redirects to the correct screen.
 * Extracts unique K numbers from links on the page and displays them.
 * Makes the displayed K numbers clickable to filter links based on the clicked K number.
 */
async function initializeSDK() {
    // Check if the current screen is 'ally'
    if (window.game_data.screen !== 'ally') {
        // If not, show an error message and redirect to the correct screen
        UI.InfoMessage(scriptConfig.translations[language].errorMessage, 3000, "success");
        
        // Dynamic Redirect to the correct screen
        var redirectUrl = baseUrl + $.param({
            village: window.game_data.village.id,
            screen: 'ally',
            mode: 'members_defense'
        });
        window.location.href = redirectUrl;
        
        return; // Exit the function
    }

    try {
        // Proceed with twSDK initialization
        await $.getScript(`https://twscripts.dev/scripts/twSDK.js`);
        twSDK.init(scriptConfig).then(function () {
            displayKNumbers();
        });
    } catch (error) {
        console.error('Error loading twSDK:', error);
        UI.InfoMessage('Error loading twSDK', 3000, 'error');
    }
}

/**
 * Extracts unique K numbers from links on the page.
 * Returns an array of unique K numbers found on the page.
 * If no K numbers are found, displays an error message.
 * @returns {string[]} Array of unique K numbers found on the page
 */
function extractKNumbers() {
    // Store the K's found
    var uniqueKNumbers = {};
    $('a').each(function() {
        var linkText = $(this).text();
        // Regex to find K numbers in link text
        var regex = /K(\d+)/;
        // Check if the link text contains the pattern of K followed by numbers
        var match = linkText.match(regex);
        if (match) {
            // Add the found K number to the object
            uniqueKNumbers[match[1]] = true;
        }
    });

    // Array of K's found
    var kNumbers = Object.keys(uniqueKNumbers);
    if (kNumbers.length === 0) {
        UI.InfoMessage(scriptConfig.translations[language].errorMessage, 3000, 'info'); // Corrected to display the correct translation
    }
    return kNumbers;
}

/**
 * Filters page links based on the clicked K.
 * Shows only links and related <tr> elements that contain the clicked K number.
 * @param {string} kNumber The K number clicked by the user
 */
function filterByKNumber(kNumber) {
    // Check if the clicked K number exists on the page
    if ($('.vis.w100 a:contains("K' + kNumber + '")').length === 0) {
        UI.InfoMessage('K' + kNumber + ' not found on the page', 3000, 'info');
        return;
    }

    // Show all links and related <tr> elements only within table with class 'vis w100'
    $('.vis.w100 tr').show();

    // Hide links and <tr> elements that do not contain the clicked K's within the table with class 'vis w100'
    $('.vis.w100 a').each(function() {
        var $link = $(this);
        var $tr = $link.closest('tr');
        
        // Check if the current link matches the selected K
        if ($link.text().includes("K" + kNumber)) {
            // If it matches, show the link and related <tr> elements
            $tr.show();
        } else {
            // If it doesn't match, hide the link and related <tr> elements
            $tr.hide();
        }
    });
}

/**
 * Displays K's on the page and makes them clickable to filter links.
 * Checks if K's are already displayed to avoid duplication.
 */
function displayKNumbers() {
    // Check if K numbers are already displayed
    if ($('#kNumbers').length > 0) {
        return; // If already displayed, exit the function
    }

    // Extract unique K's from links on the page
    var foundNumbers = extractKNumbers();

    // Build the content to showcase the K's
    var kContent = '<div id="kNumbers"><h3 style="font-family: Verdana, sans-serif; font-size: 30px; color: #603000; text-align: center; font-weight: bold;">' + scriptConfig.translations[language].filterContinent + '</h3>';
    kContent += '<p style="text-align: center;">';
    foundNumbers.forEach(function(kNumber) {
        kContent += '<span class="kNumber" data-number="' + kNumber + '" style="cursor: pointer; font-family: Verdana, sans-serif; font-size: 20px; color: #603000; font-weight: bold; transition: color 0.3s;">K' + kNumber + '</span> ';
    });
    kContent += '</p></div>';

    // Insert content above the "ally_content" div
    $('#ally_content').before(kContent);

    // Add hover effect to K's
    $('.kNumber').hover(
        function() {
            $(this).css('color', '#906050');
        },
        function() {
            $(this).css('color', '#603000');
        }
    );

    // Add click event to K's to filter links
    $('.kNumber').click(function() {
        var kNumber = $(this).data('number');
        filterByKNumber(kNumber);
    });
}

// Display K's after page load
$(document).ready(function() {
    displayKNumbers();
});

// Initialize twSDK library and display K's upon successful initialization
initializeSDK();
