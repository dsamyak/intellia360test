export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string | string[];
  error?: string;
}
