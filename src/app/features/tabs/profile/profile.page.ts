import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, AlertController } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, IonContent],
  template: `
    <ion-content class="profile-content">
      <div class="hero">
        <div class="avatar">{{ initials() || '👤' }}</div>
        <h2 class="name">{{ fullName() || 'Cliente ARPE' }}</h2>
        <p class="phone">{{ phoneDisplay() }}</p>
      </div>

      <div class="info-card">
        <div class="row">
          <span class="label">Nombre(s)</span>
          <span class="value">{{ user()?.name || '—' }}</span>
        </div>
        <div class="row">
          <span class="label">Apellidos</span>
          <span class="value">{{ apellidos() || '—' }}</span>
        </div>
        <div class="row">
          <span class="label">Teléfono</span>
          <span class="value">{{ phoneDisplay() }}</span>
        </div>
        <div class="row">
          <span class="label">Fecha de nacimiento</span>
          <span class="value">{{ user()?.birthdate || '—' }}</span>
        </div>
      </div>

      <button class="arpe-btn btn-red logout" (click)="confirmLogout()">
        Cerrar sesión
      </button>
    </ion-content>
  `,
  styles: [`
    .profile-content { --background: var(--arpe-bg); }
    .hero {
      background: linear-gradient(180deg, var(--arpe-blue-deep) 0%, var(--arpe-blue-deep-2) 100%);
      padding: calc(var(--ion-safe-area-top, 0) + 40px) 24px 32px;
      text-align: center;
      border-bottom-left-radius: 28px;
      border-bottom-right-radius: 28px;
    }
    .avatar {
      width: 104px;
      height: 104px;
      border-radius: 50%;
      background: #fff;
      color: var(--arpe-blue);
      font-size: 2.4rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 14px;
      box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    }
    .name { color: #fff; font-weight: 700; font-size: 1.5rem; margin: 0; }
    .phone { color: rgba(255,255,255,0.85); font-size: 0.95rem; margin: 4px 0 0; }

    .info-card {
      background: #fff;
      border-radius: var(--arpe-radius-card);
      box-shadow: var(--arpe-shadow-card);
      margin: 20px 18px 0;
      padding: 6px 18px;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px solid #eef0f6;
    }
    .row:last-child { border-bottom: 0; }
    .label { color: #6b7180; font-size: 0.9rem; }
    .value { color: #1c1f26; font-weight: 600; font-size: 0.95rem; text-align: right; }

    .logout {
      display: block;
      width: calc(100% - 36px);
      margin: 26px 18px;
      border: 0;
    }
  `],
})
export class ProfilePage {
  private auth = inject(AuthService);
  private router = inject(Router);
  private alertCtrl = inject(AlertController);

  user = this.auth.user;

  fullName = computed(() => {
    const u = this.user();
    return u ? `${u.name} ${u.lastname}`.trim() : '';
  });

  apellidos = computed(() => {
    const u = this.user();
    if (!u) return '';
    return `${u.lastname} ${u.secondLastname ?? ''}`.trim();
  });

  initials = computed(() => {
    const u = this.user();
    if (!u) return '';
    const a = (u.name?.[0] ?? '').toUpperCase();
    const b = (u.lastname?.[0] ?? '').toUpperCase();
    return (a + b) || '';
  });

  phoneDisplay = computed(() => {
    const p = this.user()?.phone ?? '';
    return p || '—';
  });

  async confirmLogout() {
    const alert = await this.alertCtrl.create({
      header: 'Cerrar sesión',
      message: '¿Seguro que quieres cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar sesión',
          role: 'destructive',
          handler: async () => {
            await this.auth.logout();
            this.router.navigateByUrl('/auth/phone', { replaceUrl: true });
          },
        },
      ],
    });
    await alert.present();
  }
}
