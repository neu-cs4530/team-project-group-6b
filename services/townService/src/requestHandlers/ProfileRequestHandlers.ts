import getProfileCollection from '../database/ProfileCollection';

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
  pronouns: string;
  occupation: string;
  bio: string;
}

export interface UserDeleteRequest {
  email: string;
}

export async function profileCreateHandler(
  requestData: IUserProfile,
): Promise<ResponseEnvelope<string>> {
  const collection = await getProfileCollection();
  const emails = await collection.findOne({ email: requestData.email });
  const usernames = await collection.findOne({ username: requestData.username });
  if (emails === null && usernames == null) {
    const result = await collection.insertOne(requestData);
    const success = result.acknowledged;
    return {
      isOK: success,
      response: !success ? '' : result.insertedId.toHexString(),
      message: !success ? 'Profile could not be inserted into the profile database.' : undefined,
    };
  }

  return { isOK: false, message: 'that username already exists' };
}

export async function profileFetchByEmailHandler(
  email: string,
): Promise<ResponseEnvelope<IUserProfile>> {
  const collection = await getProfileCollection();
  const result = await collection.findOne<IUserProfile>({ email });

  if (result !== null && result !== undefined) {
    return { isOK: true, response: result };
  }

  return { isOK: false, message: 'profile not found' };
}

export async function profileFetchByUsernameHandler(
  username: string,
): Promise<ResponseEnvelope<IUserProfile>> {
  const collection = await getProfileCollection();
  const result = await collection.findOne<IUserProfile>({ username });

  if (result !== null && result !== undefined) {
    return { isOK: true, response: result };
  }

  return { isOK: false, message: 'profile not found' };
}

export async function getAllProfiles(): Promise<ResponseEnvelope<IUserProfile[]>> {
  const collection = await getProfileCollection();
  const result = await collection.find<IUserProfile>({});

  if (result !== null && result !== undefined) {
    return { isOK: true, response: await result.toArray() };
  }

  return { isOK: false, message: 'profile not found' };
}

export async function profileUpdateHandler(
  requestData: IUserProfile,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await getProfileCollection();
  const userProfile = await collection.findOne<IUserProfile>({ username: requestData.username });
  if (userProfile !== null && userProfile.email !== requestData.email) {
    return {
      isOK: false,
      response: {},
      message: 'that username already exists',
    };
  }
  const query = { email: requestData.email };
  const update = { $set: requestData };
  const options = {};
  const result = await collection.updateOne(query, update, options);
  const success = result.acknowledged;

  return {
    isOK: success,
    response: {},
    message: !success ? 'Profile could not be updated in the profile database.' : undefined,
  };
}

export async function profileDeleteHandler(
  requestData: UserDeleteRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await getProfileCollection();
  const query = { email: requestData.email };
  const result = await collection.deleteOne(query);
  const success = result.acknowledged;

  return {
    isOK: success,
    response: {},
    message: !success ? 'Profile could not be deleted in the profile database.' : undefined,
  };
}
