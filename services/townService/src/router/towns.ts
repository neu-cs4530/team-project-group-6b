import express, { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import jwt from 'express-jwt';
import jwks from 'jwks-rsa';
import io from 'socket.io';

import {
  conversationAreaCreateHandler,
  townCreateHandler,
  townDeleteHandler,
  townJoinHandler,
  townListHandler,
  townSubscriptionHandler,
  townUpdateHandler,
} from '../requestHandlers/CoveyTownRequestHandlers';
import { createProfile } from '../requestHandlers/ProfileRequestHandlers';
import { logError } from '../Utils';

// const port = process.env.PORT || 8080;

const jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: 'https://harrymerzin.auth0.com/.well-known/jwks.json',
  }),
  audience: 'https://coveytown.com/api',
  issuer: 'https://harrymerzin.auth0.com/',
  algorithms: ['RS256'],
});


export default function addTownRoutes(http: Server, app: Express): io.Server {
  // This route doesn't need authentication
  app.get('/api/public', (_req, res) => {
    res.json({
      message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.',
    });
  });

  // This route needs authentication
  app.get('/api/private', jwtCheck, (_req, res) => {
    res.json({
      message: 'Hello from a private endpoint! You need to be authenticated to see this.',
    });
  });

  // create a user
  app.post('/api/v2/users', async (req, res) => {
    try {
      const result = await createProfile({
        firstName: req.body.given_name,
        lastName: req.body.family_name,
        email: req.body.email,
      });
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  // list or search users
  app.get('/api/v2/users', (_req, res) => {
    try {
      const result = userListHandler();
      res.status(StatusCodes.OK)
        .json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({
          message: 'Internal server error, please see log in server for more details',
        });
    }
  });

  // get a user
  app.get('/api/v2/users/:id', async (req, res) => {
    try {
      const result = await fetchProfile({
        id: req.params.id,
      });
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result.result);
      } else {
        res.status(404).json({
          message: 'profile not found',
        });
      }
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /*
  * Create a new session (aka join a town)
  */
  app.post('/sessions', express.json(), async (req, res) => {
    try {
      const result = await townJoinHandler({
        userName: req.body.userName,
        coveyTownID: req.body.coveyTownID,
      });
      res.status(StatusCodes.OK).json(result); 
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  
  /**
  * Delete a town
  */
  app.delete('/towns/:townID/:townPassword', express.json(), async (req, res) => {
    try {
      const result = townDeleteHandler({
        coveyTownID: req.params.townID,
        coveyTownPassword: req.params.townPassword,
      });
      res.status(200).json(result);
    } catch (err) {
      logError(err);
      res.status(500).json({
        message: 'Internal server error, please see log in server for details',
      });
    }
  });
  
  /**
  * List all towns
  */
  app.get('/towns', express.json(), async (_req, res) => {
    try {
      const result = townListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  
  /**
  * Create a town
  */
  app.post('/towns', express.json(), async (req, res) => {
    try {
      const result = townCreateHandler(req.body);
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  /**
  * Update a town
  */
  app.patch('/towns/:townID', express.json(), async (req, res) => {
    try {
      const result = townUpdateHandler({
        coveyTownID: req.params.townID,
        isPubliclyListed: req.body.isPubliclyListed,
        friendlyName: req.body.friendlyName,
        coveyTownPassword: req.body.coveyTownPassword,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  
  app.post('/towns/:townID/conversationAreas', express.json(), async (req, res) => {
    try {
      const result = conversationAreaCreateHandler({
        coveyTownID: req.params.townID,
        sessionToken: req.body.sessionToken,
        conversationArea: req.body.conversationArea,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });
  
  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', townSubscriptionHandler);
  return socketServer;
}
