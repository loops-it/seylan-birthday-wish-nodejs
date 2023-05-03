const { request } = require("express");
const express = require("express");
const multer = require('multer');
const flash = require('connect-flash');
const session = require('express-session');
const cors = require("cors");
const bodyParser = require('body-parser');
const adminloggedin = require("../controllers/adminloggedin");
const router = express.Router();
const db = require("./db-config");
const bcrypt = require("bcrypt");
const XLSX = require('xlsx');
const nodemailer = require('nodemailer');

require('dotenv').config();
const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
  host: process.env.DATABASE_HOST,
  dialect: 'mysql' 
});
var Users = sequelize.define('users', {
    email :Sequelize.INTEGER,
    password : Sequelize.TEXT,
    user_role : Sequelize.INTEGER,
    status : Sequelize.TEXT,
  }, {
    timestamps: false,tableName: 'users'
});
var Users = sequelize.define('users', {
    email :Sequelize.INTEGER,
    password : Sequelize.TEXT,
    user_role : Sequelize.INTEGER,
    status : Sequelize.TEXT,
  }, {
    timestamps: false,tableName: 'users'
  });
var SentMails = sequelize.define('sent_mails', {
    email :Sequelize.TEXT,
    date_time : Sequelize.TEXT,
  }, {
    timestamps: false,tableName: 'sent_mails'
  });
  const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/uploads/') // Specify the folder where you want to store the files
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname) // Keep the original name of the file
    }
  });
  
const upload = multer({ storage: storage });

router.use(session({
    secret:'flashblog',
    saveUninitialized: true,
    resave: true
}));
router.use(flash());
router.get('/', (req, res) =>{
    res.render("index.ejs")
});
router.get('/admin', (req, res) =>{
        res.render("admin-login.ejs")
});
router.get('/admin-dashboard', adminloggedin, (req, res) =>{
    if(req.admin_login_details){
        res.render("admin-dashboard.ejs",{admin_login_details:req.admin_login_details})
    }
   else{
    res.redirect("/admin");
   }
});
router.get('/add-admin', adminloggedin, (req, res) =>{
    if(req.admin_login_details){
        res.render("add-admin.ejs",{admin_login_details:req.admin_login_details})
    }
   else{
    res.redirect("/admin");
   }
});
router.get('/manage-admins', adminloggedin, (req, res) =>{
    if(req.admin_login_details){
        db.query('SELECT * FROM other_admin_details', function(err, admins) {
            if (err) throw err;
            res.render('manage-admins.ejs', { admins: admins,admin_login_details:req.admin_login_details });
          });
    }
   else{
    res.redirect("/admin");
   }
});
router.get('/edit-admin/:id', adminloggedin, (req, res) =>{
    if(req.admin_login_details){
        $user_id = req.params.id;
        db.query('SELECT * FROM other_admin_details WHERE user_id = '+$user_id+'', function(err, admin_details) {
            if (err) throw err;
            db.query('SELECT * FROM users WHERE id = '+$user_id+'', function(err2, login_details) {
                if (err2) throw err2;
                res.render('edit-admin.ejs', { admin_details: admin_details[0],login_details: login_details[0],admin_login_details:req.admin_login_details });
              });
          });
    }
   else{
    res.redirect("/admin");
   }
});
router.get('/deactivate-admin/:id', adminloggedin, (req, res) =>{
    if(req.admin_login_details){
        $user_id = req.params.id;
        db.query('UPDATE other_admin_details SET status = "inactive" WHERE user_id = "'+$user_id+'"',async (Err2, result2) =>{
            if(Err2) throw Err2;
            db.query('UPDATE users SET status = "inactive" WHERE id = "'+$user_id+'"',async (Err3, result3) =>{
                if(Err3) throw Err3;
                res.redirect("/manage-admins");
            })
        })
    }
   else{
    res.redirect("/admin");
   }
});
router.get('/activate-admin/:id', adminloggedin, (req, res) =>{
    if(req.admin_login_details){
        $user_id = req.params.id;
        db.query('UPDATE other_admin_details SET status = "active" WHERE user_id = "'+$user_id+'"',async (Err2, result2) =>{
            if(Err2) throw Err2;
            db.query('UPDATE users SET status = "active" WHERE id = "'+$user_id+'"',async (Err3, result3) =>{
                if(Err3) throw Err3;
                res.redirect("/manage-admins");
            })
        })
    }
   else{
    res.redirect("/admin");
   }
});
router.get('/send-birthday-wishes', adminloggedin, (req, res) =>{
    const successMessage = req.flash('success')[0];
    const errorMessage = req.flash('error')[0];
    if(req.admin_login_details){
        res.render("send-birthday-wishes.ejs",{admin_login_details:req.admin_login_details,successMessage:successMessage,errorMessage:errorMessage})
    }
   else{
    res.redirect("/admin");
   }
});
router.post('/send-wishes', upload.single('file'), function(req, res) {
const baseUrl = `${req.protocol}://${req.get('host')}`;
const {template} = req.body;
var template_name;
if(template == 1){
  template_name = "template_1.ejs"
}
else if(template == 2){
  template_name = "template_2.ejs"
}
else{
  template_name = "template_3.ejs"
}
res.render('email_templates/'+template_name+'', { baseUrl: baseUrl }, (err, html) => {
const fileName = req.file.originalname;
const workbook = XLSX.readFile('D:/seylan-birthday-nodejs/public/uploads/'+fileName);
const worksheet = workbook.Sheets[workbook.SheetNames[0]];

const emailAddresses = [];
const range = XLSX.utils.decode_range(worksheet['!ref']);
for (let i = range.s.r; i <= range.e.r; i++) {
  const cellAddress = XLSX.utils.encode_cell({ r: i, c: 0 });
  const cell = worksheet[cellAddress];
  if (cell && cell.t === 's' && cell.v.includes('@')) {
    emailAddresses.push(cell.v);
  }
}
var transporter = nodemailer.createTransport({
    host: "cybersand.io",
    port: 465,
    secure: true,
    auth: {
      user: "info@cybersand.io",
      pass: "i2ZK,9dW~fI)"
    }
  });
  
  for (const email of emailAddresses) {
    const mailOptions = {
      from: 'info@cybersand.io',
      to: email,
      subject: 'Happy Birthday',
      html: html,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log(`Error sending email to ${email}: ${error}`);
      } else {
        console.log(`Email sent to ${email}: ${info.response}`);
        SentMails.create({
          email: email,
        })
      }
    });
  }

  req.flash('success', 'All Mails Sent');
  res.redirect('/send-birthday-wishes');
});

});

module.exports = router;