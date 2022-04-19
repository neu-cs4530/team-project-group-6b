import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { Db, MongoClient } from 'mongodb';
import { AddressInfo } from 'net';

import { MongoMemoryServer } from 'mongodb-memory-server';
import createJWKSMock from 'mock-jwks';
import addTownRoutes from '../router/towns';
import ProfileServiceClient from './ProfileServiceClient';
import * as profileCollection from '../database/ProfileCollection';

describe('TownsServiceAPIREST', () => {
  let server: http.Server;
  let apiClient: ProfileServiceClient;
  let connection: MongoClient;
  let db: Db;
  let mongod: MongoMemoryServer;
  const jwks = createJWKSMock('https://harrymerzin.auth0.com/');

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

    // jwks.start();
  });
  afterAll(async () => {
    await server.close();
    await mongod.stop();
    await connection.close();
    // await jwks.stop();
  });

  it('test it', async () => {
    jwks.start();
    const collection = db.collection('testCollection');
    jest.spyOn(profileCollection, 'default').mockImplementation(async () => collection);
    const token = jwks.token({});
    console.log(token);
    const result = await apiClient.postProfile({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'JaneDoeEmail5@gmail.com',
      username: 'JaneDoe5',
      pronouns: '',
      occupation: '',
      bio: '',
      token,
    });

    const insertedUser = await collection.findOne({ email: 'JaneDoeEmail5@gmail.com' });
    console.log(insertedUser);
  });
});
