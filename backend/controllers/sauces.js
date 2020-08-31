const Sauce = require("../models/sauce");
const fs = require("fs");
const { restart } = require("nodemon");
const { lintSyntaxError } = require("tslint/lib/verify/lintError");

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

// Capture et enregistre l'image, analyse la sauce en utilisant une chaîne de caractères
// et l'enregistre dans la base de données, en définissant correctement son image URL.
// Remet les sauces aimées et celles détestées à 0, et les sauces usersliked et celles usersdisliked aux tableaux vides.
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    userId: sauceObject.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,

    likes: 0,
    dislikes: 0,
    userLiked: null,
    userDisliked: null,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "Sauce initialisée" }))
    .catch((error) => res.status(400).json({ error }));
};

//  Met à jour la sauce avec l'identifiant fourni.
//  Si une image est téléchargée, capturez-la et mettez à jour l'image URL des sauces.
//  Si aucun fichier n'est fourni, les détails de la sauce figurent directement dans
//  le corps de la demande(req.body.name,req.body.heat etc).
//  Si un fichier est fourni, la sauce avec chaîne est en req.body.sauce
exports.modifySauce = (req, res, next) => {
  if (req.file) {
    //Suppression de l'ancienne image dans le stockage serveur:
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        const filename = sauce.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {});
      })
      .catch((error) => res.status(500).json({ error }));
    sauceObject = {
      //Une modif d'image est demandée
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    };
  } else {
    //Modif d'infos texte uniquement
    sauceObject = { ...req.body };
  }
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Sauce modifiée" }))
    .catch((error) => res.status(400).json({ error }));
};

// Supprime la sauce avecl'ID fourni.
exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      const filename = sauce.imageUrl.split("/images/")[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Sauce supprimée" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

// Définit le statut "j'aime" pour userID fourni.
// ===============================================
// Si j'aime = 1,l'utilisateur aime la sauce.
// Si j'aime = 0,l'utilisateur annule ce qu'il aime ou ce qu'il n'aime pas.
// Si j'aime =-1, l'utilisateur n'aime pas la sauce.
// ================================================
// L'identifiant de l'utilisateur doit être ajouté ou supprimé du tableau approprié:
// - en gardant une trace de ses préférences
// - en l'empêchant d'aimer ou de ne pas aimer la même sauce plusieurs fois.
// Nombre total de"j'aime" et de "je n'aime pas" à mettre à jour avec chaque "j'aime".

// REQUEST Payload template: {userId: "5f352c13fac37228e83b8748", like: 1}
exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case 1: //--------------------------------User Likes
          likeSauce(sauce, req, res);
          break;
        case 0: //--------------------------------Undo Like / Dislike
          undoLike(sauce, req, res);
          break;
        case -1: //-------------------------------User Dislikes
          dislikeSauce(sauce, req, res);
          break;
        default:
          console.error(
            "Like value must be between -1 / 0 / 1 || Actual Like value: " +
              req.body.like
          );
      }
    })
    .catch((error) => res.status(500).json({ error }));
};

const deleteFromTab = (pTab, pValue) => {
  const index = pTab.indexOf(pValue);
  if (index > -1) {
    pTab.splice(index, 1);
  }
};

const updateLikeCounters = (pObj) => {
  pObj.likes = pObj.usersLiked.length;
  pObj.dislikes = pObj.usersDisliked.length;
};

const likeSauce = (pSauce, pReq, pRes) => {
  let alreadyLiked = false;
  for (let i = 0; i < pSauce.usersLiked.length; i++) {
    if (pSauce.usersDisliked[i] == pReq.body.userId) {
      alreadyLiked = true;
    }
  }
  if (!alreadyLiked) {
    const sauceObject = {
      ...pSauce._doc,
    };
    sauceObject.usersLiked.push(pReq.body.userId);
    //updating likes counters
    updateLikeCounters(sauceObject);
    Sauce.updateOne(
      { _id: pReq.params.id },
      { ...sauceObject, _id: pReq.params.id }
    )
      .then(() => pRes.status(200).json({ message: "Sauce likée" }))
      .catch((error) => pRes.status(500).json({ error }));
  } else {
    pRes.status(200).json({ message: "Sauce déjà likée !" });
  }
};

const undoLike = (pSauce, pReq, pRes) => {
  const sauceObject = {
    ...pSauce._doc,
  };
  deleteFromTab(sauceObject.usersLiked, pReq.body.userId);
  deleteFromTab(sauceObject.usersDisliked, pReq.body.userId);
  //updating likes counters
  updateLikeCounters(sauceObject);
  Sauce.updateOne(
    { _id: pReq.params.id },
    {
      ...sauceObject,
      _id: pReq.params.id,
    }
  )
    .then(() =>
      pRes.status(200).json({
        message: "Remise à zéro du like.",
      })
    )
    .catch((error) => pRes.status(500).json({ error }));
};

const dislikeSauce = (pSauce, pReq, pRes) => {
  let alreadyDisliked = false;
  for (let i = 0; i < pSauce.usersDisliked.length; i++) {
    if (pSauce.usersDisliked[i] == pReq.body.userId) {
      alreadyDisliked = true;
    }
  }
  if (!alreadyDisliked) {
    const sauceObject = {
      ...pSauce._doc,
    };
    sauceObject.usersDisliked.push(pReq.body.userId);
    //updating likes counters
    updateLikeCounters(sauceObject);
    Sauce.updateOne(
      { _id: pReq.params.id },
      { ...sauceObject, _id: pReq.params.id }
    )
      .then(() => pRes.status(200).json({ message: "Sauce dislikée" }))
      .catch((error) => pRes.status(500).json({ error }));
  } else {
    pRes.status(200).json({ message: "Sauce déjà dislikée !" });
  }
};
