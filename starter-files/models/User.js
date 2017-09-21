const mongoose = require("mongoose");
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require("md5");
const validator = require("validator");
const mongodbErrorHandler = require("mongoose-mongodb-errors");
const passportLocalMongooose = require("passport-local-mongoose");

const userSchema = new Schema({
	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true, 
		validate: [validator.isEmail, "Sorry, invalid email address"],
		required: "please add an email address"
	},
	name: {
		type: String,
		required: "Please add a name for login",
		trim: true
	},
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	favourites: [
		{ type: mongoose.Schema.ObjectId, ref: "Store" }
	] 
});
// generates a virtual schema field for the user "gravatar"
userSchema.virtual("gravatar").get(function() {
	// md5 is an algorithm for producing 128-bit hash values
	const hash = md5(this.email);
	return `https://gravatar.com/avatar/${hash}?s=200`;
})

// adds in and handles all of the necessary Schema fields to make a robust authentication strategy
userSchema.plugin(passportLocalMongooose, { usernameField: "email" });
// Provides easier to understand error messages for MongoDb errors
userSchema.plugin(mongodbErrorHandler);

module.exports = mongoose.model("User", userSchema);