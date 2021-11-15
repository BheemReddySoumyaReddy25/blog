const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
  
app.use(express.static(__dirname + '/public'));

var fs = require('fs');
var path = require('path');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

require('dotenv/config');
mongoose.connect('mongodb+srv://admin_soumya:hahaha@cluster0.20mmm.mongodb.net/Blog1DB?retryWrites=true&w=majority',{ useUnifiedTopology: true ,useNewUrlParser: true});
const postSchema = {

    name: String,
    location:String,
    content: String,
    img:
    {
        data: Buffer,
        contentType: String
    }
   
   };
var multer = require('multer');

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null,__dirname+'/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});
    
var upload = multer({ storage: storage });
var imgModel = mongoose.model("Image",postSchema);
app.get("/",(req,res)=>{
    res.render("welcome");
})

app.get('/home', (req, res) => {
    imgModel.find({}, (err, items) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('home', {StartingContent:homeStartingContent, items: items });
        }
    });
});

app.get("/compose",(req,res)=>{
    res.render("compose");
});

app.post('/compose', upload.single('image'), (req, res, next) => {
    console.log(req.file.filename);
    var obj = new imgModel({
        name: req.body.name,
        location:req.body.location,
        content: req.body.content,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    });
    obj.save(function(err){
        if(!err)
        res.redirect("/home");
      });
});

app.get("/about",(req,res)=>{
    res.render('about',{aboutContent:aboutContent});
});

app.get("/contact",(req,res)=>{
    res.render('contact',{contactContent:contactContent});
});

app.get("/posts/:post_id",(req,res)=>{
    let parm_id =  req.params.post_id;
    imgModel.findById({_id:parm_id},function(err,post){
      
      if(!err)
        res.render("post",{image:post});
    })
    
});

app.get("/update/:id",(req,res)=>{
    let id = req.params.id;
    imgModel.findById({_id:id}, (err, item) => {
        if (err) {
            console.log(err);
            res.status(500).send('An error occurred', err);
        }
        else {
            res.render('update', {StartingContent:homeStartingContent, item: item });
        }
    });
});

app.post('/update/:id', upload.single('image'), (req, res, next) => {
    let id = req.params.id;
   
    imgModel.updateOne({_id:id},{$set:{_id:id,name: req.body.name,location:req.body.location,content: req.body.content}},(err,docs)=>{
        if(!err){
            console.log(docs);
            res.redirect("/home");
        }
    });
});

app.get("/delete/:id",(req,res)=>{
    const postID = req.params.id;
    imgModel.findByIdAndRemove({_id:postID},function(err){
        if(!err)
          res.redirect("/home");
      });
});

app.listen(3000,()=>{
    console.log("server is running in port 3000");
    
});