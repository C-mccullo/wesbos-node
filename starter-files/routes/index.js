
// ROUTES
const express = require('express');
const router = express.Router();
const storeController = require("../controllers/storeController");
const { catchErrors } = require("../handlers/errorHandlers");

router.get("/add", storeController.addStore);

router.post("/add", catchErrors(storeController.createStore));

router.get("/doge/", storeController.dogePage);

router.get("/", storeController.homePage); // Applying Middleware

module.exports = router;
