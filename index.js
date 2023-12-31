/*
//  const http=require("http"); //it was old way now we have included type :module in pacakge
// so we can now write as
import fs from "fs" // for file reading
import http from "http"

//old
//const gfName=require("./features") 
import gfname from "./features.js";
import {gfname2,gfname3} from "./features.js";// name should match in {} this case

// if we want to pack above as a obj
import * as myObj from "./features.js"
// importing function
import {generatelovepercent} from "./features.js"

console.log(generatelovepercent())// using imported message

const server=http.createServer((req,res)=>{
 
  res.setHeader("Content-Type", "text/html");
   
  if(req.url=="/about")
  {
    const about=fs.readFile("./about.html",(err,data)=>{
         res.end(data) // we are reading html page here
    })   
  }
  else if(req.url=="/")
  {
    res.end(`<h1>Love is ${generatelovepercent()}</h1>`)  // when we visit 5000/ port module function will be called
  }
  else
  {
    res.end("<h1>ERROR PAGE NOT FOUND</h1>")
  }
 
}); // this work when we visit url

server.listen(5000,()=>{
    console.log("server working");
});
// above is about node now express time
*/ 
// /loginbutton is main page in authentification
import express from 'express';
import fs from "fs";
import path from "path";
import mongoose from 'mongoose';
import { strict } from 'assert';
import cookieParser from 'cookie-parser';
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app=express();  // server created
// using middle ware
app.use(express.static(path.join(path.resolve(),"public")))//static is midddleware so we need to use use()
app.use(express.urlencoded({extended:true}))// to decode object we get by post method submit and extact data
app.use(cookieParser())
//setting us view engine
app.set("view engine","ejs");

const isauthenticated=async (req,res,next)=>{

const token=req.cookies.token

 if(token) // token exist
 {
 const decoded= jwt.verify(token,"randomjij")
 
   // user here is model 
  req.user=await User.findById(decoded._id) // request.user has decoded data
  
 next()//agar token hua to next handler call hoga logic in /loginbutton
 }
 else
 {
  res.redirect("/login")
 }

 
}

mongoose.connect("mongodb://localhost:27017",{
   dbName:"backend",
})
.then(()=>console.log("database connected"))
.catch((e)=>console.log(e))

const messageSchema=new mongoose.Schema(
  {
    name:String,
    email:String,
  }
)

const userSchema=new mongoose.Schema(// for authentication
  {
    name:String,
    email:String,
    password: String
  }
)


// model is another name of mongo collection
const Message=mongoose.model("Message",messageSchema)
const User=mongoose.model("user",userSchema)




const users=[]

app.get("/content",(req,res)=>{  // app.get(route,()=>{})

   // res.send("hi")// to send textual response
    res.json({
        success:true,
        product:[]

    })// to send json data
})

app.get("/about",(req,res)=>{  
 const pathlocation=path.resolve();// it give current directory
  // in sendFile we need absolute path thats why so much stuff
  res.sendFile(path.join(pathlocation,"./about.html")) // it join about path  to cuurent directory so we get final location
     // sendFile send file in this case html page 
  })

app.get("/",(req,res)=>{  //  ejs
    // render use for dynamic paging {}-> pass variables
   res.render("index",{name:"savya"})// use app.set for allowing it to function
   //heere index refer to index.ejs in view 
})


//now page to rendor login
//IT IS MAIN PAGE 
app.get("/loginbutton",isauthenticated,(req,res)=>{  
// first is authenticated is called

//then below logic or next handler that do thsi logic
res.render("logout")
//  const token=req.cookies.token

//  if(token) // token exist
//  {
//    res.render("logout")
//  }
//  else
//  {
//   res.render("login")
//  } .. we moved this logic to is authenticated
})

app.post("/register", async(req,res)=>{
 const {name,email,password}=req.body;

 let user= await User.findOne({email})
 if(user)
 {
  return res.redirect("login")
 }
// since we can direcly see password in db so we use bcrypt to hide it
const hashedpassword=await bcrypt.hash(password,10)


  user=await User.create({
    name,
    email,
    password:hashedpassword
  })

   const token=jwt.sign({_id:user._id},"randomjij")
  

  res.cookie("token",token,{
    httpOnly:true,
    expires:new Date(Date.now()+60*1000)
  })
  res.redirect("/loginbutton") // if we dont redirect loadiing is infinite as its not returning anything
})

app.post("/login",async(req,res)=>{
  const {email,password}=req.body

  let user=await User.findOne({email})

  if(!user) return res.redirect("/register")

  //its for unencrypted password //const isMatch=user.password===password //user.passowrd return by db model and passowrd is by post rqst form
 //for encrypted password

 const isMatch=await bcrypt.compare(password,user.password)
 
 if(!isMatch) return res.render("login",{message:"incorrect password"})
 


// if match then all lower steps 
  const token=jwt.sign({_id:user._id},"randomjij")
  

  res.cookie("token",token,{
    httpOnly:true,
    expires:new Date(Date.now()+60*1000)
  })
  res.redirect("/loginbutton") 
})

app.get("/logout",(req,res)=>{// logout is null
  res.cookie("token",null,{
    httpOnly:true,
    expires:new Date(Date.now()),
  });
  res.redirect("loginbutton")

})


app.get("/login",(req,res)=>{
  res.render("login")
})

app.get("/success",(req,res)=>{  //  ejs
    // render use for dynamic paging {}-> pass variables
   res.render("success")// use app.set for allowing it to function
   //heere success refer to success.ejs in view 
})

app.get("/register",(req,res)=>{
  res.render("register")
})
      
app.post("/contact",async (req,res)=>{
    
    
  await Message.create({name: req.body.name,email: req.body.email});
  res.redirect("/success")
  
   // res.render("success") we can render or redirect to get route
   // redirection to any get route
   // async and waait
});





// app.get("/add", (req, res) => { // api to store in db
//   Message.create({ name: "abhi", email: "sample@gmail.com" }).then(() => {
//     res.send("NICE");
//   });
// });// sample to see  how to store
  


app.get("/users",(req,res)=>{
    res.json({
     users,
    })
 })

app.listen(8080,()=>{
    console.log("server is working")
})
