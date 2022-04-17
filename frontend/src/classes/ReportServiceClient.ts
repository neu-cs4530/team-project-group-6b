import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

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
  token: string;
  username: string;
  sessionID: string;
}

export interface FieldReportListAllRequest {
  token: string;
  username: string;
}

export interface FieldReportListResponse {
  username: string;
  fieldReports: string;
  sessionID: string;
  time: string;
}

export interface FieldReportCreateRequest {
  fieldReports: string;
  sessionID: string;
  time: string;
  token: string;
}

export interface FieldReportUpdateRequest {
  username: string;
  fieldReports: string;
  sessionID: string;
}

export interface UserFieldReportRequest {
  username: string;
  token: string;
}

export interface UserFieldReportResponse {
  reports: [];
}

export default class ReportServiceClient {
  private _axios: AxiosInstance;

  /**
   * Construct a new Towns Service API client. Specify a serviceURL for testing, or otherwise
   * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
   * @param serviceURL
   */
  constructor(serviceURL?: string) {
    const baseURL = serviceURL || process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(baseURL);
    this._axios = axios.create({ baseURL });
  }

  static unwrapOrThrowError<T>(
    response: AxiosResponse<ResponseEnvelope<T>>,
    ignoreResponse = false,
  ): T {
    if (response.data.isOK) {
      if (ignoreResponse) {
        return {} as T;
      }
      assert(response.data.response);
      return response.data.response;
    }
    throw new Error(`Error processing request: ${response.data.message}`);
  }

  async createFieldReport(requestData: FieldReportCreateRequest): Promise<void> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<void>>(
      `/fieldReport`,
      requestData,
      { headers: { Authentication: `Bearer ${requestData.token}` } },
    );
    return ReportServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async deleteFieldReport(requestData: FieldReportDeleteRequest): Promise<void> {
    const responseWrapper = await this._axios.delete<ResponseEnvelope<void>>(
      `/fieldReport/${requestData.username}/${requestData.sessionID}`,
    );
    return ReportServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async updateFieldReport(requestData: FieldReportUpdateRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(
      `/fieldReport/${requestData.username}/${requestData.sessionID}`,
      requestData,
    );
    return ReportServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async listFieldReport(requestData: FieldReportListRequest): Promise<FieldReportListResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<FieldReportListResponse>>(
      `/fieldReport/${requestData.username}/${requestData.sessionID}`,
      { headers: { Authentication: `Bearer ${requestData.token}` } },
    );
    return ReportServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async listAllFieldReports(
    requestData: FieldReportListAllRequest,
  ): Promise<FieldReportListResponse[]> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<FieldReportListResponse[]>>(
      `/fieldReport/${requestData.username}`,
      { headers: { Authentication: `Bearer ${requestData.token}` } },
    );
    return ReportServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
