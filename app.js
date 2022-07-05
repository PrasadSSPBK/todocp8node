const express = require("express");
const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const databasePath = path.join(__dirname, "todoApplication.db");
let database = null;

const intiliazerDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => console.log("Server Running"));
  } catch (e) {
    console.log(`Db Error Message:${e.message}`);
    process.exit(1);
  }
};
intiliazerDbAndServer();

const convertDbToTable = (dbObj) => {
  return {
    id: dbObj.id,
    todo: dbObj.todo,
    priority: dbObj.priority,
    status: dbObj.status,
  };
};

//API 1

app.get("/todos/", async (request, response) => {
  const { search_q = "", status = "", priority = "" } = request.query;

  let getQuery;
  if (status !== "" && priority !== "") {
    getQuery = `SELECT * FROM todo where  priority like "${priority}" and
         status like "${status}" ;`;
  } else if (priority !== "") {
    getQuery = `SELECT * FROM todo where priority like "${priority}" ;`;
  } else if (status !== "") {
    getQuery = `SELECT * FROM todo where
         status like "${status}" 
        ;`;
  } else if (search_q !== "") {
    getQuery = `SELECT * FROM todo where
         todo like "%${search_q}%" 
        ;`;
  }
  const result = await database.all(getQuery);
  response.send(result.map((each) => convertDbToTable(each)));
});

//API 2

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const result = await database.get(getQuery);
  response.send(convertDbToTable(result));
  //   response.send("success");
});

//API 3

app.post("/todos/", async (request, response) => {
  const { todo, priority, status } = request.body;
  const postQuery = `INSERT INTO todo
  (todo,priority,status)
  VALUES
  ("${todo}","${priority}","${status}");`;
  const result = await database.run(postQuery);
  response.send("Todo Successfully Added");
});

//API 4

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const { status = "", priority = "", todo = "" } = request.body;
  let message;
  let putQuery;
  if (status !== "") {
    putQuery = `UPDATE todo 
      SET
      status="${status}"
      where id=${todoId};`;
    message = "Status Updated";
  } else if (priority !== "") {
    putQuery = `UPDATE todo 
      SET
      priority="${priority}"
      where id=${todoId};`;
    message = "Priority Updated";
  } else if (todo !== "") {
    putQuery = `UPDATE todo 
      SET
      todo="${todo}"
      where id=${todoId};`;
    message = "Todo Updated";
  }
  const result = await database.run(putQuery);
  response.send(message);
});

//API 5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteQuery = `DELETE FROM todo 
        where id=${todoId};`;
  const result = await database.run(deleteQuery);
  response.send("Todo Deleted");
});

module.exports = app;
