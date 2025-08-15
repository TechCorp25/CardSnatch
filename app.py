from flask import Flask, render_template, request, session, jsonify, redirect, url_for
from random import shuffle
from uuid import uuid4

app = Flask(__name__)
app.secret_key = "change-me-please-" + str(uuid4())  # replace with a fixed secret in production

# --- Helpers ---------------------------------------------------------------

def init_game():
    """Initialize a fresh game in the session."""
    # Example deck: replace with your own card data/content
    deck = [
        {"id": i+1, "title": f"Card {i+1}", "text": f"This is the content of card {i+1}."}
        for i in range(30)
    ]
    shuffle(deck)

    session.update({
        "players": [
            {"name": session.get("p1_name", "Player 1"), "score": 0},
            {"name": session.get("p2_name", "Player 2"), "score": 0},
        ],
        "turn": 0,  # index of current player: 0 or 1
        "deck": deck,
        "kept_stack": [],      # cards collected via "Done"
        "used_stack": [],      # cards discarded via "Pass"
    })


def game_ready():
    """Return True if both player names are set."""
    return bool(session.get("p1_name")) and bool(session.get("p2_name"))


# --- Routes ---------------------------------------------------------------

@app.route("/")
def index():
    if not game_ready():
        # ensure any previous game state is cleared until registration is complete
        session.clear()
        return render_template("index.html", show_registration=True)

    # If players exist but no game yet, initialize
    if "deck" not in session:
        init_game()

    return render_template(
        "index.html",
        show_registration=False,
        players=session.get("players", []),
        turn=session.get("turn", 0),
        deck_count=len(session.get("deck", [])),
        kept_count=len(session.get("kept_stack", [])),
        used_count=len(session.get("used_stack", [])),
    )


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or request.form
    p1 = (data.get("p1") or "Player 1").strip() or "Player 1"
    p2 = (data.get("p2") or "Player 2").strip() or "Player 2"

    session["p1_name"] = p1
    session["p2_name"] = p2

    # start a new game
    init_game()
    return jsonify({"ok": True, "redirect": url_for("index")})


@app.route("/next_card", methods=["POST"])  # draw the top card
def next_card():
    deck = session.get("deck", [])
    if not deck:
        return jsonify({"empty": True})

    card = deck.pop()  # top of the deck (end of list after shuffle)
    session["current_card"] = card
    session["deck"] = deck

    return jsonify({"empty": False, "card": card, "turn": session.get("turn", 0)})


@app.route("/action", methods=["POST"])  # handle Pass/Done
def action():
    payload = request.get_json(force=True)
    choice = payload.get("choice")  # 'pass' or 'done'
    turn = session.get("turn", 0)
    card = session.get("current_card")

    if not card:
        return jsonify({"ok": False, "message": "No active card."}), 400

    if choice == "done":
        # award a point and add to kept stack
        players = session.get("players", [])
        if players and 0 <= turn < len(players):
            players[turn]["score"] = int(players[turn].get("score", 0)) + 1
            session["players"] = players
        kept = session.get("kept_stack", [])
        kept.append(card)
        session["kept_stack"] = kept
    elif choice == "pass":
        used = session.get("used_stack", [])
        used.append(card)
        session["used_stack"] = used
    else:
        return jsonify({"ok": False, "message": "Invalid choice."}), 400

    # clear current card and switch turn
    session.pop("current_card", None)
    session["turn"] = 1 - int(turn)

    return jsonify({
        "ok": True,
        "players": session.get("players", []),
        "turn": session.get("turn", 0),
        "deck_count": len(session.get("deck", [])),
        "kept_count": len(session.get("kept_stack", [])),
        "used_count": len(session.get("used_stack", [])),
    })


@app.route("/reset", methods=["POST"])  # reset the whole game (keep names)
def reset():
    init_game()
    return jsonify({"ok": True})


if __name__ == "__main__":
    app.run(debug=True)
