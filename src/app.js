require("dotenv").config();
const express = require("express");
const app = express();
const hbs = require("hbs");
const path = require("path");
const port = process.env.PORT || 5152;
require("./db/conn.js");
const Register = require("./models/registers");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");

const staticPath = path.join(__dirname, "../public");
const templatePath = path.join(__dirname, "../templates/views");
const partialPath = path.join(__dirname, "../templates/partials");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.set("view engine", "hbs");
app.set("views", templatePath);
hbs.registerPartials(partialPath);
app.use(express.static(staticPath));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/secret", auth, (req, res) => {
  res.render("secret");
});

app.get("/logout", auth, async (req, res) => {
  try {
    //Single logout
    // req.user.tokens = req.user.tokens.filter((currenttoken)=>{
    //     return currenttoken !== req.token;
    // });


    //Logout from all
    req.user.tokens = [];
    
    res.clearCookie("jwt");
    await req.user.save();
    res.render("login");

  } catch (error) {
    console.log(error);
    res.status(404).render("errorpage", {
      errorMessage: "Error in loging out",
    });
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerStudent = new Register({
        firstname: req.body.firstname,
        middlename: req.body.middlename,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        enrollment_Number: req.body.enroll,
        password: password,
        confirmpassword: cpassword,
        city: req.body.city,
      });

      const token = await registerStudent.generateAuthToken();

      res.cookie("jwt", token),
        {
          expires: new Date(Date.now() + 60000),
          httpOnly: true,
        };

      const registered = await registerStudent.save();
      res.status(201).render("index");
    } else {
      res.status("404").render("errorpage", {
        errorMessage: "password do not match",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).render("errorpage", {
      errorMessage: "Sorr, Looks like something is Wrong",
    });
  }
});

app.post("/login", async (req, res) => {
  try {
    const enroll = req.body.enroll;
    const password = req.body.password;

    const userEnroll = await Register.findOne({ enrollment_Number: enroll });

    const token = await userEnroll.generateAuthToken();

    res.cookie("jwt", token),
      {
        expires: new Date(Date.now() + 60000),
        httpOnly: true,
        // secure:true
      };

    const isMatch = await bcrypt.compare(password, userEnroll.password);
    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.status(404).render("errorpage", {
        errorMessage: "Password or email do not match with the database",
      });
    }
  } catch (error) {
    res.status(404).render("errorpage", {
      errorMessage: "Login Detail do not match",
    });
    console.log(error);
  }
});

app.get("*", (req, res) => {
  res.render("errorpage.hbs");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
