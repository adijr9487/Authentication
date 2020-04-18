//jshint esversion:6
require("dotenv").config();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.set("view engine", 'ejs');
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/Users", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true});

const userSchema = new mongoose.Schema({
    username:String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy())

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/secrets", (req, res)=>{
    if(req.isAuthenticated())
        res.render("secrets");
    else{
        res.redirect("/login");
    }
});

app.get("/register", (req, res)=>{
    res.render("register");
});


app.get("/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
});
app.post("/register", (req, res)=>{
    User.register({username: req.body.username}, req.body.password, function(err, user){
        if(err)
            console.log(err);
        else{
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            });
        }
    });
})

app.post("/login", (req, res)=>{
    
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err)=>{
        if(err)
            console.log(err);
        else
        {
            console.log("Successfully Loged In");
            passport.authenticate("local")(req, res, ()=>{
                res.redirect("/secrets");
            });
        }
    });
});

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server Successfully running on PORT 3000");
});