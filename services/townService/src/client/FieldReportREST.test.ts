import { AxiosError } from 'axios';
import CORS from 'cors';
import Express from 'express';
import http from 'http';
import createJWKSMock from 'mock-jwks';
import { Collection, Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AddressInfo } from 'net';
import * as reportCollection from '../database/FieldReportCollection';
import addTownRoutes from '../router/towns';
import * as utils from '../Utils';
import ReportServiceClient from './ReportServiceClient';

export interface FieldReportCreate {
  fieldReports: string;
  sessionID: string;
  time: string;
}
describe('ReportServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: ReportServiceClient;
  let connection: MongoClient;
  let db: Db;
  let mongod: MongoMemoryServer;
  let collection: Collection;

  const audience = 'https://coveytown.com/api';
  const issuer = 'https://harrymerzin.auth0.com/';

  const jwks = createJWKSMock('https://harrymerzin.auth0.com/');

  async function createFieldReportForTesting(
    mockReport: FieldReportCreate,
    email: string,
  ): Promise<void> {
    jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => email);
    const token = jwks.token({
      aud: audience,
      iss: issuer,
    });
    await apiClient.createFieldReport({
      ...mockReport,
      token,
    });
  }

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    await server.listen();
    const address = server.address() as AddressInfo;

    apiClient = new ReportServiceClient(`http://127.0.0.1:${address.port}`);

    mongod = await MongoMemoryServer.create();
    connection = await MongoClient.connect(mongod.getUri());
    db = connection.db('name');
    collection = db.collection('testCollection');
    jest.spyOn(reportCollection, 'default').mockImplementation(async () => collection);

    jwks.start();
  });
  afterAll(async () => {
    await server.close();
    await mongod.stop();
    await connection.close();
    await jwks.stop();
  });
  describe('FieldReportCreateAPI', () => {
    afterAll(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.createFieldReport({
          fieldReports: 'everything is so well designed',
          sessionID: 'mySessionID',
          time: '50123',
          token: 'invalidToken',
        });
        fail('Expected createFieldReport to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfuly creates a field report and populates the database', async () => {
      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => 'myEmail@gmail.com');
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });

      const mockReport = {
        fieldReports: 'everything is so well designed',
        sessionID: 'mySessionID',
        time: '50123',
      };

      await apiClient.createFieldReport({
        ...mockReport,
        token,
      });

      const insertedReport = await collection.findOne(mockReport);
      const mockReportWithId = {
        _id: insertedReport?._id,
        username: 'myEmail@gmail.com',
        isPrivate: false,
        ...mockReport,
      };
      expect(insertedReport).toEqual(mockReportWithId);
    });
  });
  describe('FieldReportDeleteAPI', () => {
    let email: string;
    beforeEach(async () => {
      email = 'myEmail@gmail.com';
      const mockReport = {
        fieldReports: 'everything is so well designed',
        sessionID: 'mySessionID',
        time: '50123',
      };
      await createFieldReportForTesting(mockReport, email);
    });
    afterEach(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.deleteFieldReport({
          sessionID: 'mySessionID',
          token: 'invalidToken',
        });
        fail('Expected deleteFieldReport to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully deletes the specified report in the database', async () => {
      expect(await collection.count()).toBe(1);

      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => email);
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      await apiClient.deleteFieldReport({
        sessionID: 'mySessionID',
        token,
      });

      expect(await collection.count()).toBe(0);
    });
    it('throws 404 error if report does not exist', async () => {
      expect(await collection.count()).toBe(1);
      jest
        .spyOn(utils, 'getEmailForRequest')
        .mockImplementationOnce(() => 'invalidEmail@gmail.com');

      try {
        const token = jwks.token({
          aud: audience,
          iss: issuer,
        });
        await apiClient.deleteFieldReport({
          sessionID: 'invalidSessionID',
          token,
        });
        fail('expected deleteFieldReport to throw error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(404);
        }
      }
    });
  });
  describe('FieldReportDumpAPI', () => {
    let emailOne: string;
    let mockReportOne: FieldReportCreate;
    let emailTwo: string;
    let mockReportTwo: FieldReportCreate;
    let emailThree: string;
    let mockReportThree: FieldReportCreate;

    beforeAll(async () => {
      emailOne = 'myEmailOne@gmail.com';
      mockReportOne = {
        fieldReports: 'one',
        sessionID: 'mySessionIDOne',
        time: '1',
      };
      emailTwo = 'myEmailTwo@gmail.com';
      mockReportTwo = {
        fieldReports: 'two',
        sessionID: 'mySessionIDtwo',
        time: '2',
      };
      emailThree = 'myEmailThree@gmail.com';
      mockReportThree = {
        fieldReports: 'three',
        sessionID: 'mySessionIDThree',
        time: '3',
      };
      await createFieldReportForTesting(mockReportOne, emailOne);
      await createFieldReportForTesting(mockReportTwo, emailTwo);
      await createFieldReportForTesting(mockReportThree, emailThree);
    });
    afterAll(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.fieldReportsCollectionDump({
          token: 'invalidToken',
        });
        fail('Expected fieldReportsCollectionDump to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully dumps all public reports from the database', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      const retrievedReports = await apiClient.fieldReportsCollectionDump({
        token,
      });

      expect(retrievedReports.length).toBe(3);
    });
    it('does not dump private reports from database', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailTwo);
      await apiClient.updateFieldReport({
        username: emailTwo,
        sessionID: 'mySessionIDtwo',
        isPrivate: true,
        token,
      });

      const retrievedReports = await apiClient.fieldReportsCollectionDump({
        token,
      });
      expect(retrievedReports.length).toBe(2);
    });
  });
  describe('FieldReportListByUsernameAPI', () => {
    let emailOne: string;
    let mockReportOne: FieldReportCreate;
    let emailTwo: string;
    let mockReportTwo: FieldReportCreate;
    let mockReportThree: FieldReportCreate;
    beforeAll(async () => {
      emailOne = 'myEmailOne@gmail.com';
      mockReportOne = {
        fieldReports: 'one',
        sessionID: 'mySessionIDOne',
        time: '1',
      };
      emailTwo = 'myEmailTwo@gmail.com';
      mockReportTwo = {
        fieldReports: 'two',
        sessionID: 'mySessionIDtwo',
        time: '2',
      };
      mockReportThree = {
        fieldReports: 'three',
        sessionID: 'mySessionIDThree',
        time: '3',
      };
      await createFieldReportForTesting(mockReportOne, emailOne);
      await createFieldReportForTesting(mockReportTwo, emailTwo);
      await createFieldReportForTesting(mockReportThree, emailOne);
    });
    afterAll(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.listAllFieldReports({
          username: 'JohnDoe',
          token: 'invalidToken',
        });
        fail('Expected listAllFieldReports to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully obtains all reports with the specified username from the database', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailOne);
      let retrievedReports = await apiClient.listAllFieldReports({
        username: emailOne,
        token,
      });

      expect(retrievedReports.length).toBe(2);

      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailTwo);
      retrievedReports = await apiClient.listAllFieldReports({
        username: emailTwo,
        token,
      });

      expect(retrievedReports.length).toBe(1);
    });
  });
  describe('FieldReportListByUsernameAndSessionIDAPI', () => {
    let emailOne: string;
    let mockReportOne: FieldReportCreate;
    let mockReportTwo: FieldReportCreate;
    let sessionIDOne: string;
    let sessionIDTwo: string;
    beforeAll(async () => {
      sessionIDOne = 'mySessionIDOne';
      sessionIDTwo = 'mySessionIDTwo';
      emailOne = 'myEmailOne@gmail.com';
      mockReportOne = {
        fieldReports: 'one',
        sessionID: sessionIDOne,
        time: '1',
      };
      mockReportTwo = {
        fieldReports: 'two',
        sessionID: sessionIDTwo,
        time: '2',
      };
      await createFieldReportForTesting(mockReportOne, emailOne);
      await createFieldReportForTesting(mockReportTwo, emailOne);
    });
    afterAll(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.listFieldReport({
          username: 'JohnDoe',
          sessionID: 'mySessionID',
          token: 'invalidToken',
        });
        fail('Expected listFieldReport to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully retrieves reports from the specified username and sessionID', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailOne);
      let retrievedReports = await apiClient.listFieldReport({
        username: emailOne,
        sessionID: sessionIDOne,
        token,
      });
      expect(retrievedReports.fieldReports).toBe('one');
      expect(retrievedReports.username).toBe(emailOne);
      expect(retrievedReports.sessionID).toBe(sessionIDOne);

      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailOne);
      retrievedReports = await apiClient.listFieldReport({
        username: emailOne,
        sessionID: sessionIDTwo,
        token,
      });

      expect(retrievedReports.fieldReports).toBe('two');
      expect(retrievedReports.username).toBe(emailOne);
      expect(retrievedReports.sessionID).toBe(sessionIDTwo);
    });
  });
  describe('FieldReportUpdateAPI', () => {
    let emailOne: string;
    let mockReportOne: FieldReportCreate;
    let sessionID: string;

    beforeEach(async () => {
      emailOne = 'myEmailOne@gmail.com';
      sessionID = 'mySessionID';
      mockReportOne = {
        fieldReports: 'one',
        sessionID,
        time: '1',
      };
      createFieldReportForTesting(mockReportOne, emailOne);
    });
    afterEach(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.updateFieldReport({
          username: 'JohnDoe',
          fieldReports: 'new field report',
          sessionID: 'mySessionID',
          token: 'invalidToken',
        });
        fail('Expected updateFieldReport to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully updates report in database', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });

      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailOne);
      await apiClient.updateFieldReport({
        username: emailOne,
        sessionID,
        isPrivate: true,
        token,
      });

      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailOne);
      let retrievedProfile = await apiClient.listFieldReport({
        username: emailOne,
        sessionID,
        token,
      });
      expect(retrievedProfile.fieldReports).toBe('one');
      expect(retrievedProfile.isPrivate).toBe(true);
      expect(retrievedProfile.sessionID).toBe(sessionID);
      expect(retrievedProfile.time).toBe('1');
      expect(retrievedProfile.username).toBe(emailOne);

      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailOne);
      await apiClient.updateFieldReport({
        username: emailOne,
        sessionID,
        fieldReports: 'updated field report',
        token,
      });

      jest.spyOn(utils, 'getEmailForRequest').mockImplementationOnce(() => emailOne);
      retrievedProfile = await apiClient.listFieldReport({
        username: emailOne,
        sessionID,
        token,
      });
      expect(retrievedProfile.fieldReports).toBe('updated field report');
      expect(retrievedProfile.isPrivate).toBe(true);
      expect(retrievedProfile.sessionID).toBe(sessionID);
      expect(retrievedProfile.time).toBe('1');
      expect(retrievedProfile.username).toBe(emailOne);
    });
  });
});
