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
          stock[index].quantity += +quantity;
        } else {
          const newProductId = productId;
          const newQuantity = +quantity;
          stock.push({ productId: newProductId, quantity: newQuantity , reserved: 0});
        }
      }
      if(status === "Reserve"){
        const index = stock.findIndex((item) => item.productId === productId);
        if (index !== -1) {
          const availableQuantity = stock[index].quantity;
          if (quantity <= availableQuantity) {
            stock[index].quantity -= quantity;
            stock[index].reserved += quantity;
            res.status(200).send({ stock: stock });
            return
          } else {
            res.status(400).send("La quantité demandée n'est pas disponible");
            return
          }
        } else {
          res.status(400).send("Le produit n'est pas connu du stock");
          return
        }
      }
      if(status === "Removal"){
        const index = stock.findIndex((item) => item.productId === productId);
        if (index !== -1) {
          const availableQuantity = stock[index].reserved;
          if (quantity <= availableQuantity) {
            stock[index].reserved -= quantity;
            res.status(200).send({ stock: stock });
            return
          } else {
            res.status(400).send("La quantité demandée n'est pas disponible");
            return
          }
        } else {
          res.status(400).send("Le produit n'est pas connu du stock");
          return
        }

      }
      res.status(200).send({ stock: stock });
      //res.status(204).send()
      return
    } else {
      res.status(400).send("Le produit n'existe pas dans le catalogue");
      return
    }
  } catch (error) {
    res.status(500).send("Erreur lors de la vérification du produit" + JSON.stringify(error));
    return
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
app.listen(5002, () => {
  console.log("Running on port 5002.");
});

module.exports = app;
