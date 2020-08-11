const Sauce = require("../models/sauce");
const fs = require("fs");

// Renvoie le tableau detoutes les sauces dansla base de données
exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};
// Renvoie la sauce avecl'ID fourni
exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};
// exports.createSauce = (req, res, next) => {};
// exports.likeSauce = (req, res, next) => {};
// exports.modifySauce = (req, res, next) => {};
// exports.deleteSauce = (req, res, next) => {};
