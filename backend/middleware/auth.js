const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(
      token,
      "$2y$10$2SdudjltuB/OPGapUTJeGem/Lv2gmPiewBz5hAASr.dOvMDucCQ4K"
    );
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw "User Id non valable";
    } else {
      // Utilisateur authentifié, on peut lancer la suite des middleware
      next();
    }
  } catch (error) {
    res.status(401).json({ error: error | "Requête non authentifiée" });
  }
};
