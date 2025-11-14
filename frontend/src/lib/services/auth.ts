import axios from 'axios';
import { REST_API_URL } from '../constants/env';
import apiClient from './client';

interface UserMeResponse {
	id: number;
	email: string;
	created_at: string;
}

interface TokensResponse {
	access_token: string;
	refresh_token: string;
}

export const registerHelper = async (body: {
	email: string;
	password: string;
}) => {
	const apiUrl = `${REST_API_URL}/auth/register`;
	const { data } = await axios.post(apiUrl, body);

	return data as UserMeResponse;
};

export const loginHelper = async (body: {
	email: string;
	password: string;
}) => {
	const apiUrl = `${REST_API_URL}/auth/login`;
	const { data } = await axios.post(apiUrl, body);

	return data as TokensResponse;
};

export const registerThenLoginHelper = async (body: {
	email: string;
	password: string;
}) => {
	await registerHelper(body);
	const tokens = await loginHelper(body);
	return tokens;
};

export const refreshTokenHelper = async (refreshToken: string) => {
	const apiUrl = `${REST_API_URL}/auth/refresh-token`;
	const { data } = await axios.post(apiUrl, { refresh_token: refreshToken });

	return data as TokensResponse;
};

export const getCurrentUserInfoHelper = async () => {
	const { data } = await apiClient.get('/auth/me');

	return data as UserMeResponse;
};

export const logoutHelper = async () => {
	await apiClient.post('/auth/logout');
};

