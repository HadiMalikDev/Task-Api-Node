require("dotenv").config({ path: "./server/.env" });
const knex = require("./database/connection");
const Task = require("./models/task");
const User = require("./models/user");

console.log(process.env.PASS);
const x=async()=>{
  //  await User.createUser('Hadi','Had2@gmail.com','hahshsah');
  //  await createTasksTable()
    await Task.createTask('asdsad','asddas','Hadiii@gmail.com');
}

x()