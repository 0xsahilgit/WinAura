/* main.js */

// Simulated predictions data for the MVP (simulate a day's games)
// Now we use distinct placeholder images for each team.
const simulatedPredictions = [
    {
      id: "1",
      title: "Featured Matchup",
      home: { name: "Team A", logo: "https://via.placeholder.com/50?text=A" },
      away: { name: "Team B", logo: "https://via.placeholder.com/50?text=B" },
      homeAvgLast5: 85,
      homeH2H: 88,
      awayAvgLast5: 80,
      awayH2H: 78,
      matchDate: "2025-03-25T18:00:00"
    },
    {
      id: "2",
      title: "Upcoming Matchup",
      home: { name: "Team C", logo: "https://via.placeholder.com/50?text=C" },
      away: { name: "Team D", logo: "https://via.placeholder.com/50?text=D" },
      homeAvgLast5: 78,
      homeH2H: 80,
      awayAvgLast5: 82,
      awayH2H: 81,
      matchDate: "2025-03-26T20:00:00"
    },
    {
      id: "3",
      title: "Another Matchup",
      home: { name: "Team E", logo: "https://via.placeholder.com/50?text=E" },
      away: { name: "Team F", logo: "https://via.placeholder.com/50?text=F" },
      homeAvgLast5: 90,
      homeH2H: 87,
      awayAvgLast5: 88,
      awayH2H: 89,
      matchDate: "2025-03-27T19:00:00"
    },
    {
      id: "4",
      title: "Midday Matchup",
      home: { name: "Team G", logo: "https://via.placeholder.com/50?text=G" },
      away: { name: "Team H", logo: "https://via.placeholder.com/50?text=H" },
      homeAvgLast5: 83,
      homeH2H: 80,
      awayAvgLast5: 84,
      awayH2H: 82,
      matchDate: "2025-03-25T20:30:00"
    },
    {
      id: "5",
      title: "Late Matchup",
      home: { name: "Team I", logo: "https://via.placeholder.com/50?text=I" },
      away: { name: "Team J", logo: "https://via.placeholder.com/50?text=J" },
      homeAvgLast5: 77,
      homeH2H: 75,
      awayAvgLast5: 79,
      awayH2H: 76,
      matchDate: "2025-03-25T22:00:00"
    }
  ];
  
  // Global variable to store fetched data.
  let fetchedData = [];
  
  // Simulate a network request that "fetches" today's predictions data.
  function simulateFetchPredictions() {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(simulatedPredictions);
      }, 1000); // Simulate a 1-second delay
    });
  }
  
  /**
   * Computes the prediction for a single game.
   * It calculates an ELO-like rating for each team based on:
   *   - 70% weight for average points in the last 5 games
   *   - 30% weight for average points in head-to-head matchups
   * Then it uses a logistic function to convert the difference to a win probability.
   * The win probability becomes the confidence score (as a percentage).
   * The probability is then converted to implied American moneyline odds.
   *
   * @param {Object} game - The game data.
   * @returns {Object} The computed prediction with predictedWinner, confidence, moneyline, and game details.
   */
  function computePrediction(game) {
    // Calculate ELO-like ratings
    const eloHome = 0.7 * game.homeAvgLast5 + 0.3 * game.homeH2H;
    const eloAway = 0.7 * game.awayAvgLast5 + 0.3 * game.awayH2H;
    const diff = eloHome - eloAway;
    const D = 5; // scaling factor for sensitivity
    const rawProb = 1 / (1 + Math.exp(-diff / D));
  
    // Determine predicted winner and win probability.
    let predictedWinner, winProb;
    if (rawProb >= 0.5) {
      predictedWinner = game.home.name;
      winProb = rawProb;
    } else {
      predictedWinner = game.away.name;
      winProb = 1 - rawProb;
    }
    
    // Convert win probability to American odds.
    let moneyline;
    if (winProb >= 0.5) {
      moneyline = -Math.round((winProb / (1 - winProb)) * 100);
    } else {
      moneyline = Math.round(((1 - winProb) / winProb) * 100);
    }
    
    // Confidence score as a percentage.
    const confidence = winProb * 100;
    
    return {
      predictedWinner,
      confidence,
      moneyline,
      title: game.title,
      home: game.home,
      away: game.away,
      matchDate: game.matchDate
    };
  }
  
  /**
   * Processes all fetched games:
   * 1. Computes predictions for each game.
   * 2. Filters out any predictions where the favorite's implied moneyline is worse than -200.
   * 3. Sorts the remaining predictions by confidence (descending).
   * 4. Returns the top 3 predictions.
   *
   * @param {Array} games - Array of game data.
   * @returns {Array} Top 3 prediction objects.
   */
  function processPredictions(games) {
    // Compute prediction for each game.
    let predictions = games.map(game => computePrediction(game));
    
    // Filter out predictions where the favorite (if indicated by a negative moneyline)
    // is too heavy (moneyline < -200).
    predictions = predictions.filter(pred => {
      if (pred.moneyline < 0 && pred.moneyline < -200) {
        return false;
      }
      return true;
    });
    
    // Sort by confidence score in descending order.
    predictions.sort((a, b) => b.confidence - a.confidence);
    
    // Return the top 3 predictions.
    return predictions.slice(0, 3);
  }
  
  /**
   * Updates the UI by clearing the main container and re-rendering prediction cards
   * for each prediction in the provided array.
   *
   * @param {Array} predictions - Array of prediction objects.
   */
  function updateMatchupCards(predictions) {
    // Get the main container where cards will be rendered.
    const mainContainer = document.querySelector("main");
    
    // Clear the container.
    mainContainer.innerHTML = "";
    
    // Create a card for each prediction.
    predictions.forEach(pred => {
      const card = document.createElement("section");
      card.classList.add("matchup");
      
      card.innerHTML = `
        <h2>${pred.title}</h2>
        <div class="matchup-container">
          <div class="team team-a">
            <img src="${pred.home.logo}" alt="${pred.home.name} Logo" />
            <p>${pred.home.name}</p>
          </div>
          <div class="prediction">
            <p>Prediction: ${pred.predictedWinner} covers the spread (Confidence: ${Math.round(pred.confidence)}%)</p>
          </div>
          <div class="team team-b">
            <img src="${pred.away.logo}" alt="${pred.away.name} Logo" />
            <p>${pred.away.name}</p>
          </div>
        </div>
        <p class="match-details">Match Date & Time: ${new Date(pred.matchDate).toLocaleString()}</p>
      `;
      
      mainContainer.appendChild(card);
    });
  }
  
  // Event listener for "Fetch Data" button.
  document.getElementById("fetch-data-btn").addEventListener("click", async () => {
    // Show loading indicator.
    document.getElementById("loading").classList.remove("hidden");
    
    // Simulate fetching data.
    fetchedData = await simulateFetchPredictions();
    
    // Hide loading indicator.
    document.getElementById("loading").classList.add("hidden");
    
    alert("Data fetched successfully! Now click 'Compute Predictions'.");
  });
  
  // Event listener for "Compute Predictions" button.
  document.getElementById("compute-predictions-btn").addEventListener("click", () => {
    if (!fetchedData.length) {
      alert("Please fetch data first.");
      return;
    }
    
    // Process the predictions: compute, filter, sort, and select the top 3.
    const topPredictions = processPredictions(fetchedData);
    
    // Update the UI with these top predictions.
    updateMatchupCards(topPredictions);
  });
  