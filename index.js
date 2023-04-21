// Add Express
const express = require("express");

// Initialize Express
const app = express();

let stock = [];
// Create GET request
app.get("/api/ping", (req, res) => {
  res.send("PONG");
});

// Endpoint pour accepter des marchandises dans le stock
app.post("/api/stock/:productId/movement", async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  // Vérifier que le produit existe dans le catalogue
  try {
    const response = await fetch(
      `http://microservices.tp.rjqu8633.odns.fr/api/products/${productId}`
    );
    const product = await response.json();

    // Si le produit existe, ajouter la quantité fournie au stock
    // Si le produit n'existe pas, renvoyer une erreur
    if (product) {
      // TODO : Ajouter la quantité fournie au stock
      const index = stock.findIndex((item) => item.productId === productId);
      if (index !== -1) {
        // Le produit est déjà connu du stock, ajouter la quantité fournie à la quantité en stock
        stock[index].quantity += quantity;
      } else {
        // Le produit n'est pas connu du stock, ajouter une nouvelle entrée pour le produit avec la quantité fournie
        const newProductId = productId
        const newQuantity = quantity
        stock.push({ productId: newProductId, quantity: newQuantity });
      }
      res.status(200).send({ "stock": stock });
      //res.status(204).send()
    } else {
      res.status(400).send("Le produit n'existe pas dans le catalogue");
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la vérification du produit");
  }
});

// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});

module.exports = app;
