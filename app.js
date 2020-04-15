//jshint esversion:6
const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/Users", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = {
    email:String,
    password: String
}

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
            res.render("secrets");
        else
            console.log(err);
    });
})

app.post("/login", (req, res)=>{
    const email = req.body.username;
    const password = req.body.password;
    User.findOne({email: email}, (err, foundUser)=>{
        if(foundUser.password === password)
            res.render("secrets");
        else{
            res.send(err);
        }
    });
});




app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server Successfully started on PORT 3000");
});