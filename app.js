const express = require("express");
const mysql = require("mysql");
const doenv = require("dotenv");
const path = require("path");
const hbs = require("hbs");
const cookieParser = require("cookie-parser");

const app = express();

doenv.config({
  path: "./.env",
});
const db = mysql.createConnection({
    host:  process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});

db.connect((err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("MySQL Connection Success");
    }
  });

app.use(cookieParser());
app.use(express.urlencoded({ extended : false}))

// Express (public folder assign)
const location =path.join(__dirname,"./public");
app.use(express.static(location));
// hbs handle bars html files
app.set("view engine","hbs");
// hbs register path views folder/partials folder /hbs files
const partialspath = path.join(__dirname+"/views/partials")
hbs.registerPartials(partialspath)

// Redirect to Folder router file pages.js module . exports
app.use("/",require("./routers/pages"))

// Redirect to Folder router file auth.js module . exports
app.use("/auth",require("./routers/auth"))

app.listen(5000,()=>{
    console.log("Server is listenong port 5000")
  });