import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { refreshOutline, copyOutline } from 'ionicons/icons';
import * as QRCode from 'qrcode';
import { Clipboard } from '@capacitor/clipboard';
import { LoaderService } from '../../core/services/loader.service';

/**
 * Herramienta (dev) para generar QRs de prueba del ticket ARPE (formato v2 con litros)
 * y copiar el string al portapapeles.
 */
@Component({
  selector: 'app-qr-tool',
  standalone: true,
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, IonIcon,
  ],
  templateUrl: './qr-tool.page.html',
  styleUrls: ['./qr-tool.page.scss'],
})
export class QrToolPage implements OnInit {
  private loader = inject(LoaderService);

  // Valores por defecto (los mismos datos de ejemplo + litros).
  permiso = 'P00778';
  empresa = 'CORPORATIVO ARPE, S.A. DE C.V.';
  fecha = '04/06/2025';
  hora = '10:32';
  litros = '6.330';
  subtotal = '129.81';
  iva = '20.19';
  total = '150.00';
  firma = '';

  qrDataUrl = signal<string>('');
  qrString = signal<string>('');

  constructor() {
    addIcons({ refreshOutline, copyOutline });
  }

  ngOnInit() {
    // Defensivo: asegura fondo sólido (por si quedó activo el modo escáner transparente).
    document.body.classList.remove('scanner-active');
    this.newFirma();
    this.generate();
  }

  private buildString(): string {
    const campos = [
      this.permiso, this.empresa, this.fecha, this.hora,
      this.litros, this.subtotal, this.iva, this.total, this.firma,
    ].map((c) => (c ?? '').toString().trim());
    return '|' + campos.join('|') + '|';
  }

  newFirma() {
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    this.firma = btoa(String.fromCharCode(...bytes));
  }

  async generate() {
    const str = this.buildString();
    this.qrString.set(str);
    try {
      const url = await QRCode.toDataURL(str, { width: 320, margin: 2, errorCorrectionLevel: 'M' });
      this.qrDataUrl.set(url);
    } catch {
      this.qrDataUrl.set('');
      this.loader.toast('No se pudo generar el QR', 'danger');
    }
  }

  async regenerateWithNewFirma() {
    this.newFirma();
    await this.generate();
  }

  async copyString() {
    const str = this.qrString();
    if (!str) {
      return;
    }
    try {
      await Clipboard.write({ string: str });
      this.loader.toast('String copiado al portapapeles', 'success');
    } catch {
      this.loader.toast('No se pudo copiar', 'danger');
    }
  }
}
