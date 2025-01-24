// Function to fetch matchups (already implemented)
async function fetchMatchups() {
    const apiKey = '5c41897ac4msh2569d0758b6d11dp120209jsnd769e49e1e35'; // Your actual API key
    const url = 'https://betsapi2.p.rapidapi.com/v1/bet365/upcoming?sport_id=18';

    try {
        console.log("Fetching data...");
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'betsapi2.p.rapidapi.com',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Filter for only NCAAB games
        const ncaabGames = data.results.filter((game) => game.league?.name === "NCAAB");
        console.log("Filtered NCAAB Games:", ncaabGames);

        if (ncaabGames.length > 0) {
            updateMatchupCards(ncaabGames); // Pass filtered games to the update function
        } else {
            console.error("No NCAAB matchups found.");
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

// Function to update matchup cards
function updateMatchupCards(games) {
    console.log("Updating cards with games:", games);

    const matchups = document.querySelectorAll(".matchup");

    games.slice(0, matchups.length).forEach((game, index) => {
        const matchup = matchups[index];

        matchup.querySelector(".team-a p").textContent = game.home?.name || "Home Team";
        matchup.querySelector(".team-b p").textContent = game.away?.name || "Away Team";

        const matchDate = new Date(game.time * 1000);
        matchup.querySelector(".match-details").textContent = `Match Date & Time: ${matchDate.toLocaleString()}`;
    });
}

// Attach the fetch function to the button
document.getElementById("fetch-data-btn").addEventListener("click", fetchMatchups);
