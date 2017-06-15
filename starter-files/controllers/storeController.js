// NOTE: REMEMBER TO ADD IN next PARAMETER!
const mongoose = require("mongoose");
const Store = mongoose.model("Store");

exports.dogePage = (req, res) => {
	const profile = {
		name: req.query.name ? req.query.name : "Buttface",
		futureDog: req.query.futureDog ? req.query.futureDog : "Sprinkles"
	}
	res.render("doge", profile);
}

exports.addStore = (req,res) => {
	res.render("editStore", {
		title: "Add Store"
	});
} 
// NOTE! If you do not wrap your async await function in a try-catch statement
// you will need to pass the function into a chain of error handlers! 
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function 
exports.createStore = async (req, res) => {
	const store = await (new Store(req.body)).save();
	console.log("store has been saved");
	// coonect-flash is a middleware imported in app.js
	req.flash("success", `Successfully added ${store.name}. Care to leave a review?`);
	res.redirect(`/store/${store.slug}`);
}

exports.homePage = (req, res) => {
	res.render("index");
}