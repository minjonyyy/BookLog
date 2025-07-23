import apiClient from './api';

// DTO (Data Transfer Object) 타입을 정의합니다.
interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  userId: number;
  username: string;
  email: string;
  message: string;
}

const register = async (userData: RegisterRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/register', userData);
  return response.data;
};

const login = async (userData: LoginRequest): Promise<AuthResponse> => {
  const response = await apiClient.post<AuthResponse>('/auth/login', userData);
  return response.data;
};

const authService = {
  register,
  login,
};

export default authService; 