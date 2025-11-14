import axios from 'axios';
import { REST_API_URL } from '../constants/env';
import { useAuthStore } from '@/stores';

const apiClient = axios.create({
	baseURL: `${REST_API_URL}`,
	headers: {
		'Content-Type': 'application/json',
	},
});

apiClient.interceptors.request.use(
	(config) => {
		const accessToken = useAuthStore.getState().accessToken;
		if (accessToken) {
			config.headers.Authorization = `Bearer ${accessToken}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

apiClient.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		if (error.response?.status === 401 && !originalRequest._isRetry) {
			originalRequest._isRetry = true;

			try {
				const refreshToken = useAuthStore.getState().refreshToken;

				console.log('🔄 Attempting token refresh...');
				console.log('Refresh token exists:', !!refreshToken);

				if (!refreshToken) {
					console.error('❌ No refresh token available');
					throw new Error('No refresh token');
				}

				const response = await axios.post(
					`${REST_API_URL}/auth/refresh-token`,
					{ refresh_token: refreshToken }
				);

				console.log('✅ Token refresh response:', response.data);

				const newAccessToken = response.data.access_token;
				const newRefreshToken = response.data.refresh_token;

				if (!newAccessToken || !newRefreshToken) {
					console.error('❌ Invalid token response:', response.data);
					throw new Error('Invalid tokens in response');
				}

				console.log('💾 Saving new tokens...');
				useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

				originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

				console.log('🔁 Retrying original request...');
				return apiClient(originalRequest);
			} catch (refreshError: any) {
				console.error('❌ Token refresh failed:', refreshError);

				if (refreshError.response) {
					console.error('Response status:', refreshError.response.status);
					console.error('Response data:', refreshError.response.data);
				}

				// Clear tokens and redirect to login
				console.log('🧹 Clearing tokens and redirecting to login...');
				useAuthStore.getState().clearTokens();

				// Redirect to login after a small delay to ensure state is cleared
				if (typeof window !== 'undefined') {
					setTimeout(() => {
						window.location.href = '/auth/login';
					}, 100);
				}

				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default apiClient;

