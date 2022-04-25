import FieldReportCollection from '../database/FieldReportCollection';

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export interface FieldReportDeleteRequest {
  username: string;
  sessionID: string;
}

export interface FieldReportListRequest {
  username: string;
  sessionID: string;
}

export interface FieldReportListResponse {
  username: string;
  fieldReports: string;
  sessionID: string;
  isPrivate: boolean;
  time: number;
}

export type FieldReportListAllResponse = FieldReportListResponse[];

export interface FieldReportCreateRequest {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: number;
}

export interface FieldReportUpdateRequest {
  username: string;
  fieldReports?: string;
  sessionID: string;
  isPrivate?: string;
}

export async function fieldReportCreateHandler(
  requestData: FieldReportCreateRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await FieldReportCollection();
  const result = await collection.insertOne({ ...requestData, isPrivate: false });
  const success = result.acknowledged;
  return {
    isOK: success,
    response: {},
    message: !success
      ? 'Field report could not be inserted into the field report database.'
      : undefined,
  };
}

export async function fieldReportListHandler(
  requestData: FieldReportListRequest,
): Promise<ResponseEnvelope<FieldReportListResponse>> {
  const collection = await FieldReportCollection();
  const result = await collection.findOne<FieldReportListResponse>({
    username: requestData.username,
    sessionID: requestData.sessionID,
  });

  if (result !== null) {
    return {
      isOK: true,
      response: result,
    };
  }

  return {
    isOK: false,
    message: 'Field report by user with the sessionID cannot be found.',
  };
}

export async function fieldReportListAllHandler(
  username: string,
): Promise<ResponseEnvelope<FieldReportListAllResponse>> {
  const collection = await FieldReportCollection();
  const result = collection.find<FieldReportListResponse>({
    username,
  });

  if (result !== null) {
    return {
      isOK: true,
      response: await result.toArray(),
    };
  }

  return {
    isOK: false,
    message: 'Field report by user with the sessionID cannot be found.',
  };
}

export async function fieldReportsCollectionDump(): Promise<ResponseEnvelope<FieldReportListAllResponse>> {
  const collection = await FieldReportCollection();
  const result = await collection.find<FieldReportListResponse>({});

  if (result !== null) {
    return {
      isOK: true,
      response: await result.toArray(),
    };
  }

  return {
    isOK: false,
    message: 'Field report by user with the sessionID cannot be found.',
  };
}

export async function fieldReportUpdateHandler(
  requestData: FieldReportUpdateRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await FieldReportCollection();
  const query = {
    username: requestData.username,
    sessionID: requestData.sessionID,
  };
  if (
    (requestData.isPrivate === null || requestData.isPrivate === undefined) &&
    !requestData.fieldReports
  ) {
    return { isOK: true };
  }
  const updates: { [key: string]: unknown } = {};
  if (requestData.isPrivate !== undefined) {
    updates.isPrivate = requestData.isPrivate;
  }
  if (requestData.fieldReports) {
    updates.fieldReports = requestData.fieldReports;
  }
  const update = { $set: updates };
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

export async function fieldReportDeleteHandler(
  requestData: FieldReportDeleteRequest,
): Promise<ResponseEnvelope<Record<string, null>>> {
  const collection = await FieldReportCollection();
  const result = await collection.deleteOne({
    username: requestData.username,
    sessionID: requestData.sessionID,
  });
  const success = result.deletedCount !== 0;

  return {
    isOK: success,
    response: {},
    message: !success ? 'Document could not be deleted from the database' : undefined,
  };
}
