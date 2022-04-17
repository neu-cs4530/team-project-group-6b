import express, { Express } from 'express';
import jwt from 'express-jwt';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
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
import {
  fieldReportCreateHandler,
  fieldReportDeleteHandler,
  fieldReportListHandler,
  fieldReportUpdateHandler,
  fieldReportListAllHandler,
} from '../requestHandlers/fieldReportRequestHandler';
import {
  createProfile,
  fetchProfileByEmail,
  fetchProfileByUsername,
  updateUser,
  userDeleteHandler,
} from '../requestHandlers/ProfileRequestHandlers';
import { logError, getEmailForRequest } from '../Utils';

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
  /**
   * Create a field report
   */
  app.post('/fieldReport', express.json(), async (req, res) => {
    let email = '';
    try {
      email = getEmailForRequest(req);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'bad token' });
    }
    try {
      console.log('req body: ', req.body);
      const result = await fieldReportCreateHandler({
        username: email,
        fieldReports: req.body.fieldReports,
        sessionID: req.body.sessionID,
        time: req.body.time,
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
   * Get a field report for the specified username created in the specified sessionID
   */
  app.get('/fieldReport/:username/:sessionID', express.json(), async (req, res) => {
    let email = '';
    try {
      email = getEmailForRequest(req);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'bad token' });
    }
    try {
      console.log('email: ', email);
      const result = await fieldReportListHandler({
        username: req.params.username,
        sessionID: req.params.sessionID,
      });
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
      } else {
        res.status(404).json({
          message: 'field report not found',
        });
      }
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Get all field reports for user
   */
  app.get('/fieldReport/:username/', express.json(), async (req, res) => {
    try {
      const { user } = req as any;
      console.log(user);
      const result = await fieldReportListAllHandler(req.params.username);
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
      } else {
        res.status(404).json({
          message: 'field report not found',
        });
      }
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Update a field report for the specified username created in the specified sessionID
   */
  app.patch('/fieldReport/:username/:sessionID', express.json(), async (req, res) => {
    try {
      const result = await fieldReportUpdateHandler({
        username: req.params.username,
        fieldReports: req.body.fieldReports,
        sessionID: req.params.sessionID,
      });
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
      } else {
        res.status(404).json({
          message: 'field report not found',
        });
      }
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Delete a field report for the specified username created in the specified sessionID
   */
  app.delete('/fieldReport/:username/:sessionID', express.json(), async (req, res) => {
    try {
      const result = await fieldReportDeleteHandler({
        username: req.params.username,
        sessionID: req.params.sessionID,
      });
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
      } else {
        res.status(404).json({
          message: 'field report not found',
        });
      }
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  // This route doesn't need authentication
  app.get('/api/public', express.json(), (_req, res) => {
    res.json({
      message: "Hello from a public endpoint! You don't need to be authenticated to see this.",
    });
  });

  // This route needs authentication
  app.get('/api/private', express.json(), jwtCheck, (_req, res) => {
    res.json({
      message: 'Hello from a private endpoint! You need to be authenticated to see this.',
    });
  });

  /**
   * Create a user
   */
  app.post('/api/v2/users', express.json(), jwtCheck, async (req, res) => {
    try {
      const result = await createProfile({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        username: req.body.username,
        pronouns: req.body.pronouns,
        occupation: req.body.occupation,
        bio: req.body.bio,
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
   * List all users
   */
  app.get('/api/v2/users', express.json(), (_req, res) => {
    try {
      const result = 'temp'; // userListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Get a user by id (username)
   */
  app.get('/api/v2/users/:id', express.json(), async (req, res) => {
    try {
      const result = await fetchProfileByUsername(req.params.id);

      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
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

  /**
   * Get a user by (email)
   */
  app.get('/api/v2/users-by-email', express.json(), async (req, res) => {
    try {
      const result = await fetchProfileByEmail(req.query.email as string);

      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
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

  /**
   * Update a user by id (email)
   */
  app.patch('/api/v2/users/:id', express.json(), async (req, res) => {
    try {
      const result = await updateUser({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.params.id,
        username: req.body.username,
        pronouns: req.body.pronouns,
        occupation: req.body.occupation,
        bio: req.body.bio,
      });
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
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

  /**
   * Delete a user
   */
  app.delete('/api/v2/users/:id', express.json(), jwtCheck, async (req, res) => {
    try {
      const result = userDeleteHandler({
        email: req.params.id, // is id email??
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for details',
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
