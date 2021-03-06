const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { json } = require("body-parser");
const path = require("path");
// const mongoosemask= require("mongoosemask");

const app = express();

//Routes
const userRoutes = require("./routes/user");
const saucesRoutes = require("./routes/sauces");

//Connexion à la DB MongoDB:
//Accès BDD pour mentor validateur: Mentor_access || YfKe2XdFSl3eITyO
mongoose
  .connect(
    "mongodb+srv://So_Pekocko_Admin_Mongo:piGWDRfWwp3VONBq@sopekocko.nwyga.mongodb.net/sopekocko?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

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
// app.use(mongoosemask([""]));

app.use("/api/auth", userRoutes);
app.use("/api/sauces", saucesRoutes);

module.exports = app;
