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
	tags: [String],
	created: {
		type: Date,
		default: Date.now
	},
	author: {
		type: mongoose.Schema.ObjectId,
		ref: "User",
		required: "You must supply and author"
	},
	location: {
		type: {
			type: String,
			default: "Point"
		},
		coordinates: [{
			type: Number,
			required: "You must supply coordinates!"
		}],
		address: {
			type: String,
			required: "You must supply an address!"
		}
	},
	photo: String
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Define Mongodb Indexing
storeSchema.index({
	name: "text",
	description: "text"
});

storeSchema.index({ location: "2dsphere" });

// pre is a mongoose method
storeSchema.pre("save", async function(next) {
	if (!this.isModified("name")) {
		next(); // skip this function
		return // stop this function
	}
	this.slug = slug(this.name);
	// if there is another store with a slug of the same name, we need to be able to access it
	const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i");
	const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
	if(storesWithSlug.length) {
		this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
	}
	next();
});

storeSchema.statics.getTagsList = function() {
	return this.aggregate([
		{ $unwind: "$tags" },
		{ $group: { _id: "$tags", count: { $sum: 1 } }},
		{ $sort: { count: -1 }}
	]);
}

storeSchema.statics.getTopStores = function() {
	return this.aggregate([
		// Lookup Stores and populate their reviews
		{ $lookup: { 
				from: "reviews", 
				localField: "_id", 
				foreignField: "store", 
				as: "reviews" 
			}
		},
		// Filter for the Stores that have 2 or more reviews
		{ $match: { "reviews.1": { $exists: true } }},
		// Add the average reviews field 
		// running Mongodb 3.4.7, if not 3.4 use $project and include all desired fields
		{ $addFields: {
				averageRating: { $avg: "$reviews.rating" }
			}
		},
		// sort it by our new field, highest reviews first
		{ $sort: { averageRating: -1 }},
		// limit the list to the top 10 stores max
		{ $limit: 10 }
	]);
}

storeSchema.virtual("reviews", {
	ref: "Review", // what Model to link
	localField: "_id", // which field on the store
	foreignField: "store" // which field on the review
})

function autoPopulate(next) {
	this.populate("reviews");
	next();
}

storeSchema.pre("find", autoPopulate);
storeSchema.pre("findOne", autoPopulate);

module.exports = mongoose.model("Store", storeSchema);