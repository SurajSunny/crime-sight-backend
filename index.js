const http = require('http');
const oracledb = require('oracledb');
async function run() {
  let connection;

  console.log("Starting the function");

  try {
    console.log("Trying to get a connection");
    connection = await oracledb.getConnection({
      user: 'mittalarchit', 
      password: 'Ba4f9X8FYhkkDv35Lc7QU6N4',
      connectString: 'oracle.cise.ufl.edu:1521/orcl'
    });

    console.log('Successfully connected to Oracle Database');

    // Execute some queries here
    const result = await connection.execute(
      `SELECT * FROM WCOUNTRY`,
    );

    console.log(result);

  } catch (err) {
    console.log("Caught an error");
    console.error(err);
  } finally {
    if (connection) {
      try {
        console.log("Closing the connection");
        await connection.close();
      } catch (err) {
        console.log("Error while closing the connection");
        console.error(err);
      }
    }
  }
}

console.log("Calling the function");
run();
console.log("Function called");
