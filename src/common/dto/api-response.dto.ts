/**
 * Standard response envelope returned by every successful endpoint.
 * Keeping this consistent makes the API predictable for any client.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
