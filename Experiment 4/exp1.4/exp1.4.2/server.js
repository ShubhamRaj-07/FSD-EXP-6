const express = require("express");
const app = express();

app.use(express.json());

let cards = [
    { id: 1, suit: "hearts", value: "ace", collection: "classic" }
];

// GET all cards
app.get("/api/cards", (req, res) => {
    res.json(cards);
});

// POST new card
app.post("/api/cards", (req, res) => {
    const { suit, value, collection } = req.body;

    const newCard = {
        id: Date.now(),
        suit,
        value,
        collection
    };

    cards.push(newCard);
    res.status(201).json(newCard);
});

// PUT update card
app.put("/api/cards/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const card = cards.find(c => c.id === id);

    if (!card) {
        return res.status(404).json({ message: "Card not found" });
    }

    card.suit = req.body.suit || card.suit;
    card.value = req.body.value || card.value;
    card.collection = req.body.collection || card.collection;

    res.json(card);
});

// DELETE card
app.delete("/api/cards/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = cards.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Card not found" });
    }

    cards.splice(index, 1);
    res.json({ message: "Card deleted successfully" });
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
