const express = require('express');
const { isBuffer } = require('util');
const passport = require("passport");
const bodyParser = require("body-parser");
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const User = require("./models/user");
const fs = require('fs');
const path = require('path');
const multer = require('multer');
var ObjectId = require('mongodb').ObjectID;
// const imgModel              =  require('./models/model');

//bring in mongoose
const mongoose = require('mongoose');
var otp1;
//bring in method override
const methodOverride = require('method-override');

const imageRouter = require('./routes/uploads');
const Image = require('./models/Image');
const blogRouter = require('./routes/blogs');
const Blog = require('./models/Blog');

const app = express();

//connect to mongoose
mongoose.connect('mongodb://localhost/crudblog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(require("express-session")({
  secret: "Any normal Word",       //decode or encode session
  resave: false,
  saveUninitialized: false
}));
passport.serializeUser(User.serializeUser());       //session encoding
passport.deserializeUser(User.deserializeUser());   //session decoding
passport.use(new LocalStrategy(User.authenticate()));
app.use(bodyParser.urlencoded(
  { extended: true }
))
app.use(passport.initialize());
app.use(passport.session());

//set template engine
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

var storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

var upload = multer({ storage: storage }).single('profile');

//route for the index

app.get("/", (req, res) => {
  res.render("home");
})

app.get("/team", (req, res) => {
  res.render("team");
})

app.get("/termsandconditions", (req, res) => {
  res.render("termsandconditions");
})

app.get("/userprofile", isLoggedIn, (req, res) => {
  res.render("userProfile");
})
//Auth Routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/contests", (req, res) => {
  res.render("contests");
});

app.get("/user", (req, res) => {
  res.render("user");
});

app.post('/user', function (req, res) {
  User.findOneAndUpdate({ _id: req.session.userId }, {
    $set: {
      firstName:
        req.body.firstName, lastName: req.body.lastName
    }
  }, { upsert: true, new: true }, function (err, User) {
    if (err) {
      if (err) res.json(err);
    }
    console.log(User);
  });
});


app.post("/login", passport.authenticate("local", {
  successRedirect: "/blogindex",
  failureRedirect: "/login"
}), function (req, res) {

});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/explore", (req, res) => {
  res.render("explore");
});
class admin{
  constructor(username,password){
    this.username=username;
    this.password=password; 
}
}
class user extends admin{
     constructor(firstname,password,lastname,username,email,gender,phone,bio,image){
      super(username,password);
      this.firstname=firstname;
      this.password=password;
      this.lastname=lastname;
      this.email=email;
      this.gender=gender;
      this.phone=phone;
      this.bio=bio;
      this.image=image;
     }
}
app.post("/register", upload, (req, res) => {
  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lalithkumar1512@gmail.com',
      pass: 'leeladitya'
    }
  });
  var otp = Math.floor(Math.random() * 9999) + 1000;
  console.log(otp)
  otp1 = otp;
  let email = req.body.email;
  console.log(email)
  var mailOptions = {
    from: 'lalithkumar1512@gmail.com',
    to: email,
    subject: '',

    text: 'otp is:' + otp + '\nis your otp'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
 
  let u=new user(req.body.firstname,req.body.password,req.body.lastname,req.body.username,req.body.email,req.body.gender,req.body.phone,req.body.bio,req.file.filename);

  User.register(new User({
    firstname: u.firstname,
    lastname: u.lastname,
    username: u.username,
    email: u.email,
    gender: u.gender,
    phone: u.phone,
    bio: u.bio,
    image: u.filename,
  }),
    u.password,
    function (err, user) {
      if (err) {
        console.log(err);
        res.render("register");
      }
      passport.authenticate("local")(req, res, function () {
        res.redirect("../otp");
      })
    })
})

app.get("/otp", (req, res) => {
  res.render("otp");
});

app.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword");
});

app.get("/admin", (req, res) => {
  res.render("admin");
});

app.post('/admin', async (req, res) => {
  let ad=new admin(req.body.username,req.body.password);
  var username= ad.username;
  var password= ad.password;
  if (username == "picturesque" && password == "picturesque") {
    res.redirect('../display');
  } else {
    res.redirect('../admin');
  }

});

app.post('/otp', async (req, res) => {
  var otp = req.body.otp;
  if (otp1 == otp) {
    res.redirect('../');
  } else {
    res.redirect('../otp');
  }

});

app.post('/forgotpassword', async (req, res) => {
  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lalithkumar1512@gmail.com',
      pass: 'leeladitya'
    }
  });
  var otp = Math.floor(Math.random() * 9999) + 1000;
  console.log(otp)
  otp1 = otp;
  let email = req.body.email;
  console.log(email)
  var mailOptions = {
    from: 'lalithkumar1512@gmail.com',
    to: email,
    subject: '',

    text: 'otp is:' + otp + '\nget lost'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
  res.redirect('../otp');
});

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
}


app.get('/display', (req, res, next) => {
  User.find({}, function (err, users) {
    if (err) throw err;
    res.render('display', { users: users });
  });
});

app.post('/display', async (req, res) => {
  User.deleteOne({ _id: ObjectId(req.body.queryname) }, (err, data) => {
    console.log("user with id" + req.body.queryname + "is removed")
  })
  if(req.body.emailname!=undefined){
  User.findOne({ _id: ObjectId(req.body.emailname) })
    .then(user => {
      if (user.email != null) {
        console.log(user.email);
        var nodemailer = require('nodemailer');
        var transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'lalithkumar1512@gmail.com',
            pass: 'leeladitya'
          }
        })
        let mailOptions = {
          from: 'lalithkumar1512@gmail.com',
          to: user.email,
          subject: 'About contests',
          text: 'heyy!!hii!!\nNew contests are on.have a look on it'
        };
        
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log('Email sent: ' + info.response);
          }
        })
      
      }})
    }
  res.redirect('/display')
})

app.get('/imageindex', async (request, response) => {
  let uploads = await Image.find().sort({ timeCreated: 'desc' });

  response.render('imageindex', { uploads: uploads });
});

app.get('/blogindex', async (request, response) => {
  let blogs = await Blog.find().sort({ timeCreated: 'desc' });

  response.render('blogindex', { blogs: blogs });
});

app.use(express.static('public'));
app.use('/uploads', imageRouter);
app.use('/blogs', blogRouter);

//listen port
app.listen(5003);