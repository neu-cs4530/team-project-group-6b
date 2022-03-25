import getProfileCollection from '../database/getProfileCollection';

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface CreateProfileRequest {
  firstName: string
  lastName: string
  email: string
}

export interface CreateProfileResponse {
  profileId: string
}

export async function createProfile(requestData: CreateProfileRequest): Promise<ResponseEnvelope<CreateProfileResponse>> {
  try {
    const collection = await getProfileCollection();
    const result = await collection.insertOne(requestData);
    return { isOK: true,
      response: { profileId: result.insertedId.toHexString() } };
  } catch (err) {
    return { isOK: false, message: 'went to shit, sorry' };
  }
}