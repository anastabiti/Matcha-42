let dotenv = require('dotenv').config()
console.log(dotenv);
const neo4j = require('neo4j-driver')
const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic(process.env.database_username, process.env.database_password))

const session = driver.session()


// #test database connection
// http://localhost:7474/browser/preview/
session.run('MATCH (n) return n')
  .then((res:any) => {
    console.log("database connection success");
  })
  .catch((error:any) => {
    console.error("database connection falied checki password and username, and env file");
  })
