var mysql = require("mysql");
var inquirer = require("inquirer");
var ctable = require("console.table");
// var seed = require("")

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "jojo2448",
  database: "employee_trackerDB"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);  
  connection.end();
});

