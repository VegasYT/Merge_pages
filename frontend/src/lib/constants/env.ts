export const REST_API_URL = `${
	import.meta.env.VITE_REST_API_SSL === 'true' ? 'https' : 'http'
}://${import.meta.env.VITE_REST_API_HOST}/api`;

