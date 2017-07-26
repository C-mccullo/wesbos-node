
// ROUTES
const express = require('express');
const router = express.Router();
const storeController = require("../controllers/storeController");
const { catchErrors } = require("../handlers/errorHandlers");

// USING ASYNC AWAIT, wrapped in catchErrors function
router.get("/doge/", catchErrors(storeController.dogePage));

router.get("/add", storeController.addStore);
router.post("/add", catchErrors(storeController.createStore)); 
router.post("/add/:id", catchErrors(storeController.updateStore));

router.get("/stores", catchErrors(storeController.getStores));
router.get("/stores/:id/edit", catchErrors(storeController.editStore));

router.get("/", storeController.homePage); // Applying Middleware

module.exports = router;
