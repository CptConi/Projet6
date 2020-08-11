const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const path = require("path");

const app = express();
/*
*       INSERT REQUIRED ROUTES HERE
*/

//Connexion à la DB MongoDB:
//Login: So_Pekocko_Admin_Mongo
//Password >> piGWDRfWwp3VONBq

mongoose
  .connect(
    "mongodb+srv://So_Pekocko_Admin_Mongo:piGWDRfWwp3VONBq@sopekocko.nwyga.mongodb.net/<dbname>?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

// On indique ici les middleware gérant la réponse de notre app back-end
// Set le HEADER pour qu'il accepte les requêtes Cross Origin (Et empêcher les bugs de CORS)
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));

//
//       INSERT ROUTES HERE
//       
// app.use("/api/auth", userRoutes);
// app.use("/api/sauces");


module.exports = app;