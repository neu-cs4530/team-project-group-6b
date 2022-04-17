import { Timestamp } from 'mongodb';
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

export async function fieldReportCreateHandler(requestData: FieldReport): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await getFieldReportCollection();
  const result = await collection.insertOne(requestData);
  const success = result.acknowledged;
  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Field report could not be inserted into the field report database.'
      : undefined,
  };
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

export async function fieldReportUpdateHandler(requestData: FieldReport): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await getFieldReportCollection();
  const query = { username: requestData.username, sessionID: requestData.sessionID };
  const update = { $set: { fieldReports: requestData.fieldReports } };
  const options = {};
  const result = await collection.updateOne(query, update, options);
  const success = result.acknowledged;

  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Field report could not be updated into the field report database.'
      : undefined,
  };
}

export async function fieldReportDeleteHandler(requestData: FieldReportAccessRequest): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await getFieldReportCollection();
  const result = await collection.deleteOne({ 
    username: requestData.username, 
    sessionID: requestData.sessionID, 
  });
  const success = result.acknowledged;

  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Document could not be deleted from the database'
      : undefined,
  };
}
