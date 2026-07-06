import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon, AlertController } from '@ionic/angular/standalone';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import {
  BarcodeScanner,
  BarcodeFormat,
} from '@capacitor-mlkit/barcode-scanning';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { addIcons } from 'ionicons';
import { chevronBackOutline, flashOutline, imageOutline } from 'ionicons/icons';
import { TicketParserService } from '../../../core/services/ticket-parser.service';
import { ApiService } from '../../../core/services/api.service';
import { LoaderService } from '../../../core/services/loader.service';
import { RegisterTicketResult } from '../../../core/models/ticket.model';
import { PointsSummary } from '../../../core/models/rewards.model';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, IonContent, IonIcon],
  templateUrl: './ticket.page.html',
  styleUrls: ['./ticket.page.scss'],
})
export class TicketPage {
  private parser = inject(TicketParserService);
  private api = inject(ApiService);
  private loader = inject(LoaderService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  isNative = Capacitor.isNativePlatform();
  isScanning = signal(false);
  torchOn = signal(false);
  points = signal<number | null>(null);
  private busy = false;
  private listener?: PluginListenerHandle;

  // QR de ejemplo (formato v2 con litros) para probar el parser en navegador (dev).
  private readonly sampleQr =
    '|P00778|CORPORATIVO ARPE, S.A. DE C.V.|04/06/2025|10:32|6.330|129.81|20.19|150.00|tT7IecYK+CAJW4PXULHRHzNz4Rl3QncFL1rT2/2lFiQ=|';

  constructor() {
    addIcons({ chevronBackOutline, flashOutline, imageOutline });
  }

  async ionViewWillEnter() {
    this.loadPoints();
    if (this.isNative) {
      await this.startScan();
    }
  }

  async ionViewWillLeave() {
    await this.stopScan();
  }

  private async loadPoints() {
    const res = await this.api.post<PointsSummary>('get_points.php');
    if (!res.error) {
      this.points.set(res.data.points);
    }
  }

  private async ensurePermission(): Promise<boolean> {
    const { camera } = await BarcodeScanner.checkPermissions();
    if (camera === 'granted' || camera === 'limited') {
      return true;
    }
    const req = await BarcodeScanner.requestPermissions();
    return req.camera === 'granted' || req.camera === 'limited';
  }

  async startScan() {
    if (!this.isNative || this.isScanning()) {
      return;
    }
    const granted = await this.ensurePermission();
    if (!granted) {
      this.loader.toast('Permiso de cámara denegado', 'danger');
      return;
    }
    document.body.classList.add('scanner-active');
    this.isScanning.set(true);
    this.listener = await BarcodeScanner.addListener('barcodesScanned', async (event) => {
      const raw = event.barcodes?.[0]?.rawValue ?? event.barcodes?.[0]?.displayValue;
      if (raw) {
        await this.handleRaw(raw);
      }
    });
    await BarcodeScanner.startScan({ formats: [BarcodeFormat.QrCode] });
  }

  async stopScan() {
    document.body.classList.remove('scanner-active');
    this.isScanning.set(false);
    this.torchOn.set(false);
    await this.listener?.remove();
    this.listener = undefined;
    if (this.isNative) {
      try {
        await BarcodeScanner.stopScan();
      } catch {
        // ignore
      }
    }
  }

  async toggleTorch() {
    if (!this.isNative || !this.isScanning()) {
      return;
    }
    try {
      await BarcodeScanner.toggleTorch();
      this.torchOn.update((v) => !v);
    } catch {
      // torch no disponible
    }
  }

  async fromGallery() {
    try {
      const photo = await Camera.getPhoto({
        source: CameraSource.Photos,
        resultType: CameraResultType.Uri,
        quality: 100,
      });
      const path = photo.path ?? photo.webPath;
      if (!path) {
        return;
      }
      await this.stopScan();
      const { barcodes } = await BarcodeScanner.readBarcodesFromImage({
        path,
        formats: [BarcodeFormat.QrCode],
      });
      const raw = barcodes?.[0]?.rawValue;
      if (raw) {
        await this.handleRaw(raw);
      } else {
        this.loader.toast('No se detectó un código QR en la imagen', 'danger');
      }
    } catch {
      // usuario canceló o error
    }
  }

  /** Dev: simula un escaneo con el QR de ejemplo (solo navegador). */
  simulateScan() {
    this.handleRaw(this.sampleQr);
  }

  private async handleRaw(raw: string) {
    if (this.busy) {
      return;
    }
    this.busy = true;
    await this.stopScan();

    const ticket = this.parser.parse(raw);
    if (!ticket) {
      await this.loader.toast('El QR no corresponde a un ticket ARPE válido', 'danger');
      this.busy = false;
      if (this.isNative) {
        await this.startScan();
      }
      return;
    }

    if (!ticket.litros || ticket.litros <= 0) {
      await this.showAlert(
        'Ticket sin litros',
        'Este ticket no incluye los litros cargados, por lo que no es posible acreditar puntos.',
      );
      this.busy = false;
      return;
    }

    await this.loader.present('Registrando ticket...');
    const res = await this.api.post<RegisterTicketResult>('register_ticket.php', {
      permiso: ticket.permiso,
      empresa: ticket.empresa,
      fecha: ticket.fecha,
      hora: ticket.hora,
      litros: ticket.litros,
      subtotal: ticket.subtotal,
      iva: ticket.iva,
      total: ticket.total,
      firma: ticket.firma,
    });
    await this.loader.dismiss();

    if (res.error) {
      await this.showAlert('Ticket no acreditado', res.message);
    } else {
      this.points.set(res.data.points);
      await this.showAlert(
        '¡Puntos acreditados!',
        `Ganaste ${res.data.awarded} puntos por tu carga de ${ticket.litros.toFixed(3)} L. Ahora tienes ${res.data.points} puntos.`,
      );
    }
    this.busy = false;
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Entendido'],
    });
    await alert.present();
  }

  goBack() {
    this.router.navigateByUrl('/tabs/home');
  }

  goToPoints() {
    this.router.navigateByUrl('/tabs/home');
  }

  async goToQrTool() {
    // Detiene la cámara antes de salir para que el generador no muestre la cámara de fondo.
    await this.stopScan();
    this.router.navigateByUrl('/qr-tool');
  }
}
