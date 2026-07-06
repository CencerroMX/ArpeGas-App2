/** Contrato de respuesta del backend PHP (api_app): { data, error, message }. */
export interface ApiResponse<T = any> {
  data: T;
  error: boolean;
  message: string;
}
