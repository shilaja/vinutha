const express=require('express');

const router=express.Router();

router.get('/',(req,res)=>{
    res.render('index');
});

router.get('/register',(req,res)=>{
    res.render('register');
});

router.get('/login',(req,res)=>{
    res.render('login');
});

router.get('/forgotpassword',(req,res)=>{
    res.render('forgotpassword');
});


router.get('/resetpassword',(req,res)=>{
    res.render('resetpassword');
});


module.exports=router;