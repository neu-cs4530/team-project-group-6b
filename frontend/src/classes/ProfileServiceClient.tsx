import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */

export type CoveyTownInfo = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number;
};

export interface AuthenticatedRequest {
  token: string;
}

export interface GetProfileRequest extends AuthenticatedRequest {
  email: string;
}

export interface PostProfileRequest extends AuthenticatedRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface PatchProfileRequest extends AuthenticatedRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
}
/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}

export default class ProfileServiceClient {
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

  async getProfile(requestData: GetProfileRequest): Promise<any> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<any>>(
      `/api/v2/users/${requestData.email}`,
      { headers: { Authentication: `Bearer ${requestData.token}` } },
    );
    return ProfileServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async postProfile(requestData: PostProfileRequest): Promise<any> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<any>>(
      `/api/v2/users/`,
      requestData,
      {
        headers: { Authorization: `Bearer ${requestData.token}` },
      },
    );
    return ProfileServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async patchProfile(requestData: PatchProfileRequest): Promise<any> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<any>>(
      `/api/v2/users/`,
      requestData,
      {
        headers: { Authorization: `Bearer ${requestData.token}` },
      },
    );
    return ProfileServiceClient.unwrapOrThrowError(responseWrapper);
  }

  // make a new request to PUT / PATCH a user profile (convo with miraj)
}
