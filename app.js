const express=require("express");
const path=require('path');
const mysql=require("mysql");
const app=express();
const dotenv=require("dotenv");

dotenv.config({path:'./.env'});

const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});

const publicDirectory=path.join(__dirname,'./public');
app.use(express.static(publicDirectory));

//Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded({extended:false}));
//Parse JSON bodies (as sent by API clients)
app.use(express.json());



app.set('view engine','hbs');


db.connect((error)=>{
    if(error){
        console.log(error)
    }else{
        console.log("MYSQL Connected....")
    }
})


const port=process.env.PORT || 5008;


//Define Routes
app.use('/',require('./routes/pages'));
app.use('/auth',require('./routes/auth'));







// const projectName = 'register'; 



app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});