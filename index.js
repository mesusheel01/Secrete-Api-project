import express from "express";
import bodyParser from "body-parser";
import  pg  from "pg";
import bcrypt from 'bcrypt';

const app = express();
const port = 3000;
const saltRound = 10;

const db = new pg.Client({
  user:"postgres",
  host: "localhost",
  database:"secrets",
  password:"passme",
  port: 5432, 
})
// connect database 
db.connect();


app.use(bodyParser.urlencoded({ extended: true }));//just write thismiddle ware to hold the request body 
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const username = req.body.username
  const password = req.body.password
  try{
    const findUser = await db.query("Select * from users where email = $1 ", [username])
    if(findUser.rows.length > 0) {
      res.send("User already exits!");
    }else{
      bcrypt.hash(password, saltRound,async function(err, hash) {
// Store hash in your password DB.
if(err) console.log(err)
else{
  const users = await db.query("Insert into users (email,password) values($1,$2)", [username, hash]);
  console.log("User Registered!",users)
  res.render("secrets.ejs");
}
      });
    }
      //after creation or you can say basic authentication you can show the secrts
    }catch(err){
      console.log("error:",err)
    }
});

app.post("/login", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  try{
    const findUser = await db.query("Select * from users where email = $1 ", [username])
    if(findUser.rows.length > 0){
     const user = findUser.rows[0];
     const storedPassword = user.password
     bcrypt.compare(password, storedPassword, function(err, result) {
      if(err) console.log("Error in password comparision: ", err);
      else{
        if(result){
          res.render("secrets.ejs");
        }else{
          console.log("Wrong password!");
        }
      }
  });
  }else{
    res.send("User not found");
  }
}
  catch(err){
      console.log("Error : ", err);
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
