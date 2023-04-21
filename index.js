// Add Express
const express = require("express");
const bodyParser = require("body-parser");

// Initialize Express
const app = express();
app.use(bodyParser.json());

let stock = [];
// Create GET request
app.get("/api/ping", (req, res) => {
  res.send("PONG");
});

// Endpoint pour accepter des marchandises dans le stock
app.post("/api/stock/:productId/movement", async (req, res) => {
  const { productId } = req.params;
  const { quantity, status } = req.body;
  try {
    const response = await fetch(
      `http://microservices.tp.rjqu8633.odns.fr/api/products/${productId}`
    );
    const product = await response.json();
    if (product) {
      if (status === "Supply") {
        const index = stock.findIndex((item) => item.productId === productId);
        if (index !== -1) {
          // Le produit est déjà connu du stock, ajouter la quantité fournie à la quantité en stock
          stock[index].quantity += +quantity;
        } else {
          // Le produit n'est pas connu du stock, ajouter une nouvelle entrée pour le produit avec la quantité fournie
          const newProductId = productId;
          const newQuantity = +quantity;
          stock.push({ productId: newProductId, quantity: newQuantity });
        }
      }
      if(status === "Reserve"){
        const index = stock.findIndex((item) => item.productId === productId);
        if (index !== -1) {
          // Le produit est connu du stock, vérifier si la quantité demandée est disponible
          const availableQuantity = stock[index].quantity;
          const requestedQuantity = +quantity;
          if (requestedQuantity <= availableQuantity) {
            // La quantité demandée est disponible, soustraire la quantité réservée de la quantité disponible en stock
            const disponible = stock[index].quantity -= requestedQuantity;
            console.log(disponible)
            stock[index]["disponible"] += disponible;
            console.log(stock[index].disponible)
            stock[index]["reserved"] += requestedQuantity;
            console.log(stock[index].reserved)
            res.status(200).send({ stock: stock });
          } else {
            // La quantité demandée n'est pas disponible, renvoyer une erreur
            res.status(400).send("La quantité demandée n'est pas disponible");
          }
        } else {
          // Le produit n'est pas connu du stock, renvoyer une erreur
          res.status(400).send("Le produit n'est pas connu du stock");
        }
      }
      if(status === "Removal"){

      }
      res.status(200).send({ stock: stock });
      //res.status(204).send()
    } else {
      res.status(400).send("Le produit n'existe pas dans le catalogue");
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la vérification du produit");
  }
});

app.get("/api/stock", async (req, res) => {
  res.status(200).send({ stock: stock });
});

app.get("/api/stock/:productId", async (req, res) => {
  const { productId } = req.params;
  const index = stock.findIndex((item) => item.productId === productId);
  if (index !== -1) {
    res.status(200).send({ quantity: stock[index].quantity });
  } else {
    res.status(404).send("Le produit n'est pas connu du stock");
  }
});

// Initialize server
app.listen(5000, () => {
  console.log("Running on port 5000.");
});

module.exports = app;
