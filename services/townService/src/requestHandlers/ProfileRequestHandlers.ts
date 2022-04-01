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
}

export async function createProfile(requestData: IUserProfile): Promise<ResponseEnvelope<string>> {
  try {
    const collection = await getProfileCollection();
    const result = await collection.insertOne(requestData);
    return { isOK: true, response: result.insertedId.toHexString() };
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
