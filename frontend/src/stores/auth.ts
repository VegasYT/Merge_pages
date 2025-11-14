import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthStore {
	accessToken: string | null;
	refreshToken: string | null;

	setTokens: (accessToken: string, refreshToken: string) => void;
	clearTokens: () => void;
}

const useAuthStore = create(
	persist<AuthStore>(
		(set) => ({
			accessToken: null,
			refreshToken: null,

			setTokens: (accessToken: string, refreshToken: string) => {
				console.log('📝 Setting tokens:', {
					accessToken: accessToken ? `${accessToken.substring(0, 20)}...` : null,
					refreshToken: refreshToken ? `${refreshToken.substring(0, 20)}...` : null,
				});
				set({ accessToken, refreshToken });
			},

			clearTokens: () => {
				console.log('🗑️ Clearing tokens');
				set({ accessToken: null, refreshToken: null });
			},
		}),
		{
			name: 'auth-local-storage',
		}
	)
);

export default useAuthStore;

