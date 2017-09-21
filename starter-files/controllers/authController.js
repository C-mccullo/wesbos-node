const passport = require("passport");
const crypto = require("crypto");
const promisify = require("es6-promisify");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const mail = require("../handlers/mail");

exports.login = passport.authenticate("local", {
	failureRedirect: "/login",
	failureFlash: "Oops! Failed to Log in!",
	successRedirect: "/",
	successFlash: "You are now logged in"
});

exports.logout = (req, res) => {
	req.logout();
	req.flash("success", "You have logged out ✌️");
	res.redirect("/");
}

exports.isLoggedIn = (req, res, next) => {
	// first check if user is authenticated, 
	// isAuthenticated is a passport.js middleware method 
	if (req.isAuthenticated()) {
		next();	
		return;
	}
	req.flash("error", "Oops! You must be logged in first");
	res.redirect("/login");
}

exports.forgot = async (req, res) => {
	// see if user exists
	const user = await User.findOne({ email: req.body.email });

	if(!user) {
		req.flash("error", "Password reset has been mailed to address");
		return res.redirect("/login");
	}
	// set reset tokens and expiry on account, crypto is built in module to node.js
	user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
	user.resetPasswordExpires = Date.now() + 3600000;
	await user.save();
	// send email with token
	const resetURL = `http://${req.headers.host}.account/reset/${user.resetPasswordToken}`;

	await mail.send({
		user: user,
		subject: "Darn Dats Delicious **Password Reset**",
		resetURL: resetURL,
		filename: "password-reset",
	});
	
	req.flash("success", `An password reset link has been emailed to you.`);
	// redirect to login page after reset
	res.redirect("/login");
}

exports.reset = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});

	if(!user) {
		req.flash("error", "Sorry, password reset is invalid or has expired");
		return res.redirect("/login");
	}

	// if there is a user, show them the reset password form
	res.render("reset", { title: "Reset Password" });
}

exports.confirmedPasswords = (req, res, next) => {
	if (req.body.password === req.body["password-confirm"]) {
		next();
		return;
	}
	req.flash("error", "passwords do not match");
	req.redirect("back");
}

exports.update = async (req, res) => {
	const user = await User.findOne({
		resetPasswordToken: req.params.token,
		resetPasswordExpires: { $gt: Date.now() }
	});

	if(!user) {
		req.flash("error", "Sorry, password reset is invalid or has expired");
		return res.redirect("/login");
	}
	// a passport-local-mongoose method from User.js 
	const setPassword = promisify(user.setPassword, user);
	await setPassword(req.body.password);
	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser = await user.save();
	await req.login(updatedUser);
	req.flash("success", "Your Password has been reset");
	res.redirect("/");
}