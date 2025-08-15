document.addEventListener("DOMContentLoaded", function () {
    let currentPlayer = 1;
    let players = { 1: { name: "", points: 0 }, 2: { name: "", points: 0 } };
    let deck = [
        { text: "Card 1" },
        { text: "Card 2" },
        { text: "Card 3" },
        { text: "Card 4" },
    ];
    let usedCards = [];
    let wonCards = [];

    const player1NameEl = document.getElementById("player1-name");
    const player2NameEl = document.getElementById("player2-name");
    const player1PointsEl = document.getElementById("player1-points");
    const player2PointsEl = document.getElementById("player2-points");
    const cardModal = document.getElementById("cardModal");
    const cardContent = document.getElementById("cardContent");
    const turnIndicator = document.getElementById("turn-indicator");

    // Handle registration save
    document.getElementById("savePlayersBtn").addEventListener("click", function () {
        players[1].name = document.getElementById("player1-input").value || "Player 1";
        players[2].name = document.getElementById("player2-input").value || "Player 2";

        player1NameEl.textContent = players[1].name;
        player2NameEl.textContent = players[2].name;

        document.getElementById("registrationModal").style.display = "none";
        updateTurnIndicator();
    });

    // Deck click
    document.getElementById("deck").addEventListener("click", function () {
        if (deck.length === 0) {
            alert("No more cards!");
            return;
        }
        let card = deck.pop();
        cardContent.textContent = card.text;
        cardModal.style.display = "block";
    });

    // Pass button
    document.getElementById("passBtn").addEventListener("click", function () {
        usedCards.push(cardContent.textContent);
        cardModal.style.display = "none";
        nextTurn();
    });

    // Done button
    document.getElementById("doneBtn").addEventListener("click", function () {
        players[currentPlayer].points += 1;
        updatePoints();
        wonCards.push(cardContent.textContent);
        cardModal.style.display = "none";
        nextTurn();
    });

    // Helpers
    function updatePoints() {
        player1PointsEl.textContent = players[1].points;
        player2PointsEl.textContent = players[2].points;
    }

    function nextTurn() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateTurnIndicator();
    }

    function updateTurnIndicator() {
        turnIndicator.textContent = `${players[currentPlayer].name}'s turn`;
    }
});
