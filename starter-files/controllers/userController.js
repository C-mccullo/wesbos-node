const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");

exports.loginForm = (req, res) => {
	res.render("login", { title: "Login" });
}

exports.registerForm = ( req, res ) => {
	res.render("register", { title: "Register" });
}

exports.validateRegister = (req, res, next) => {
	// methods coming from express-validator package in app.js is making them accessible on all the requests (req)
	req.sanitizeBody("name");
	req.checkBody("name", "Please supply a name").notEmpty();
	req.checkBody("email", "Sorry, the email is not valid").isEmail();
	req.sanitizeBody("email").normalizeEmail({
		remove_dots: false,
		remove_extension: false,
		gmail_remove_dots: false,
		gmail_remove_subaddress: false
	});
	req.checkBody("password", "Please add a password").notEmpty();
	req.checkBody("password-confirm", "Please confirm the password");
	req.checkBody("password-confirm", "Sorry, your passwords need to match").equals(req.body.password);

	const errors = req.validationErrors();
	if (errors) {
		req.flash("error", errors.map(err => err.msg));
		res.render("register", { title: "Register", body: req.body, flashes: req.flash() });
		return;
	}
	next();
}

exports.register = async (req, res, next) => {
	// "User" refers to the Model whereas "user"
	const user = new User({ email: req.body.email, name: req.body.name });
	// never want password to be visible, register method will encrypt 
	const register = promisify(User.register, User);
	await register(user, req.body.password);
	next();
}

exports.account = (req, res) => {
	res.render("account", { title: "Edit Your Account" });
}

exports.updateAccount = async (req, res) => {
	const updates = {
		name: req.body.name,
		email: req.body.email
	};

	const user = await User.findOneAndUpdate(
		{ _id: req.user._id },
		{ $set: updates },
		{ new: true, runValidators: true, context: "query" }
	);
	req.flash("success", "Profile was updated!");
	res.redirect("back");
}