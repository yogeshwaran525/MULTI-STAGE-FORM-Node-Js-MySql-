const express = require('express')
const router = express.Router();
const userContoller = require("../controllers/user");
// ["/","/login"] for url path "/" or "/login" render the login page
router.get(["/","/login"],(req,res)=>{
    res.render("login");
})

router.get("/register",(req,res)=>{
    res.render("register");
})
// Check user already login or not to show profile page
router.get("/profile", userContoller.isLoggedIn, (req, res) => {
    if (req.user) {
      res.render("profile", { user: req.user });
    } else {
      res.redirect("/login");
    }
  });
// Check user already login or not to show home page
router.get("/home",userContoller.isLoggedIn,(req,res,next)=>{
    if (req.user) {
        res.render("home", { user: req.user });
      } else {
        res.redirect("/login");
      }
})


module.exports = router;