import * as dotenv from 'dotenv';
dotenv.config(); // load environment variables from a .env file into process.env.
const neo4j = require('neo4j-driver')
const driver = neo4j.driver('neo4j://localhost:7687', neo4j.auth.basic(process.env.database_username, process.env.database_password))
export { driver }