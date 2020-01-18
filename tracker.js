var mysql = require("mysql");
var inquirer = require("inquirer");
var ctable = require("console.table");
var util = require("util")

var connection = mysql.createConnection({
  host: "localhost",

  port: 3306,

  user: "root",

  password: "jojo2448",
  database: "employee_trackerDB"
});

connection.connect(function (err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId);
  start();
});

function start() {
  //initial prompt 
  inquirer
    .prompt([
      {
        name: "editORview",
        type: "list",
        message: "Would you like to add, view, or update a Department, Role or an Employee?",
        choices: ["DEPARTMENT", "ROLE", "EMPLOYEE"]
      }
    ])
    .then(function (answer) {
      // based on their answer, either call the department. role or employee functions or exit
      if (answer.editORview === "DEPARTMENT") {
        editDepartment();
      }
      else if (answer.editORview === "ROLE") {
        editRole();
      }
      else if (answer.editORview === "EMPLOYEE") {
        editEmployee();
      } else {
        connection.end();
      }
    });
}
//Next 3 functions are for options with the DEPARTMENT Table
function editDepartment() {
  inquirer
    .prompt([
      {
        name: "editDept",
        type: "list",
        message: "Would you like to [ADD] or [VIEW] a Department?",
        choices: ["ADD", "VIEW"]
      }
    ])
    .then(function (answer) {
      // based on their answer, either call the ADD, VIEW or UPDATE functions for Department
      if (answer.editDept === "ADD") {
        addDept();
      }
      if (answer.editDept === "VIEW") {
        viewDept()
      }      
    });
}
function addDept() {
  //ask for new department name
  inquirer
    .prompt([
      {
        name: "newDept",
        type: "input",
        message: "What's the name of the New Department you would like to add?"
      },
    ])
    .then(function (answer) {
      // when finished prompting, insert a new department into the db with that info
      connection.query(
        "INSERT INTO department SET ?",
        {
          name: answer.newDept,
        },
        function (err) {
          if (err) throw err;
          console.log("Congratulations, your new department " + answer.newDept + " was added.");
          start();
        }
      )
    });
}
function viewDept() {
  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    start();
  });
}

//Next 3 functions are for options with the ROLE Table
function editRole() {
  inquirer
    .prompt({
      name: "editRole",
      type: "list",
      message: "Would you like to [ADD], or [VIEW] a Role?",
      choices: ["ADD", "VIEW"]
    })
    .then(function (answer) {
      // based on their answer, either call the ADD, VIEW or UPDATE functions for Role
      if (answer.editRole === "ADD") {
        addRole();
      }
      else if (answer.editRole === "VIEW") {
        viewRole();
      }      
    });
}
function addRole() {
  //ask for new role name
  connection.query(
    "Select department.id, department.name From department", (err, departs) => {

      const departChoices = departs.map(({ id, name }) => ({
        name: name,
        value: id
      }))
      inquirer
        .prompt([
          {
            name: "newRole",
            type: "input",
            message: "What's the name of the New Role you would like to add?"
          },
          {
            name: "newPay",
            type: "input",
            message: "What's the salary of the New Role you would like to add?"
          },
          {
            name: "depart",
            type: "list",
            message: "What's the department of the New Role you would like to add?",
            choices: departChoices
          },

        ])
        .then(function (answer) {
          // when finished prompting, insert a new role into the db with that info
          connection.query(
            "INSERT INTO role SET ?",
            {
              title: answer.newRole,
              salary: answer.newPay,
              department_id: parseFloat(answer.depart).toFixed(2)
            },
            function (err) {
              if (err) throw err;
              console.log("Congratulations, your new role " + answer.newRole + " was added.");
              start();
            }
          )
        });
    })
}

function viewRole() {
  connection.query("SELECT * FROM role", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    start()
  });
}

