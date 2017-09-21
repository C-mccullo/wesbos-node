// NOTE: REMEMBER TO ADD IN next PARAMETER!
const mongoose = require("mongoose");
const Store = mongoose.model("Store");
const User = mongoose.model("User");
const multer = require("multer");
// jimp is an image manipulation library
const jimp = require("jimp");
const uuid = require("uuid");

const multerOptions = {
	storage: multer.memoryStorage(),
	fileFilter: function(req, file, next) {
		// can rely on a files mimetype to identify the true identity of a files format
		const isPhoto = file.mimetype.startsWith('image/');
		if (isPhoto) {
			next(null, true);
		} else {
			next({ message: "File type is not allowed!" }, false);
		}
	}
}

// NOTE! If you do not wrap your async await function in a try-catch statement, you will need to pass the function into a chain of error handlers! 
// 👉 See errorHandlers.js

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

// allows the upload of the file 
exports.upload = multer(multerOptions).single("photo");

exports.resize = async (req, res, next) => {
	// check if there is no new file to resize
	if (!req.file) {
		next(); // skip to the next middleware
		return;
	}
	// rename
	const extension = req.file.mimetype.split("/")[1];
	req.body.photo = `${uuid.v4()}.${extension}`;
	// resize
	const photo = await jimp.read(req.file.buffer);
	await photo.resize(800, jimp.AUTO);
	await photo.write(`./public/uploads/${req.body.photo}`);
	next();
} 

exports.createStore = async (req, res) => {
	req.body.author = req.user._id;
	const store = await (new Store(req.body)).save();
	console.log("store has been saved");
	// connect-flash is a middleware imported in app.js
	req.flash("success", `Successfully added ${store.name}. Care to leave a review?`);
	res.redirect(`/store/${store.slug}`);
}

exports.getStores = async (req, res) => {
	const page = req.params.page || 1;
	const limit = 6;
	const skip = (page * limit) - limit;

	// 1. Query the databases for a list of all the stores
	const storesPromise = Store
		.find()
		.skip(skip)
		.limit(limit)
		.sort({ created: "desc" })

	const countPromise = Store.count();

	const [stores, count] = await Promise.all([storesPromise, countPromise]);

	const pages = Math.ceil(count / limit)
	if (!stores.length && skip) {
		req.flash("info", "The page you asked from no longer exists!");
		res.redirect(`/stores/page/${pages}`);
		return;
	}
	res.render("stores", { title: "Stores", stores: stores, pages: pages, page: page, count: count });
}

exports.confirmOwner = (store, user) => {
	if (!store.author.equals(user._id)) {
		throw Error("You must own a store in order to edit it!");
	}
};

exports.editStore = async (req, res) => {
	// 1. Find the store givin the ID
	const store = await Store.findOne({ _id: req.params.id });
	// 2. TODO Confirm they are the owner of the store
	confirmOwner(store, req.user);
	// 3. Render out the edit form so the user can update their store
	res.render("editStore", { title: `Edit ${store.name}`, store: store });
}

exports.updateStore = async (req, res) => {
	// set the location data to be a point
	req.body.location.type = "Point";
	// findOneAndUpdate is a MongoDb Method
	const store = await Store.findOneAndUpdate({ _id: req.params.id }, req.body, {
		new: true, // returns the new store with updates and not the old one
		runValidators: true // validate the updated store against the storeSchema
	}).exec();

	req.flash("success", `Sucessfully updated <strong>${store.name}</strong>. <a href="/stores/${store.slug}">View Store</a>`);
	res.redirect(`/stores/${store._id}/edit`);
}

exports.getStoreBySlug = async (req, res) => {
	const store = await Store.findOne({ slug: req.params.slug }).populate("author reviews");
	if(!store) return next();
	res.render("store", { store: store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
	const tag = req.params.tag;
	// $exists is a mongoDb query operator: review MongoDb docs
	const tagQuery = tag || { $exists: true };
	const tagsPromise = Store.getTagsList();
	const storesPromise = Store.find({ tags: tagQuery });
	// will await for all promises to be returned asynchronously
	const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);
	res.render("tag", { tags, title: "tags", tag, stores });
}

exports.searchStores = async (req, res) => {
	const stores = await Store.find({
		$text: { $search: req.query.q }
	}, {
		score: { $meta: "textScore" }
	}).sort({
		score: { $meta: "textScore" }
	}).limit(5);

	res.json(stores);
}

exports.mapStores = async (req, res) => {
	const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
	const distance = (req.query.rad * 1000) || 10000;
	const limit = parseInt(req.query.limit) || 10;
	const q = {
		location: {
			$near: {
				$geometry: {
					type: "Point",
					coordinates: coordinates
				},
				$maxDistance: distance // within specified distance or 10km
			}
		}
	}
	const stores = await Store.find(q).select("slug name description photo location").limit(10);
	res.json(stores);
}

exports.mapPage = (req, res) => {
	res.render("map", { title: "Map" });
}

exports.favStore = async (req, res) => {
	const hearts = req.user.favourites.map(obj => obj.toString());
	const operator = hearts.includes(req.params.id) ? "$pull" : "$addToSet";
	const user = await User
	.findByIdAndUpdate(
		req.user._id, { [operator]: { favourites: req.params.id } },
		{ new: true }
	)
	res.json(user);
}

exports.getFavs = async (req, res) => {
	const stores = await Store.find({
		_id: { $in: req.user.favourites }
	});
	res.render("stores", { title: "Favourite Stores", stores });
}

exports.getTopStores = async (req, res) => {
	const stores = await Store.getTopStores();
	//res.json(stores);
	res.render("topStores", { stores: stores, title: "Top Ranked Stores" });
}

exports.homePage = (req, res) => {
	res.render("index");
}


// NOTE: EXAMPLE CALLBACK
// *** instead of await ***
// exports.createStore = (req, res) => {
// 	const store = new Store(req.body);
// 	store.save(function(err, store) {
// 		if(!err) {
// 			console.log("store has been saved");
// 			res.redirect("/")
// 		}
// 	});
// }