import { AxiosError } from 'axios';
import CORS from 'cors';
import Express from 'express';
import http from 'http';
import createJWKSMock from 'mock-jwks';
import { Collection, Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { AddressInfo } from 'net';
import * as profileCollection from '../database/ProfileCollection';
import { IUserProfile } from '../requestHandlers/ProfileRequestHandlers';
import addTownRoutes from '../router/towns';
import ProfileServiceClient from './ProfileServiceClient';

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: ProfileServiceClient;
  let connection: MongoClient;
  let db: Db;
  let mongod: MongoMemoryServer;
  let collection: Collection;

  const audience = 'https://coveytown.com/api';
  const issuer = 'https://harrymerzin.auth0.com/';

  const jwks = createJWKSMock('https://harrymerzin.auth0.com/');

  async function createProfileForTesting(mockUser: IUserProfile): Promise<void> {
    const token = jwks.token({
      aud: audience,
      iss: issuer,
    });
    await apiClient.postProfile({
      ...mockUser,
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

    apiClient = new ProfileServiceClient(`http://127.0.0.1:${address.port}`);

    mongod = await MongoMemoryServer.create();
    connection = await MongoClient.connect(mongod.getUri());
    db = connection.db('name');
    collection = db.collection('testCollection');
    jest.spyOn(profileCollection, 'default').mockImplementation(async () => collection);

    jwks.start();
  });
  afterAll(async () => {
    await server.close();
    await mongod.stop();
    await connection.close();
    await jwks.stop();
  });
  describe('ProfileCreateAPI', () => {
    afterAll(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.postProfile({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'JaneDoeEmail5@gmail.com',
          username: 'JaneDoe5',
          pronouns: '',
          occupation: '',
          bio: '',
          token: 'invalidToken',
        });
        fail('Expected postProfile to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('creates a user and populates the database. errors when another user tries to use the same email or username', async () => {
      const mockUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'JaneDoe5',
        pronouns: '',
        occupation: '',
        bio: '',
      };
      await createProfileForTesting(mockUser);
      const insertedUser = await collection.findOne(mockUser);
      const mockUserWithId = {
        _id: insertedUser?._id,
        ...mockUser,
      };

      expect(insertedUser).toEqual(mockUserWithId);

      const mockUserSameEmail = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'JohnSmith5',
        pronouns: '',
        occupation: '',
        bio: '',
      };

      try {
        await createProfileForTesting(mockUserSameEmail);
      } catch (e) {
        // Expected Error
      }

      const mockUserSameUsername = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'JohnSmith@gmail.com',
        username: 'JaneDoe5',
        pronouns: '',
        occupation: '',
        bio: '',
      };

      try {
        await createProfileForTesting(mockUserSameUsername);
      } catch (e) {
        // Expected Error
      }
    });
  });
  describe('ProfileGetByEmailAPI', () => {
    let mockUser: IUserProfile;
    beforeAll(async () => {
      mockUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'JaneDoe5',
        pronouns: 'she/her',
        occupation: 'student',
        bio: 'i love covey town',
      };
      await createProfileForTesting(mockUser);
    });
    afterAll(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.getProfile({
          email: 'JaneDoeEmail5@gmail.com',
          token: 'invalidToken',
        });
        fail('Expected postProfile to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully retrieves the correct profile', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      const retrievedProfile = await apiClient.getProfile({
        email: 'JaneDoeEmail5@gmail.com',
        token,
      });

      const mockUserWithId = {
        _id: retrievedProfile?._id,
        ...mockUser,
      };
      expect(retrievedProfile).toEqual(mockUserWithId);
    });
    it('throws 404 error if profile not found', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      try {
        await apiClient.getProfile({
          email: 'notarealemail@hotmail.com',
          token,
        });
        fail('Expected getProfile to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(404);
        }
      }
    });
  });
  describe('ProfileUpdateAPI', () => {
    let mockUser: IUserProfile;
    let mockUserTwo: IUserProfile;
    beforeEach(async () => {
      mockUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'JaneDoe5',
        pronouns: 'she/her',
        occupation: 'student',
        bio: 'i love covey town',
      };
      mockUserTwo = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'JS@gmail.com',
        username: 'IAmJohnSmith',
        pronouns: 'he/him',
        occupation: 'student',
        bio: 'i love covey town more',
      };
      await createProfileForTesting(mockUser);
      await createProfileForTesting(mockUserTwo);
    });
    afterEach(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.patchProfile({
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'JaneDoeEmail5@gmail.com',
          username: 'JaneDoe5',
          pronouns: '',
          occupation: '',
          bio: '',
          token: 'invalidToken',
        });
        fail('Expected patchProfile to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully updates the correct existing profile', async () => {
      /*
      jest
        .spyOn(utils, 'getEmailForRequest')
        .mockImplementationOnce(() => 'JaneDoeEmail5@gmail.com');
      */
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      const newProfile = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'JohnSmith',
        pronouns: 'he/him',
        occupation: 'new student',
        bio: 'i really love covey town',
      };
      await apiClient.patchProfile({
        ...newProfile,
        token,
      });
      const retrievedProfile = await apiClient.getProfile({
        email: 'JaneDoeEmail5@gmail.com',
        token,
      });

      const mockUserWithId = {
        _id: retrievedProfile?._id,
        ...mockUser,
      };
      const newProfileWithId = {
        _id: retrievedProfile?._id,
        ...newProfile,
      };
      expect(retrievedProfile).not.toEqual(mockUserWithId);
      expect(retrievedProfile).toEqual(newProfileWithId);
    });
    it('throws error if try to update to same username as another player', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      const newProfile = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'IAmJohnSmith', // same username as John Smith profile
        pronouns: 'he/him',
        occupation: 'new student',
        bio: 'i really love covey town',
      };

      try {
        await apiClient.patchProfile({
          ...newProfile,
          token,
        });
        fail('Expected patchProfile to throw an error');
      } catch (e) {
        // expect error
      }
    });
  });
  describe('ProfileGetByUsernameAPI', () => {
    let mockUser: IUserProfile;
    beforeAll(async () => {
      mockUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'JaneDoe5',
        pronouns: 'she/her',
        occupation: 'student',
        bio: 'i love covey town',
      };
      await createProfileForTesting(mockUser);
    });
    afterAll(async () => {
      await collection.deleteMany({});
    });
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.getProfileByUsername({
          username: 'JaneDoe5',
          token: 'invalidToken',
        });
        fail('Expected getProfileByUsername to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('successfully retrieves the correct profile', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      const retrievedProfile = await apiClient.getProfileByUsername({
        username: 'JaneDoe5',
        token,
      });

      const mockUserWithId = {
        _id: retrievedProfile?._id,
        ...mockUser,
      };
      expect(retrievedProfile).toEqual(mockUserWithId);
    });
    it('throws 404 error if profile not found', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      try {
        await apiClient.getProfileByUsername({
          username: 'not a real username',
          token,
        });
        fail('Expected getProfileByUsername to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(404);
        }
      }
    });
  });
  describe('ProfileGetAllProfilesAPI', () => {
    it('throws 401 error if invalid token', async () => {
      try {
        await apiClient.getAllProfiles({
          token: 'invalidToken',
        });
        fail('Expected getProfileByUsername to throw an error');
      } catch (e) {
        const err = e as AxiosError;
        if (err.response) {
          expect(err.response.status).toBe(401);
        }
      }
    });
    it('retrives all profiles in database successfully', async () => {
      const token = jwks.token({
        aud: audience,
        iss: issuer,
      });
      const mockUser = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'JaneDoeEmail5@gmail.com',
        username: 'JaneDoe5',
        pronouns: 'she/her',
        occupation: 'student',
        bio: 'i love covey town',
      };
      const mockUserTwo = {
        firstName: 'John',
        lastName: 'Smith',
        email: 'JS@gmail.com',
        username: 'IAmJohnSmith',
        pronouns: 'he/him',
        occupation: 'student',
        bio: 'i love covey town more',
      };

      let allProfiles = await apiClient.getAllProfiles({
        token,
      });
      expect(allProfiles.length).toBe(0);
      await createProfileForTesting(mockUser);
      await createProfileForTesting(mockUserTwo);

      allProfiles = await apiClient.getAllProfiles({
        token,
      });

      expect(allProfiles.length).toBe(2);
    });
  });
});
