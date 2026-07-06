import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api-response.model';
import { StorageService } from './storage.service';
import { mockEndpoint } from './api.mock';

// Debe coincidir con la clave usada en AuthService.
const TOKEN_KEY = 'arpe_token';

/**
 * Cliente HTTP central. Consume el contrato del backend PHP { data, error, message }.
 * Con environment.useMock === true responde datos simulados sin tocar la red.
 * Adjunta automáticamente el token de sesión a cada petición.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private storage = inject(StorageService);
  private baseUrl = environment.apiBaseUrl;

  /** POST application/x-www-form-urlencoded a un endpoint .php del api_app. */
  async post<T = any>(endpoint: string, body: Record<string, string | number> = {}): Promise<ApiResponse<T>> {
    // Adjunta el token de sesión si existe y no viene ya en el body.
    const fullBody: Record<string, string | number> = { ...body };
    if (fullBody['token'] === undefined) {
      const token = await this.storage.get<string>(TOKEN_KEY);
      if (token) {
        fullBody['token'] = token;
      }
    }

    if (environment.useMock) {
      // Latencia simulada para que la UI muestre loaders.
      await new Promise((r) => setTimeout(r, 500));
      return mockEndpoint<T>(endpoint, fullBody);
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const form = new URLSearchParams();
    Object.entries(fullBody).forEach(([k, v]) => form.set(k, String(v)));

    const url = `${this.baseUrl}/${endpoint}`;
    const res = await firstValueFrom(
      this.http.post(url, form.toString(), { headers, responseType: 'text' }),
    );
    // El backend usa print_r(json_encode(...)); parseamos el JSON del texto.
    return JSON.parse(res) as ApiResponse<T>;
  }
}
