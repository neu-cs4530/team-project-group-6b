import { DeleteResult, UpdateResult } from 'mongodb';
import getProfileCollection from '../database/getProfileCollection';

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface IUserProfile {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
}

export interface UserDeleteRequest {
  email: string;
}

export async function createProfile(requestData: IUserProfile): Promise<ResponseEnvelope<string>> {
  try {
    const collection = await getProfileCollection();
    const emails = await collection.findOne({ email: requestData.email });
    const usernames = await collection.findOne({ username: requestData.username });
    if (emails === null && usernames == null) {
      const result = await collection.insertOne(requestData);
      return { isOK: true, response: result.insertedId.toHexString() };
    }

    return { isOK: false, message: 'username or email already exists' };
  } catch (err) {
    return { isOK: false, message: 'this did not work' };
  }
}

export async function fetchProfile(email: string): Promise<ResponseEnvelope<IUserProfile>> {
  const collection = await getProfileCollection();
  const result = await collection.findOne<IUserProfile>({ email });

  if (result !== null && result !== undefined) {
    return { isOK: true, response: result };
  }

  return { isOK: false, message: 'profile not found' };
}

export async function updateUser(
  requestData: IUserProfile,
): Promise<ResponseEnvelope<UpdateResult>> {
  const collection = await getProfileCollection();
  const query = { email: requestData.email };
  const update = { $set: requestData };
  const options = {};

  try {
    const result: UpdateResult = await collection.updateOne(query, update, options);
    return { isOK: true, response: result };
  } catch (err) {
    return { isOK: false, message: 'error has occured when updating document in database' };
  }
}

export async function userDeleteHandler(
  requestData: UserDeleteRequest,
): Promise<ResponseEnvelope<DeleteResult>> {
  const collection = await getProfileCollection();
  const query = { email: requestData.email };

  try {
    const result: DeleteResult = await collection.deleteOne(query);
    return { isOK: true, response: result };
  } catch (err) {
    return { isOK: false, message: 'error has occured when deleting a document in database' };
  }
}
