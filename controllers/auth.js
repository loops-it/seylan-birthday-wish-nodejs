const express = require("express");
const multer = require('multer');
const db = require("../routes/db-config");
const dotenv = require("dotenv").config();
const sql = require("mysql");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const router = express.Router();
const flash = require('connect-flash');
const session = require('express-session');
const admin_add = require("./admin_add");
const admin_login = require("./admin-login");
const admin_logout = require("./adminlogout");
const admin_update = require("./admin_update");
const user_check_current_password = require("./user_check_current_password");
const admin_update_with_password = require("./admin_update_with_password");

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
var AdminDetails = sequelize.define('other_admin_details', {
  user_id :Sequelize.INTEGER,
  name : Sequelize.TEXT,
  phone : Sequelize.TEXT,
  status : Sequelize.TEXT
}, {
  timestamps: false,tableName: 'other_admin_details'
});

router.use(flash());
router.use(session({
  secret:'flashblog',
  saveUninitialized: true,
  resave: true
}));
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, 'public/uploads/') // Specify the folder where you want to store the files
    },
    filename: function(req, file, cb) {
      cb(null, file.originalname) // Keep the original name of the file
    }
  });
  
const upload = multer({ storage: storage });

router.post("/admin-add", admin_add)
router.post("/admin-login", admin_login)
router.get("/admin-logout", admin_logout)
router.post("/admin-update", admin_update)
router.post("/user-check-current-password", user_check_current_password)
router.post("/admin-update-with-password", admin_update_with_password)





module.exports = router;