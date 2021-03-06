const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const User = require("./models/User");
const verifyToken = require("./routes/auth/verifyToken");

const app = express();
mongoose.connect(
	process.env.MONGO_URI,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	() => console.log(`Connected to db!`)
);

app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors());

app.use("/auth", require("./routes/auth/auth"));
app.use(express.static("./public"));

// app.get("/", (req, res) => {
// 	// res.cookie("a", "testcookie", { httpOnly: true });
// 	res.json({ msg: "Hello" });
// });

app.get("/login", (req, res) => {
	if (!req.query.callback) res.redirect('/404?error="url"');
	return res.redirect(`/login.html?callback=${req.query.callback}`);
});

app.get("/register", (req, res) => {
	if (!req.query.callback) res.redirect("/404");
	return res.redirect(`/register.html?callback=${req.query.callback}`);
});

app.get("/404", (req, res) => {
	console.log(req.params);
	res.redirect(`/404.html?error="${req.query.error}"`);
});

app.get("/protected", verifyToken, async (req, res) => {
	// if (req.user.jwtError) return res.status(400).send(req.user.jwtError.message);
	if (req.user) {
		const userId = req.user.id;
		const user = await User.findById(userId);
		const temp = JSON.parse(JSON.stringify(user));
		delete temp.password;
		return res.status(200).json(temp);
	} else return res.status(401).send("Logged Out");
});

const port = process.env.PORT || 1234;
app.listen(port, () => {
	console.log(`Server listening on port ${port}`);
});

/**
 * Resources:
 * https://medium.com/@itsgosho2/how-to-transfer-http-only-cookies-with-express-back-end-and-the-fetch-api-2035f0ac48d9
 * https://stackoverflow.com/questions/27726066/jwt-refresh-token-flow
 * https://jwt.io/
 * https://www.npmjs.com/package/jsonwebtoken
 * todo: https://www.jbspeakr.cc/howto-single-use-jwt/
 * https://stackoverflow.com/questions/20343496/set-cookie-then-redirect
 */
