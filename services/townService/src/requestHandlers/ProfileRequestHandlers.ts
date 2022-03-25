import { WithId, ObjectId } from 'mongodb';
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

export interface Doc {
  doc: WithId<Document>;
}

export async function createProfile(requestData: CreateProfileRequest): Promise<ResponseEnvelope<string>> {
  try {
    const collection = await getProfileCollection();
    const result = await collection.insertOne(requestData);
    return { isOK: true,
      response: result.insertedId.toHexString() };
  } catch (err) {
    return { isOK: false, message: 'went to shit, sorry' };
  }
}
    
export async function fetchProfile(id: string): Promise<ResponseEnvelope<any>> {
  const collection = await getProfileCollection();
  const result = await collection.findOne<any>(new ObjectId(id));

  if (result !== null && result !== undefined) {
    return { isOK: true,
      response: result,
    }; 
  }
  
  return { isOK: false,
    message: 'profile not found' };
}