import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';
import { OtpChannel } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-phone',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
  templateUrl: './phone.page.html',
  styleUrls: ['./phone.page.scss'],
})
export class PhonePage {
  private auth = inject(AuthService);
  private loader = inject(LoaderService);
  private router = inject(Router);

  version = environment.appVersion;
  phoneDisplay = '';   // "(614) 123 4560"
  private digits = ''; // "6141234560"

  get isValid(): boolean {
    return this.digits.length === 10;
  }

  onPhoneInput(value: string) {
    this.digits = value.replace(/\D/g, '').slice(0, 10);
    this.phoneDisplay = this.format(this.digits);
  }

  private format(d: string): string {
    if (d.length === 0) return '';
    if (d.length <= 3) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
    return `(${d.slice(0, 3)}) ${d.slice(3, 6)} ${d.slice(6)}`;
  }

  async send(channel: OtpChannel) {
    if (!this.isValid) {
      this.loader.toast('Ingresa un número de 10 dígitos', 'danger');
      return;
    }
    const phone = `+52${this.digits}`;
    await this.loader.present('Un momento...');
    try {
      // Si el teléfono ya tiene cuenta -> login con contraseña (sin OTP).
      const exists = await this.auth.checkPhone(phone);
      if (exists) {
        await this.loader.dismiss();
        this.router.navigateByUrl('/auth/login');
        return;
      }
      // Nuevo: enviamos el código por el canal elegido.
      const { devCode } = await this.auth.requestOtp(phone, channel);
      await this.loader.dismiss();
      if (devCode) {
        this.loader.toast(`Código de prueba: ${devCode}`);
      }
      this.router.navigateByUrl('/auth/otp');
    } catch (e) {
      await this.loader.dismiss();
      this.loader.toast((e as Error).message || 'No se pudo continuar', 'danger');
    }
  }
}
