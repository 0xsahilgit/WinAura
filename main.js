async function fetchMatchups() {
    const apiKey = '5c41897ac4msh2569d0758b6d11dp120209jsnd769e49e1e35'; // Replace with your actual API key
    const url = 'https://betsapi2.p.rapidapi.com/v1/bet365/upcoming?sport=NCAAB';

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': apiKey,
                'X-RapidAPI-Host': 'betsapi2.p.rapidapi.com'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data); // Check the structure of the API response in the browser console
        updateMatchupCards(data.results); // Call function to update HTML with data
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

function updateMatchupCards(games) {
    // Select all matchup sections
    const matchups = document.querySelectorAll('.matchup');

    // Populate each matchup card with API data
    games.slice(0, matchups.length).forEach((game, index) => {
        const matchup = matchups[index];
        matchup.querySelector('.team-a p').textContent = game.teamA.name || 'Team A';
        matchup.querySelector('.team-b p').textContent = game.teamB.name || 'Team B';
        matchup.querySelector('.prediction p').textContent = `${(game.teamA.winProb * 100).toFixed(1)}%` || '70%';
        matchup.querySelector('.match-details').textContent = `Match Date & Time: ${new Date(game.date).toLocaleString()}` || 'MM/DD HH:MM';
    });
}

// Fetch matchups when the page loads
fetchMatchups();
