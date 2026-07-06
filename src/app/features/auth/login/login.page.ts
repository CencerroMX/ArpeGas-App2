import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
  template: `
    <ion-content [fullscreen]="true" class="login-content">
      <div class="login-wrap">
        <img class="logo" src="assets/logo/arpe-logo-color.png" alt="ARPE Gas" />

        <h1 class="heading-blue title">Ingresa tu contraseña</h1>
        <p class="sub">Bienvenido de vuelta. Escribe tu contraseña para entrar.</p>
        <p class="phone" *ngIf="phone()">{{ phone() }}</p>

        <div class="pass-field">
          <input
            class="pass-input"
            [type]="show() ? 'text' : 'password'"
            placeholder="Contraseña"
            [(ngModel)]="password"
            (keyup.enter)="login()"
          />
          <button class="toggle" type="button" (click)="show.set(!show())">
            {{ show() ? 'Ocultar' : 'Ver' }}
          </button>
        </div>

        <button
          class="arpe-btn full"
          [class.btn-primary]="password.length > 0"
          [class.btn-disabled]="password.length === 0"
          [disabled]="password.length === 0"
          (click)="login()"
        >
          Iniciar sesión
        </button>

        <button class="link" type="button" (click)="useAnother()">Usar otro número</button>
      </div>
    </ion-content>
  `,
  styles: [`
    .login-content { --background: #ffffff; }
    .login-wrap {
      padding: calc(var(--ion-safe-area-top, 0) + 48px) 24px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .logo { width: 46%; max-width: 190px; margin-bottom: 40px; }
    .title { font-size: 1.6rem; margin: 0 0 8px; text-align: center; }
    .sub { color: #4a4f5a; font-size: 0.95rem; margin: 0 0 4px; text-align: center; }
    .phone { color: var(--arpe-blue); font-weight: 700; margin: 0 0 24px; }
    .pass-field {
      width: 100%;
      display: flex;
      align-items: center;
      border: 1.5px solid #cfd3de;
      border-radius: 999px;
      padding: 0 8px 0 20px;
      margin-bottom: 18px;
      height: 58px;
    }
    .pass-input {
      flex: 1;
      border: 0;
      outline: none;
      font-size: 1rem;
      font-family: var(--ion-font-family);
      background: transparent;
    }
    .toggle {
      border: 0;
      background: transparent;
      color: var(--arpe-blue);
      font-weight: 600;
      padding: 8px 12px;
    }
    .arpe-btn.full { width: 100%; border: 0; }
    .link {
      margin-top: 20px;
      background: transparent;
      border: 0;
      color: var(--arpe-blue);
      font-weight: 600;
      font-size: 0.95rem;
    }
  `],
})
export class LoginPage implements OnInit {
  private auth = inject(AuthService);
  private loader = inject(LoaderService);
  private router = inject(Router);

  phone = signal<string>('');
  show = signal<boolean>(false);
  password = '';

  async ngOnInit() {
    this.phone.set(await this.auth.getPendingPhone());
  }

  async login() {
    if (!this.password) {
      return;
    }
    await this.loader.present('Iniciando sesión...');
    try {
      await this.auth.loginPassword(this.password);
      await this.loader.dismiss();
      this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    } catch (e) {
      await this.loader.dismiss();
      this.loader.toast((e as Error).message || 'No se pudo iniciar sesión', 'danger');
    }
  }

  useAnother() {
    this.router.navigateByUrl('/auth/phone', { replaceUrl: true });
  }
}
