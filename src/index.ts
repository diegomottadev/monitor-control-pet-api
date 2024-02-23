import express, { Express } from 'express';
import dotenv from 'dotenv';

const app: Express = express(); // Create an instance of the Express application
dotenv.config();

const port = process.env.NODE_ENV === 'test'  ? process.env.PORT_TEST :  process.env.PORT;

const server = app.listen(port, () => {
    console.log(`Enviroment ${process.env.NODE_ENV}`);
    console.log(`Server is running on port ${port}`);
});

export { app, server };
