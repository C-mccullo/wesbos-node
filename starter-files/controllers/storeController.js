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

// EXAMPLE CALLBACK, instead of await
// exports.createStore = (req, res) => {
// 	const store = new Store(req.body);
// 	store.save(function(err, store) {
// 		if(!err) {
// 			console.log("store has been saved");
// 			res.redirect("/")
// 		}
// 	});
// }

// NOTE! If you do not wrap your async await function in a try-catch statement
// you will need to pass the function into a chain of error handlers! (errorHandlers.js) 
exports.createStore = async (req, res) => {
	const store = await (new Store(req.body)).save();
	console.log("store has been saved");
	// connect-flash is a middleware imported in app.js
	req.flash("success", `Successfully added ${store.name}. Care to leave a review?`);
	res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
	// 1. Query the databases for a list of all the stores
	const stores = await Store.find();
	res.render("stores", { title: "Stores", stores: stores });
}

exports.editStore = async (req, res) => {
	// 1. Find the store givin the ID
	const store = await Store.findOne({ _id: req.params.id });
	// 2. Confirm they are the owner of the store
	// TODO
	res.render("editStore", { title: `Edit ${store.name}`, store: store });
}

exports.updateStore = async (req, res) => {
	// findOneAndUpdate is a method from mongoDb
	const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new: true, // returns the new store with updates and not the old one
		runValidators: true // validate the updated store against the storeSchema
	}).exec();

	req.flash("success", `Sucessfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
	res.redirect(`/stores/${store._id}/edit`);
}

exports.homePage = (req, res) => {
	res.render("index");
}