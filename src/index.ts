import express, { Express } from 'express';
import dotenv from 'dotenv';
import { connectionDB } from "./database/connection"

const app: Express = express(); // Create an instance of the Express application
dotenv.config();

const port = process.env.NODE_ENV === 'test'  ? process.env.PORT_TEST :  process.env.PORT;


// Connect to the database
connectionDB().then((databaseExists: boolean) => {
    // Only run the initialization script if the database exists
    if (databaseExists) {
     console.log("Database does exist")
    } else {
      console.log('Database does not exist. Skipping initialization script.');
    }
  });
  

const server = app.listen(port, () => {
    console.log(`Enviroment ${process.env.NODE_ENV}`);
    console.log(`Server is running on port ${port}`);
});

export { app, server };
