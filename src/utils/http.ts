import { AxiosInstance } from 'axios'

export const addAuthHeaders = (axiosInstance: AxiosInstance, token: string | null): void => {
	if (!token) return

	if (token.startsWith('Bearer')) axiosInstance.defaults.headers.common.Authorization = token
	else axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`
}

export const removeAuthHeaders = (axiosInstance: AxiosInstance): void => {
	axiosInstance.defaults.headers.common.Authorization = ''
}
