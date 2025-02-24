import * as dotenv from 'dotenv';
dotenv.config(); // load environment variables from a .env file into process.env.
const neo4j = require('neo4j-driver')
const driver = neo4j.driver(process.env.database_URL, neo4j.auth.basic(process.env.database_username, process.env.database_password))
export { driver }