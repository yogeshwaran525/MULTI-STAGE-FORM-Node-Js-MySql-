const mysql =require('mysql')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken") 
const { promisify } = require("util");


const db = mysql.createConnection({
    host:  process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASS,
    database: process.env.DATABASE,
});

// auth.js module exports router login
exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).render("login", {
          msg: "Please Enter Your Email and Password",
          msg_type: "error",
        });
      }  

db.query(
    "select * from users where email=?",
    [email],
    async (error, result) => {
      console.log(result);
      if (result.length <= 0) {
        return res.status(401).render("login", {
          // msg send the Content to login page
          // msg type is style the msg content
          msg: "Please Enter Valid Email and Password",
          msg_type: "error",
        });
      } else {
        // bcrypt.js encrypt the password
        if (!(await bcrypt.compare(password, result[0].PASS))) {
          return res.status(401).render("login",

          {
            msg: "Please Enter Correct Password",
            msg_type: "error",
          }
          );
        } else {
          const id = result[0].ID;
          // JWT JSON Web token create and expires is mentioned days in .env file 90days
          // 
          const token = jwt.sign({ id: id }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN,
          });
          // Cookie Expire time
          const cookieOptions = {
            expires: new Date(
              Date.now() +
                process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000
            ),
            // Only work on http
            httpOnly: true,
          };
          res.cookie("Yogesh", token, cookieOptions);
          res.status(200).redirect("/home");
        }
      }
    }
  );
} catch (error) {
  console.log(error);
}
};
  
// auth.js module exports router
exports.register = (req,res)=>{
    const {name,email,password,confirm_password} = req.body;
    // Check in email address already used or not search in Mysql database
    db.query('select email from users where email=?',[email],
    async (error,result)=>{
        if(error){
            console.log(error);
        }
        if(result.length>0){
            return res.render('register',{msg:'Email id already used'})
            // Password and confirm password matching
         }else if(password!==confirm_password){
            return res.render('register',{msg:'Password do not match'})
         }

        //  bcrypt.js ecncrypt the orginal password
         let hashedPassword = await bcrypt.hash(password, 8);
         console.log(hashedPassword);
   
         db.query(
           "insert into users set ?",
           { name: name, email: email, pass: hashedPassword },
           (error, result) => {
             if (error) {
               console.log(error);
             } else {
               return res.render("register", {
                 msg: "User Registration Success",
                 msg_type: "good",
               });
             }
           }
         );
    })
}



// is logged in
exports.isLoggedIn = async (req, res, next) => {
  req.name = "Check Login....";
  console.log(req.cookies);
  if (req.cookies.Yogesh) {
    try {
      const decode = await promisify(jwt.verify)(
        req.cookies.Yogesh,
        process.env.JWT_SECRET
      );
      console.log(decode);
      db.query(
        "select * from users where id=?",
        [decode.id],
        (err, results) => {
          console.log(results);
          if (!results) {
            return next();
          }
          req.user = results[0];
          return next();
        }
      );
    } catch (error) {
      console.log(error);
      return next();
    }
  } else {
    next();
  }
};

exports.logout = async (req, res) => {
  res.cookie("Yogesh","logout",{
    expires:new Date(Date.now()*2*1000),
    httpOnly:true
  });
  res.status(200).redirect("/")
}
