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
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook");
const findOrCreate = require("mongoose-findorcreate");
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
    password: String,
    googleId: String,
    facebookId: String,
    secret: String
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);    

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy())

passport.serializeUser(function(user, done) {
    done(null, user.id);
});
  
passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
});

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    // console.log(profile);

    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);    
    });

  }
));

passport.use(new FacebookStrategy({
        clientID: process.env.APP_ID,
        clientSecret: process.env.APP_SECRET,
        callbackURL: "http://localhost:3000/auth/facebook/secrets",
        profileFields: ['id', 'displayName', 'name', 'emails'],
        enableProof: true
      }, 
      function(accessToken, refreshToken, profile, done){
        // console.log(profile);

        User.findOrCreate({ facebookId: profile.id }, function (err, user) {
            console.log(err);
            return done(err, user);
        });
      }
));

app.get("/", (req, res)=>{
    res.render("home");
});

app.get("/login", (req, res)=>{
    res.render("login");
});

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get('/auth/google/secrets', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});

app.get("/auth/facebook",
  passport.authenticate("facebook")
);

app.get('/auth/facebook/secrets', 
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/secrets');
});

app.get("/secrets", (req, res)=>{
    User.find({secret: {$ne: null}}, (err, user)=>{
        if(err)
            console.log(err)
        else
            res.render("secrets", {userSecret: user});
    });
});

app.get("/submit", (req, res)=>{
    if(req.isAuthenticated())
        res.render("submit");
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

app.post("/submit", (req, res)=>{
    const submitSecret = req.body.secret;

    console.log(req.user);
    User.findById(req.user.id, (err, foundUser)=>{
        if(err)
            console.log(err);
        else{
            foundUser.secret = submitSecret;
            foundUser.save((err)=>{
                if(!err)
                    res.redirect("/secrets");
            })
        }
    });
});

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server Successfully running on PORT 3000");
});