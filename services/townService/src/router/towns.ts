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
  fieldReportListAllHandler,
  fieldReportListHandler,
  fieldReportsCollectionDump,
  fieldReportUpdateHandler,
} from '../requestHandlers/FieldReportRequestHandlers';
import {
  getAllProfiles,
  profileCreateHandler,
  profileDeleteHandler,
  profileFetchByEmailHandler,
  profileFetchByUsernameHandler,
  profileUpdateHandler,
} from '../requestHandlers/ProfileRequestHandlers';
import { getEmailForRequest, logError } from '../Utils';

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
  app.post('/fieldReport', express.json(), jwtCheck, async (req, res) => {
    let email = '';
    try {
      email = getEmailForRequest(req);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'bad token' });
      return;
    }
    try {
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
  app.get('/fieldReport/:username/:sessionID', express.json(), jwtCheck, async (req, res) => {
    let email = '';
    try {
      email = await getEmailForRequest(req);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'bad token' });
      return;
    }
    try {
      const result = await fieldReportListHandler({
        username: req.params.username,
        sessionID: req.params.sessionID,
      });
      if (result.response?.isPrivate && email !== req.params.username) {
        res
          .status(403)
          .json({ message: 'this report is private, you are not authorized to view it' });
        return;
      }
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

  app.get('/all-reports', express.json(), jwtCheck, async (_, res) => {
    try {
      const result = await fieldReportsCollectionDump();
      if (result.isOK) {
        res
          .status(StatusCodes.OK)
          .json({ ...result, response: result.response?.filter(fr => !fr.isPrivate) });
        return;
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  app.get('/all-profiles', express.json(), jwtCheck, async (_, res) => {
    try {
      const result = await getAllProfiles();
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
        return;
      }
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Get all field reports for user
   */
  app.get('/fieldReport/:username/', express.json(), jwtCheck, async (req, res) => {
    let email = '';
    try {
      email = getEmailForRequest(req);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'bad token' });
      return;
    }
    try {
      const result = await fieldReportListAllHandler(req.params.username);
      if (result.isOK) {
        if (req.params.username === email) {
          res.status(StatusCodes.OK).json(result);
          return;
        }
        res
          .status(StatusCodes.OK)
          .json({ ...result, response: result.response?.filter(item => !item.isPrivate) });
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
  app.patch('/fieldReport/:sessionID', express.json(), jwtCheck, async (req, res) => {
    let email = '';
    try {
      email = getEmailForRequest(req);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'bad token' });
      return;
    }
    try {
      const result = await fieldReportUpdateHandler({
        username: email,
        fieldReports: req.body.fieldReports,
        sessionID: req.params.sessionID,
        isPrivate: req.body.isPrivate,
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
  app.delete('/fieldReport/:sessionID', express.json(), jwtCheck, async (req, res) => {
    let email = '';
    try {
      email = getEmailForRequest(req);
    } catch (err) {
      res.status(StatusCodes.BAD_REQUEST).json({ message: 'bad token' });
      return;
    }
    try {
      const result = await fieldReportDeleteHandler({
        username: email,
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
      const result = await profileCreateHandler({
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
   * Get a user by id (username)
   */
  app.get('/api/v2/users/:id', express.json(), jwtCheck, async (req, res) => {
    try {
      const result = await profileFetchByUsernameHandler(req.params.id);

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
  app.get('/api/v2/users-by-email', express.json(), jwtCheck, async (req, res) => {
    try {
      const result = await profileFetchByEmailHandler(req.query.email as string);

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
  app.patch('/api/v2/users/:id', express.json(), jwtCheck, async (req, res) => {
    try {
      const result = await profileUpdateHandler({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.params.id,
        username: req.body.username,
        pronouns: req.body.pronouns,
        occupation: req.body.occupation,
        bio: req.body.bio,
      });
      res.status(StatusCodes.OK).json(result);
      /*
      if (result.isOK) {
        res.status(StatusCodes.OK).json(result);
      } else {
        res.status(404).json({
          message: 'profile not found',
        });
      }
      */
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
      const result = profileDeleteHandler({
        email: req.params.id,
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
