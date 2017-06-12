// MODEL
const mongoose = require("mongoose");
// tell the mongoose middleware to use built in ES6 Promise function
mongoose.Promise = global.Promise;
const slug = require("slugs");

const storeSchema = new mongoose.Schema({
	name: {
		type: String,
		trim: true, // takes out white space on either side of string entry
		required: "Please enter a store name"
	}, 
	slug: String,
	description: {
		type: String,
		trim: true, 
	},
	tags: [String]
});
// pre is a mongoose method
storeSchema.pre("save", function(next) {
	if (!this.isModified("name")) {
		next(); // skip this function
		return // stop this function
	}
	this.slug = slug(this.name);
	next();
});

module.exports = mongoose.model("Store", storeSchema);