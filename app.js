//jshint esversion:6
require("dotenv").config();
const bodyParser = require("body-parser");
const ejs = require("ejs");
const express = require("express");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;

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

// userSchema.plugin(encrypt, {
//     secret: process.env.SECRET, 
//     encryptedFields: ['password'],
// });

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
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        
        const newUser = new User({
            email: req.body.username,
            password: hash
        });  
        newUser.save((err)=>{
            if(!err)
            {    res.render("secrets");
                console.log("Successfully Loged In");
        }
            else
                console.log(err);
        });  
    
    });
})

app.post("/login", (req, res)=>{
    User.findOne({email: req.body.username}, (err, foundUser)=>{
        console.log(foundUser);
        if(foundUser)
        {
            bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
                if(result){
                    res.render("secrets");
                    console.log(result);
                }
                else{
                    console.log(err);
                    console.log(result);
                }
            });
            
        }
        // if(foundUser.password === hash){
        //     res.render("secrets");
        // }
        // else{
        //     res.send(err);
        // }
    });
});

app.listen(process.env.PORT || 3000, ()=>{
    console.log("Server Successfully running on PORT 3000");
});