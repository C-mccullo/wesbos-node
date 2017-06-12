// ROUTES
const express = require('express');
const router = express.Router();
const storeController = require("../controllers/storeController");

//router.get('/', storeController.homePage);
router.get("/add", storeController.addStore);
router.get("/doge/", storeController.dogePage);
router.get("/", storeController.homePage); // Applying Middleware

module.exports = router;
