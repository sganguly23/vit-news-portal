const express = require('express')
const path= require("path")
const app = express()
const OpenAI=require("openai")
const handlebars=require("express-handlebars")

const alert=require("alert")
const bodyParser=require('body-parser')

const User = require("./db/conn");
const News = require("./db/nconn")
const { constants } = require('fs/promises')
const { title } = require('process')
const fs=require('fs')
const multer = require('multer');


const port = process.env.PORT || 4000

const static_path=path.join(__dirname, "../public");

app.use(express.static(static_path));
app.set("view engine","html")
app.use(express.urlencoded({extended:false}))

app.get("/", (req, res) => {
  res.sendFile(static_path+'/login.html')
})


app.set("view engine","hbs")
app.use(bodyParser.urlencoded({extended:false}))
app.post("/login",async (req,res)=>{
  
  const name=req.body.name;
  const pass=req.body.pass;
  const chk=req.body.check;
  const data={
    username:name,
    password:pass,
    check:chk
  };
  console.log(name);
  console.log(chk);
  const ch=await User.isthisemail(name);
  if (!ch) {
      const usr=await User.findOne({username:name});
      if (usr.password===pass){
        console.log("success")
        const news= await News.find().sort({Datesort:-1});
        global.newsNumber=news.length
        
        if (chk=="on"){
          if (usr.admin=="yes"){
            res.render(static_path+'/adminpage',{news:news})
          }
          else{
            alert("you are not an admin")
            res.sendFile(static_path+'/login.html')
          }
        }
        else{
          res.render(static_path+'/main',{news:news})
        }
      }
      else{
        alert("Password didn't match")
        res.sendFile(static_path+'/login.html')
      }
  
  }  
  else{
    alert("user doesn't exist")
  }
  
})

app.post("/signup",async (req,res)=>{
  const name=req.body.name;
  const pass=req.body.pass;
  const dob=req.body.dob;
  const cpass=req.body.cpass;

  
  const data={
    username:name,
    password:pass,
    dob:dob,
    admin:"no"
};
  console.log(data);
  const ch=await User.isthisemail(name);
  if (!ch) {
    alert("user already exists")
    res.sendFile(static_path+'/signup.html')
    return
  }
  
  if (pass==cpass){ 
      await User.create(data)   
      alert("you are being redirected to login page")
      res.sendFile(static_path+'/login.html')
      
      return
  }
  else{
    alert("password didn't match")

  }
})

const openai=new OpenAI({
  apiKey:"sk-proj-QZThvZ3p3c5F1wJLhpxxT3BlbkFJWdoIhsKbHzd2blNyOQUU"
})


app.get('/summarize',async(req,res)=>{
  var userPrompt=req.query.newsArea;
  var userprompt=userPrompt+"\n"+"Summarize the above text in 70 words"

  const response=await openai.chat.completions.create({
    model:"gpt-3.5-turbo",
    messages:[{"role":"user","content":userprompt}]
  })
  const summary=response.choices[0].message.content
  global.globalNews=userPrompt;
  global.globalSummary=summary;
  res.render(static_path+'/admininsert',{message1:userPrompt,message2:summary})
  
})

app.get('/home',async(req,res)=>{
  console.log("Home")
  const news= await News.find().sort({Datesort:-1});
  res.render(static_path+'/main.hbs',{news:news})
})

app.get('/logout',async(req,res)=>{
  res.sendFile(static_path+'/login.html')
})

app.get('/Events',async(req,res)=>{
  console.log("events")
  const news= await News.find({Genre:"Event"}).sort({Datesort:-1});
  res.render(static_path+'/Genres/Events.hbs',{news:news})
})

app.get('/Academics',async(req,res)=>{
  console.log("Academics")
  const news= await News.find({Genre:"Academics"}).sort({Datesort:-1});
  res.render(static_path+'/Genres/Academics.hbs',{news:news})
})

app.get('/Placements',async(req,res)=>{
  console.log("placements")
  const news= await News.find({Genre:"Placement"}).sort({Datesort:-1});
  res.render(static_path+'/Genres/Placements.hbs',{news:news})
})

app.get('/Sports',async(req,res)=>{
  console.log("Sports")
  const news= await News.find({Genre:"Sports"}).sort({Datesort:-1});
  res.render(static_path+'/Genres/Sports.hbs',{news:news})
})

app.get('/insert',async(req,res)=>{
  res.render(static_path+'/admininsert.hbs')
})

app.get('/adminhome',async(req,res)=>{
  const news= await News.find().sort({Datesort:-1});
  res.render(static_path+'/adminpage.hbs',{news:news})
})
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, 'public/images/') 
  },
  filename: function (req, file, cb) {
      const Slno=global.newsNumber+1
      const uniqueSuffix="Picture"+Slno;
      const newFileName = uniqueSuffix + ".png";
      cb(null, newFileName); 
  }
});

const upload = multer({ storage: storage });

app.post('/saveDb',upload.single('file'),async(req,res)=>{

  if (!req.file) {
    console.log('No file uploaded.');
  }

  const filePath = req.file.path;

  function getOrdinalSuffix(day) {
    if (day === 1 || day === 21 || day === 31) {
      return "st";
    } else if (day === 2 || day === 22) {
      return "nd";
    } else if (day === 3 || day === 23) {
      return "rd";
    } else {
      return "th";
    }
  }
  const sl=await News.find();
  const SLNo=sl.length+1;
  const title=req.body.title;
  const dt=req.body.dates;
  const timestamp = Date.parse(dt);
  const date= new Date(timestamp);
  console.log(date)
  const dateParts = dt.split('-');
  const year = parseInt(dateParts[0]);
  const month = parseInt(dateParts[1]);
  const day = parseInt(dateParts[2]);
  

  const monthNames = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
  ];
  const formattedDate = `${day}${getOrdinalSuffix(day)} ${monthNames[month - 1]}, ${year}`;
  const news=global.globalNews;
  const summary=global.globalSummary;
  const genre=req.body.Genre;
  const campus=req.body.cam;
  
  const data={
    SLNo:SLNo,
    Title:title,
    Date:formattedDate,
    Genre:genre,
    Campus:campus,
    Details:news,
    Summary:summary,
    Datesort:date
};
  await News.create(data)
  alert("News uploaded successfully")
})



app.listen(port, () => {
  console.log(`the app listening on port ${port}`)
});