//Next four functions are for options with the EMPLOYEE Table
function editEmployee() {
  inquirer
    .prompt({
      name: "editEmployee",
      type: "list",
      message: "Would you like to [ADD], [VIEW], or [UPDATE] an Employee?",
      choices: ["ADD", "VIEW", "UPDATE"]
    })
    .then(function (answer) {
      // based on their answer, either call the ADD, VIEW or UPDATE functions for Employee
      if (answer.editEmployee === "ADD") {
        addEmp();
      }
      else if (answer.editEmployee === "VIEW") {
        viewEmp();
      }
      else if (answer.editEmployee === "UPDATE") {
        updateEmp();
      }      
    });
}
connection.query = util.promisify(connection.query);
function findRoles(){
  return connection.query(
    "SELECT role.id, role.title FROM role"
  )
}
function findEmployees(){
  return connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name FROM employee"
  )
}
async function addEmp() {
  //select which employee you want to update 
  const employees = await findEmployees()
    
  inquirer
    .prompt([
      {
        name: "newFirstEmp",
        type: "input",
        message: "What's the first name of the New Employee you would like to add?"
      },
      {
        name: "newLastEmp",
        type: "input",
        message: "What's the last name of the New Employee you would like to add?"
      },
      {
        name: "newRoleEmp",
        type: "list",
        message: "What's the role_id of the New Employee you would like to add?",
        //loop through managers to see which one will be thiers if they have one     
        choices: function () {
          connection.query()
          const jobChoices = [];
          for (var i = 0; i < results.length; i++) {
            jobChoices.push(results[i].role_id);
          }
          return jobChoices;
        },      
      },
      {
        name: "newEmpBoss",
        type: "list",
        message: "What's the manager_id of the New Employee you would like to add?",
        choices: function () {
          const bossChoices = [];
          for (var i = 0; i < results.length; i++) {
            bossChoices.push(results[i].role_id);
          }
          return bossChoices;
        },
      }
    ])
    .then(function (answer) {
      // when finished prompting, insert a new employee into the db with that info
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: answer.newFirstEmp,
          last_name: answer.newLastEmp,
          role_id: answer.newRoleEmp,
          manager_id: answer.newEmpBoss
        },
        function (err) {
          if (err) throw err;
          console.log(`Congratulations, your new employee ${answer.newFirstEmp} ${answer.newLastEmp} was added.`);
          start();
        }
      )
    });
}
function viewEmp() {
  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;
    // Log all results of the SELECT statement
    console.table(res);
    start();
  });
}
function updateEmp() {
  inquirer
    .prompt([
    {
      name: "upRoleEmp",
      type: "list",
      //loop through job roles to pick role needed      
      choices: function () {
        connection.query()
        const jobChoices = [];
        for (var i = 0; i < results.length; i++) {
          jobChoices.push(results[i].role_id);
        }
        return jobChoices;
      },
      message: "What's the role_id of the Employee you would like to update?",
    },
  ])
  .then(function (answer) {
    connection.query(
        "INSERT INTO employee SET ?",
        {
          role_id: answer.upRoleEmp,
        },
        function (err) {
            if (err) throw err;
            console.log("Congratulations, your employee " + answer.upRoleEmp + " was updated.");
            start();
        },
    )
  });
}
  //--------------MALFUNCTION============updateDept Runs code but stops after the prompt with no response-----------
/*function findEmployees(){
  return connection.query(
    "SELECT employee.id, employee.first_name, employee.last_name FROM employee"
  )
}
async function updateEmp() {      
    const employees = await findEmployees()
  inquirer
    .prompt([
      {
        name: "upFirstEmp",
        type: "input",
        message: "What's the first name of the Employee you would like to add?"
      },
      {
        name: "upLastEmp",
        type: "input",
        message: "What's the last name of the New Employee you would like to add?"
      },
      {
        name: "upRoleEmp",
        type: "list",
        message: "What's the role_id of the New Employee you would like to add?",
        choices: jobChoices
        
      },
      {
        name: "newEmpBoss",
        type: "list",
        message: "What's the manager_id of the New Employee you would like to add?",
        choices: bossChoices
      }
    ])
    .then(function (answer) {
      // when finished prompting, insert a new employee into the db with that info
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: answer.newFirstEmp,
          last_name: answer.newLastEmp,
          role_id: answer.newRoleEmp,
          manager_id: answer.newEmpBoss
        },
        function (err) {
          if (err) throw err;
          console.log(`Congratulations, your new employee ${answer.newFirstEmp} ${answer.newLastEmp} was added.`);
          start();
        }
      )
    });
}
  connection.query("UPDATE employee SET ? WHERE ?",
    [
      {
        first_name: first_name
      },
      {
        last_name: last_name
      },
      {
        role_id: 2
      },
      {
        manager_id: 2
      }
    ],
    function (err, res) {
      if (err) throw err;
      console.log(res.affectedRows + " department updated!\n");
    }
  );*/






