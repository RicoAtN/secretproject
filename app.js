//jshint esversion:6
require('dotenv').config();

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Setup MongoDB for user login DB
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true });

// Create user schema
const userSchema = new mongoose.Schema ({
    email: {
        type: String,
        required: [true, "You need to add your email address."]
    },
    password: {
        type: String,
        required: [true, "You need to provide a password."]
    }
});

// Encrypt user passwords in DB
userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

// Create collections for the user DB
const User = new mongoose.model("User", userSchema);

// Get and render the view pages
app.get("/", function (req, res) {
    res.render("home");
});

app.get("/login", function (req, res) {
    res.render("login");
});3

app.get("/register", function (req, res) {
    res.render("register");
});

// Receive input from register page for account creation
app.post("/register", function (req, res) {
    const newUser = new User ({
        email: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err) {
        if (err) {
            console.log("Something went wrong, couldn't create an account. Error message: "+ err);
        } else {
            res.render("secrets");
        }
    });

});

// Login page where we match the user filled-in credentials with the user DB for access to secret page
app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({email: username}, function (err, foundUser) {
        if (err){
            console.log("This username or email is not recognized in our DB. Error message: " + err);
        } else {
            if (foundUser) {
                if (foundUser.password === password)
                res.render("secrets")
            }
        }
    });
});


// Indication that server has started
app.listen(3000, function() {
    console.log("Server has started on port 3000");
});