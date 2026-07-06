import { ApiResponse } from '../models/api-response.model';

/**
 * Respuestas simuladas para desarrollo sin backend (environment.useMock).
 * Refleja el contrato documentado en Templates/Base-main/api_app/README-app.md.
 */

// Memoria en runtime para simular deduplicación de tickets por firma.
const seenFirmas = new Set<string>();
let mockPoints = 167;

function ok<T>(data: T, message = 'ok'): ApiResponse<T> {
  return { data, error: false, message };
}

export function mockEndpoint<T>(endpoint: string, body: Record<string, string | number>): ApiResponse<T> {
  switch (endpoint) {
    case 'request_otp.php':
      // En mock el código siempre es 1234 (se muestra como dev_code).
      return ok({ sent: true, channel: body['channel'] ?? 'sms', dev_code: '1234' }, 'Código enviado') as ApiResponse<T>;

    case 'verify_otp.php': {
      // Código de prueba: 1234. Usuario "nuevo" para forzar el registro.
      const valid = String(body['code']) === '1234';
      if (!valid) {
        return { data: null as T, error: true, message: 'Código incorrecto' };
      }
      return ok(
        { token: 'mock-token', user: null, is_new: true },
        'Verificado',
      ) as ApiResponse<T>;
    }

    case 'register.php':
      return ok(
        {
          token: 'mock-token',
          user: {
            id: 'mock-1',
            phone: String(body['phone'] ?? ''),
            name: String(body['name'] ?? ''),
            lastname: String(body['lastname'] ?? ''),
            secondLastname: String(body['second_lastname'] ?? ''),
            birthdate: String(body['birthdate'] ?? ''),
          },
        },
        'Registro completado',
      ) as ApiResponse<T>;

    case 'get_points.php':
      return ok(
        {
          points: mockPoints,
          tierLevel: 1,
          pointsToNextTier: 324,
          nextRewardHint: '¡50 puntos más y llévate 5 litros gratis!',
        },
      ) as ApiResponse<T>;

    case 'get_streak.php':
      return ok({ currentDay: 5, totalDays: 7 }) as ApiResponse<T>;

    case 'register_ticket.php': {
      const firma = String(body['firma'] ?? '');
      if (!firma) {
        return { data: null as T, error: true, message: 'Ticket inválido' };
      }
      if (seenFirmas.has(firma)) {
        return { data: null as T, error: true, message: 'Este ticket ya fue registrado' };
      }
      const litros = Number(body['litros'] ?? 0);
      if (litros <= 0) {
        return { data: null as T, error: true, message: 'Ticket inválido: no se detectaron litros' };
      }
      seenFirmas.add(firma);
      const awarded = Math.max(1, Math.round(litros * 1.02)); // 1 pt/L + 2% Nivel 1
      mockPoints += awarded;
      return ok({ awarded, points: mockPoints, duplicated: false }, '¡Puntos acreditados!') as ApiResponse<T>;
    }

    default:
      return { data: null as T, error: true, message: `Endpoint mock no definido: ${endpoint}` };
  }
}
