import { Injectable } from '@angular/core';
import { TicketData } from '../models/ticket.model';

/**
 * Parsea el string del QR del ticket ARPE.
 *
 * Formato v2 (con litros, 9 campos):
 *   |permiso|empresa|fecha|hora|litros|subtotal|iva|total|firma|
 * Formato v1 (viejo, 8 campos, sin litros): litros = 0.
 */
@Injectable({ providedIn: 'root' })
export class TicketParserService {
  parse(raw: string): TicketData | null {
    if (!raw) {
      return null;
    }
    // Separa por | y descarta los vacíos generados por los pipes de los extremos.
    const fields = raw.split('|').map((p) => p.trim()).filter((p) => p.length > 0);

    const num = (v: string) => {
      const n = Number((v ?? '').replace(/[^0-9.\-]/g, ''));
      return Number.isFinite(n) ? n : NaN;
    };

    let ticket: TicketData | null = null;

    if (fields.length >= 9) {
      // Formato v2: con litros.
      const [permiso, empresa, fecha, hora, litros, subtotal, iva, total, firma] = fields;
      ticket = {
        permiso, empresa, fecha, hora,
        litros: num(litros),
        subtotal: num(subtotal),
        iva: num(iva),
        total: num(total),
        firma, raw,
      };
    } else if (fields.length >= 8) {
      // Formato v1: sin litros.
      const [permiso, empresa, fecha, hora, subtotal, iva, total, firma] = fields;
      ticket = {
        permiso, empresa, fecha, hora,
        litros: 0,
        subtotal: num(subtotal),
        iva: num(iva),
        total: num(total),
        firma, raw,
      };
    } else {
      return null;
    }

    // Validación básica de coherencia.
    if (!ticket.permiso || !ticket.firma || Number.isNaN(ticket.total)) {
      return null;
    }
    return ticket;
  }
}
