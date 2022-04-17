import { DeleteResult, InsertOneResult, Timestamp, UpdateResult } from 'mongodb';
import getFieldReportCollection from '../database/getFieldReportCollection';

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface FieldReport {
  username: string;
  fieldReports: string;
  sessionID: string;
}

export interface FieldReportResponse {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: Timestamp;
}

export interface FieldReportAccessRequest {
  username: string;
  sessionID: string;
}

export async function fieldReportCreateHandler(requestData: FieldReport): Promise<ResponseEnvelope<InsertOneResult>> {
  const collection = await getFieldReportCollection();
  const result = await collection.insertOne(requestData);

  if (result.acknowledged) {
    return ({
      isOK: true,
      response: result,
    });
  }

  return ({
    isOK: false,
    message: 'Field report could not be inserted into the field report database.',
  });
}

export async function fieldReportListHandler(requestData: FieldReportAccessRequest): Promise<ResponseEnvelope<FieldReportResponse>> {
  const collection = await getFieldReportCollection();
  const result = await collection.findOne<FieldReportResponse>({ 
    username: requestData.username, 
    sessionID: requestData.sessionID, 
  });

  if (result !== null) {
    return ({
      isOK: true,
      response: result,
    });
  }

  return ({
    isOK: false,
    message: 'Field report by user with the sessionID cannot be found.',
  });
}

export async function fieldReportUpdateHandler(requestData: FieldReport): Promise<ResponseEnvelope<UpdateResult>> {
  const collection = await getFieldReportCollection();
  const query = { username: requestData.username, sessionID: requestData.sessionID };
  const update = { $set: { fieldReports: requestData.fieldReports } };
  const options = {};
  const result = await collection.updateOne(query, update, options);

  if (result.acknowledged) {
    return ({
      isOK: true,
      response: result,
    });
  }

  return ({ 
    isOK: false, 
    message: 'error has occured when updating document in database', 
  });
}

export async function fieldReportDeleteHandler(requestData: FieldReportAccessRequest): Promise<ResponseEnvelope<DeleteResult>> {
  const collection = await getFieldReportCollection();
  const result = await collection.deleteOne({ 
    username: requestData.username, 
    sessionID: requestData.sessionID, 
  });

  if (result.acknowledged) {
    return ({
      isOK: true,
      response: result,
    });
  }

  return ({
    isOK: false,
    message: 'Document could not be deleted from the database',
  });
}
