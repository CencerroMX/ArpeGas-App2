/**
 * Datos embebidos en el QR del ticket ARPE (formato v2, con litros).
 * Formato: |permiso|empresa|fecha|hora|litros|subtotal|iva|total|firma|
 * Ej: |P00778|CORPORATIVO ARPE, S.A. DE C.V.|04/06/2025|10:32|6.330|129.81|20.19|150.00|<firma>|
 *
 * Compatibilidad: si el QR viene en el formato viejo (8 campos, sin litros),
 * litros queda en 0 y el backend rechaza el registro (no puede acreditar puntos).
 */
export interface TicketData {
  permiso: string;   // P00778
  empresa: string;   // CORPORATIVO ARPE, S.A. DE C.V.
  fecha: string;     // 04/06/2025
  hora: string;      // 10:32
  litros: number;    // 6.330  (base de puntos: 1 punto por litro)
  subtotal: number;  // 129.81
  iva: number;       // 20.19
  total: number;     // 150.00
  firma: string;     // firma (llave única anti-duplicado)
  raw: string;       // string original escaneado
}

export interface RegisterTicketResult {
  awarded: number;   // puntos otorgados por este ticket
  points: number;    // total de puntos tras acreditar
  duplicated: boolean;
}
