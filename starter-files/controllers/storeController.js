// NOTE: REMEMBER TO ADD IN next PARAMETER!

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

exports.homePage = (req, res) => {
	res.render("index");
}