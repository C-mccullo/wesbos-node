const mongoose = require("mongoose");
const Review = mongoose.model("Review");

exports.addReview = async (req, res) => {
	req.body.author = req.user._id;
	req.body.store = req.params.id;
	const newReview = new Review(req.body);
	await newReview.save();
	console.log("review added")
	req.flash("success", "Review has been saved!");
	res.redirect("back");
}