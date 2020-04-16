//jshint esversion:6
require("dotenv").config();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();
console.log(process.env.SECRET);

app.set("view engine", 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect("mongodb://localhost:27017/Users", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
    email:String,
    password: String
});

userSchema.plugin(encrypt, {
    secret: process.env.SECRET, 
    encryptedFields: ['password'],
});

const User = new mongoose.model("User", userSchema);


app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/register", (req, res)=>{
    res.render("register");
});

app.post("/register", (req, res)=>{
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    newUser.save((err)=>{
        if(!err)
        {    res.render("secrets");
            console.log("Successfully Loged In");
    }
        else
            console.log(err);
    });
})

app.post("/login", (req, res)=>{
    User.findOne({email: req.body.username}, (err, foundUser)=>{
        console.log(foundUser)
        if(foundUser.password === req.body.password)
            res.render("secrets");
        else{
            res.send(err);
        }
    });
});




app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server Successfully running on PORT 3000");
});