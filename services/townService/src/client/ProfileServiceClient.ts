import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

/**
 * Requests that require authentication must have an authentication access token
 */
export interface AuthenticatedRequest {
  token: string;
}

/**
 * Payload sent by the client to retrieve profile information for a user by email
 */
export interface GetProfileRequest extends AuthenticatedRequest {
  email: string;
}

/**
 * Response from the server for a get profile request
 */
export interface GetProfileResponse {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  pronouns: string;
  occupation: string;
  bio: string;
}

/**
 * Payload sent by the client to retrieve profile information for a user by username
 */
export interface GetProfileRequestUsername extends AuthenticatedRequest {
  username: string;
}

/**
 * Payload sent by the client to create and/or update a profile
 */
export interface ProfileRequest extends AuthenticatedRequest {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  pronouns: string;
  occupation: string;
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

  async getProfile(requestData: GetProfileRequest): Promise<GetProfileResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GetProfileResponse>>(
      '/api/v2/users-by-email',
      {
        headers: { Authorization: `Bearer ${requestData.token}` },
        params: { email: requestData.email },
      },
    );
    return ProfileServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async getProfileByUsername(requestData: GetProfileRequestUsername): Promise<GetProfileResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GetProfileResponse>>(
      `/api/v2/users/${requestData.username}`,
      { headers: { Authorization: `Bearer ${requestData.token}` } },
    );
    return ProfileServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async postProfile(requestData: ProfileRequest): Promise<void> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<void>>(
      '/api/v2/users/',
      requestData,
      {
        headers: { Authorization: `Bearer ${requestData.token}` },
      },
    );
    return ProfileServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async patchProfile(requestData: ProfileRequest): Promise<void> {
    const responseWrapper = await this._axios.patch<ResponseEnvelope<void>>(
      `/api/v2/users/${requestData.email}`,
      requestData,
      {
        headers: { Authorization: `Bearer ${requestData.token}` },
      },
    );
    return ProfileServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
