import { Sequelize } from "sequelize-typescript"
import dotenv from 'dotenv';


dotenv.config();
// Determina el nombre de la base de datos basándose en el entorno
const dbName = process.env.NODE_ENV === 'test'  ? process.env.DB_NAME_TEST : process.env.DB_NAME;
console.log("name of database :"+ dbName)
/*

 - sequelize it creates a Sequelize instance for connecting to a MySQL database. 
 - It configures the dialect as "mysql" and sets the host, username, password, and database name based on environment variables.
 - The logging option is set to false to disable logging of database queries. 
 - It also specifies the models that will be used by Sequelize for database operations.

*/

 const sequelize = new Sequelize({
    dialect: "mysql",
    host: process.env.DB_HOST,
    username:process.env.DB_USER,
    password:process.env.DB_PASS,
    database:dbName,
    logging: false,
    models: [ __dirname+ "/models"]
})

/*

-connectionDB it is an asynchronous function that establishes a sequelize to the database by synchronizing
 the models with the database schema. 
-It uses the sync method provided by the Sequelize instance. If an error occurs during the synchronization process, 
 it is logged to the console.

*/

export const connectionDB = async (): Promise<boolean> => {
    try {
      await sequelize.sync();
      return true;
    } catch (error) {
    //   log.error(`Error connecting to the database: ${error}`);
      console.log(error);
      return false;
    }
  };
export const disconnectDB = async (): Promise<boolean> => {
  try {
    await sequelize.close();
    return true;
  } catch (error) {
    // log.error(`Error disconnecting from the database: ${error}`);
    console.log(error);
    return false;
  }
};
