const { JsonWebTokenError } = require("jsonwebtoken");
const mysql=require("mysql");
const jwt=require('jsonwebtoken');
const bcrypt=require('bcryptjs');
const express = require('express');
const session = require('express-session');
const app = express();

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Adjust this based on your deployment environment
}));



const db=mysql.createConnection({
    host:process.env.DATABASE_HOST,
    user:process.env.DATABASE_USER,
    password:process.env.DATABASE_PASSWORD,
    database:process.env.DATABASE
});

exports.register=(req,res)=>{
    console.log(req.body);

    const{firstname,email,password,confirmpassword,phone}=req.body;

    if (!/^[a-zA-Z]+$/.test(firstname)) {
        return res.render('register', {
            message: 'Invalid name. Please enter a valid name containing only letters.'
        });
    }

    if (!/^\d{10}$/.test(phone)) {
        return res.render('register', {
            message: 'Invalid phone number. Please enter a valid 10-digit phone number.'
        });
    }

    if (
        !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+])[A-Za-z\d!@#$%^&*()_+]{8,}/.test(password)
    ) {
        return res.render('register', {
            message:
                'Invalid password. Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character.'
        });
    }

    db.query('SELECT email FROM userregister WHERE email=?',[email],async(error,results)=>{
        if(error){
            console.log(error);
        }
        if(results.length>0){
            return res.render('register',{
                message:'That email is already in use'
            })
        }else if(password!==confirmpassword){
            return res.render('register',{
                message:'Passwords do not match'
            });
     }

     let hashedPassword= await bcrypt.hash(password,8);
     console.log(hashedPassword);

    //  res.send("testing");

     db.query('INSERT INTO userregister  SET?',{firstname:firstname,email:email,password:hashedPassword,confirmpassword:confirmpassword,phone:phone},(error,results)=>{
        if(error){
            console.log(error);
        }else{
            console.log(results);
            return res.render('login',{
                message:'User successfully registered. You can now log in.'
            });
        }

     })

 });
}




exports.login = (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM userregister WHERE email = ?', [email], async (error, results) => {
        if (error) {
            console.log(error);
        }

        if (results.length === 0) {
            return res.render('login', {
                message: 'Email or password is incorrect.'
            });
        }

        const user = results[0];

        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.render('login', {
                message: 'Email or password is incorrect.'
            });
        }

        // You can set up a session or generate a token here for authentication

        return res.render('index', {
            message: 'Login successful. Welcome to the dashboard!',
            user: user
        });
    });
};


// const crypto = require('crypto');
// const moment = require('moment');
// exports.forgotpassword = (req, res) => {
//     const { email } = req.body;

//     db.query('SELECT * FROM userregister WHERE email = ?', [email], async (error, results) => {
//         if (error) {
//             console.log(error);
//         }

//         if (results.length === 0) {
//             return res.render('forgotpassword', {
//                 message: 'Email not found.'
//             });
//         }

//         const user = results[0];

//         // Generate a unique token
//         const reset_token = crypto.randomBytes(32).toString('hex');

//         // Store the token in the database along with the user's email and an expiration time
//         const resetTokenExpiresAt = new Date();
// resetTokenExpiresAt.setHours(resetTokenExpiresAt.getHours() + 1); // Set expiration time to 1 hour from now

        
//         // Extract the password from the user object
//         const password = user.password;

//         // Insert the record into the users table
//         db.query('INSERT INTO users (email, password, reset_token, reset_token_expires_at) VALUES (?, ?, ?, ?)',
//             [email, password, reset_token, resetTokenExpiresAt],
//             (insertError, insertResults) => {
//                 if (insertError) {
//                     console.log(insertError);
//                     return res.render('forgotpassword', {
//                         message: 'Error generating token. Please try again.'
//                     });
//                 }

//                 // Redirect the user to the reset password page with the token as a URL parameter
//                 res.redirect(`/resetpassword?token=${reset_token}`);
//             }
//         );
//     });
// };


// exports.resetpassword = (req, res) => {
//     const { reset_token, password } = req.body;

//     // Check if the token is valid and not expired
//     db.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires_at > NOW()', [reset_token], (err, results) => {
//         if (err) {
//             console.log(err);
//             return res.render('resetpassword', {
//                 message: 'Error validating token. Please try again.'
//             });
//         }

//         if (results.length === 0) {
//             console.log('Invalid or expired token. Results:', results);
//             return res.render('resetpassword', {
//                 message: 'Invalid or expired token.'
//             });
//         }

//         const email = results[0].email;

//         // Update the user's password in the database
//         db.query('UPDATE users SET password = ? WHERE email = ?', [password, email], (updateError, updateResults) => {
//             if (updateError) {
//                 console.log(updateError);
//                 return res.render('resetpassword', {
//                     message: 'Error resetting password. Please try again.'
//                 });
//             }

//             // Delete the used token from the database
//             db.query('DELETE FROM users WHERE reset_token = ?', [reset_token], (deleteError, deleteResults) => {
//                 if (deleteError) {
//                     console.log(deleteError);
//                     return res.render('resetpassword', {
//                         message: 'Error deleting token. Please try again.'
//                     });
//                 }

//                 console.log('Password reset successful. Token deleted:', reset_token);
//                 return res.render('login', {
//                     message: 'Password reset successful. You can now log in with your new password.'
//                 });
//             });
//         });
//     });
// };
