import express, { Express,Request, Response } from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import logger from './api/resources/utils/logger';
import authJTW from './api/libs/auth';
import config from './api/config';
import passport from 'passport';
import { procesarErrores, erroresEnProduccion, erroresEnDesarrollo, procesarErroresDeTamañoDeBody } from './api/libs/errorHandler';
import { connectionDB } from "./database/connection"

import cors from 'cors';
import usersRouter from './api/resources/users/users.route';
import authRouter from './api/resources/auth/auth.route';
import rolesRouter from './api/resources/roles/roles.route';
import permissionsRouter from './api/resources/permissions/permissions.route';
import profileRouter from './api/resources/profile/profile.route';
import { initializeDatabase } from './helpers/initializeDatabase';
import petRouter from './api/resources/pets/pet.route';
import vaccineRouter from './api/resources/vaccine/vaccine.route';
import antiparasiticRouter from './api/resources/antiparasitic/antiparasatic.route';
import veterinarianRouter from './api/resources/veterinarian/veterinarian.route';
import medicalConsultationsRouter from './api/resources/medicalConsultatios/medicalConsultation.route';
import trackingsRouter from './api/resources/trackings/trackings.route';

const app: Express = express(); // Create an instance of the Express application

app.use(cors()); // Enable Cross-Origin Resource Sharing

app.use(
  morgan('short', {
    stream: {
      write: (message) => logger.info(message.trim()) // Configure Morgan to log HTTP requests using the 'short' format and send log messages to the logger
    }
  })
);

passport.use(authJTW); // Configure Passport to use the authJTW strategy for authentication

app.use(bodyParser.json()); // Parse incoming request bodies in JSON format and make the data available on req.body
app.use(bodyParser.raw({type:'image/*', limit:'1mb'})) // ¨Procesing content  type of image
app.use(passport.initialize()); // Initialize Passport middleware

// Connect to the database
connectionDB().then((databaseExists: boolean) => {
  // Only run the initialization script if the database exists
  if (databaseExists) {
    initializeDatabase();
  } else {
    console.log('Database does not exist. Skipping initialization script.');
  }
});

app.use('/auth', authRouter); // Route requests for authentication-related endpoints to the authRouter
app.use('/users', usersRouter); // Route requests for user-related endpoints to the usersRouter
app.use('/roles', rolesRouter); // Route requests for role-related endpoints to the rolesRouter
app.use('/permissions', permissionsRouter); // Route requests for permission-related endpoints to the permissionsRouter
app.use('/profile', profileRouter); // Route requests for permission-related endpoints to the permissionsRouter
app.use('/pets', petRouter); // Route requests for permission-related endpoints to the permissionsRouter
app.use('/veterinarians', veterinarianRouter)
app.use('/trackings', [vaccineRouter,antiparasiticRouter,medicalConsultationsRouter,trackingsRouter]); // Route requests for permission-related endpoints to the permissionsRouter


// Middleware para manejar las rutas no definidas

// Middleware para manejar las rutas no definidas
app.use((_req: Request, res: Response) => {
  const error = new Error('Route not found') as any;
  res.status(404).json({ message: error.message });
});
app.use(procesarErrores); // Custom error handling middleware
app.use(procesarErroresDeTamañoDeBody); // Custom error handling middleware

if (config.ambiente === 'prod') {
  app.use(erroresEnProduccion); // Error handling middleware for production environment
} else {
  app.use(erroresEnDesarrollo); // Error handling middleware for development environment
}

//const server = app.listen(3000, () => console.log('Server listening on port 3000'));

const port = process.env.NODE_ENV === 'test'  ? process.env.PORT_TEST :  process.env.PORT;

const server = app.listen(port, () => {
    console.log(`Enviroment ${process.env.NODE_ENV}`);
    console.log(`Server is running on port ${port}`);
});

export { app, server };
