//jshint esversion:6
require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const app = express();

//for authenatication
const salt = 10;
//1. const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

// Replace the uri string with your connection string.
mongoose.connect("mongodb://localhost:27017/Apply4me",{useNewUrlParser:true});

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));// to save our css files

const userSchema = new mongoose.Schema({
    username: String,
    password: String
 });
  
//the order matters a lot
 //a- cookies 
 app.use(session({
    secret: 'SecretInSecret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
  }));

  //b intialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  //c add the mongoose plugin
  userSchema.plugin(passportLocalMongoose);

   //the model
 const User = mongoose.model("User", userSchema);

 //d use static authenticate method of model in LocalStrategy
  passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

 app.get("/", function(request,response){
    response.render("reset");
});

app.get("/home", function(request,response){
    if(request.isAuthenticated()){
       response.render("home");
    }else{
        response.redirect("/login");
    }
});

app.get("/signUp",function(request,response){
    response.render("signUp");
 });

 app.get("/reset",function(request,response){
    response.render("reset");
 });

 app.get("/login",function(request,response){
    response.render("login");
 });
  
 app.post("/signUp",function(request,response){
    /* for hashing and salting
    bcrypt.hash(request.body.password, salt, async(err, hash) =>{
        const newUser = new User({
            email:request.body.email,
            password: hash
        });     
         try{
            await newUser.save().then(user =>
                response.render("login")
               );
         }catch (err){
            response.statusMessage(401)
         }
    });
    */
    User.register({username:request.body.username},request.body.password,function(err,user){
        if(err){
            console.log(err);
            response.redirect("/signUp");
        }else{
            // can access this if they are login 
            passport.authenticate("local")(request,response,function(){
            response.redirect("/home");
            });
        }
    })
 });


 app.post("/login",function(request,response){

       const user = new User({
          username: request.body.username,
          password: request.body.password
       });

     request.login(user,function(err){
          if(err){
            response.render("login");
          }else{
            passport.authenticate("local")(request,response,function(){
                response.redirect("/home");
            });
          }
      
          
        
     })
     
 });


app.listen(3000, function(){
    console.log("Server has started on port 3000");
});