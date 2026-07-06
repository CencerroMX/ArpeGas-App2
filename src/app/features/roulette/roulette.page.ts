import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent, AlertController,
} from '@ionic/angular/standalone';
import { ApiService } from '../../core/services/api.service';
import { LoaderService } from '../../core/services/loader.service';

interface RouletteItem {
  id: string;
  name: string;
  points: number;
  color: string;
}
interface Wedge {
  path: string;
  color: string;
  label: string;
  labelX: number;
  labelY: number;
  labelRot: number;
  textColor: string;
}

@Component({
  selector: 'app-roulette',
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar class="rl-toolbar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Ruleta</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rl-content">
      <div class="rl-wrap">
        <p class="rl-sub">¡Gira una vez al día y gana premios!</p>
        <p class="rl-points" *ngIf="points() !== null">Tienes <b>{{ points() }} pts</b></p>

        <ng-container *ngIf="wedges().length > 0; else empty">
          <div class="wheel-box">
            <div class="pointer"></div>
            <svg viewBox="0 0 300 300" class="wheel">
              <g class="wheel-rot" [style.transform]="'rotate(' + rotation() + 'deg)'">
                <g *ngFor="let w of wedges()">
                  <path [attr.d]="w.path" [attr.fill]="w.color" stroke="#ffffff" stroke-width="2" />
                  <text
                    [attr.x]="w.labelX" [attr.y]="w.labelY"
                    [attr.transform]="'rotate(' + w.labelRot + ' ' + w.labelX + ' ' + w.labelY + ')'"
                    [attr.fill]="w.textColor"
                    text-anchor="middle" dominant-baseline="middle"
                    font-size="12" font-weight="700"
                  >{{ w.label }}</text>
                </g>
              </g>
              <circle cx="150" cy="150" r="20" fill="#ffffff" stroke="#e0e4f0" stroke-width="2" />
            </svg>
          </div>

          <button
            class="spin-btn"
            [class.disabled]="!canSpin() || spinning()"
            [disabled]="!canSpin() || spinning()"
            (click)="spin()"
          >
            {{ spinning() ? 'Girando...' : (canSpin() ? '¡Girar!' : 'Ya giraste hoy') }}
          </button>
          <p class="rl-hint" *ngIf="!canSpin() && !spinning()">Vuelve mañana para otro giro 🎡</p>
        </ng-container>

        <ng-template #empty>
          <div class="rl-empty" *ngIf="loaded()">
            <div class="rl-emoji">🎡</div>
            <p>La ruleta aún no tiene premios. ¡Vuelve pronto!</p>
          </div>
        </ng-template>
      </div>
    </ion-content>
  `,
  styles: [`
    .rl-toolbar { --background: var(--arpe-blue-deep); --color: #fff; }
    .rl-toolbar ion-title, .rl-toolbar ion-back-button { --color: #fff; color: #fff; }
    .rl-content { --background: var(--arpe-bg); }
    .rl-wrap { padding: 20px 18px 40px; display: flex; flex-direction: column; align-items: center; }
    .rl-sub { color: #4a4f5a; font-size: 1rem; margin: 4px 0 2px; text-align: center; }
    .rl-points { color: var(--arpe-blue); margin: 0 0 16px; }
    .rl-points b { font-size: 1.1rem; }

    .wheel-box { position: relative; width: 300px; max-width: 86vw; aspect-ratio: 1; margin: 6px 0 26px; }
    .wheel { width: 100%; height: 100%; filter: drop-shadow(0 8px 20px rgba(26,63,166,0.25)); border-radius: 50%; }
    .wheel-rot { transform-origin: 150px 150px; transition: transform 4.2s cubic-bezier(0.15, 1, 0.25, 1); }
    .pointer {
      position: absolute; top: -6px; left: 50%; transform: translateX(-50%);
      width: 0; height: 0; z-index: 3;
      border-left: 16px solid transparent;
      border-right: 16px solid transparent;
      border-top: 26px solid var(--arpe-red);
      filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));
    }

    .spin-btn {
      width: 220px; max-width: 80%;
      height: 56px; border: 0; border-radius: 999px;
      background: var(--arpe-red); color: #fff;
      font-size: 1.15rem; font-weight: 700;
      box-shadow: 0 8px 18px rgba(212,43,43,0.35);
    }
    .spin-btn.disabled { background: var(--arpe-gray); box-shadow: none; }
    .rl-hint { color: #6b7180; font-size: 0.9rem; margin-top: 12px; }

    .rl-empty { text-align: center; color: #4a4f5a; padding: 40px 20px; }
    .rl-emoji { font-size: 60px; margin-bottom: 10px; }
  `],
})
export class RoulettePage {
  private api = inject(ApiService);
  private loader = inject(LoaderService);
  private alertCtrl = inject(AlertController);

  items = signal<RouletteItem[]>([]);
  wedges = signal<Wedge[]>([]);
  canSpin = signal<boolean>(false);
  points = signal<number | null>(null);
  rotation = signal<number>(0);
  spinning = signal<boolean>(false);
  loaded = signal<boolean>(false);

  private seg = 0;

  async ionViewWillEnter() {
    const res = await this.api.post<{ items: RouletteItem[]; canSpin: boolean }>('get_roulette.php');
    this.loaded.set(true);
    if (res.error) {
      this.loader.toast(res.message, 'danger');
      return;
    }
    this.items.set(res.data.items);
    this.canSpin.set(res.data.canSpin);
    this.buildWedges(res.data.items);
    // Puntos actuales (para mostrar/actualizar).
    const pts = await this.api.post<{ points: number }>('get_points.php');
    if (!pts.error) this.points.set(pts.data.points);
  }

  private point(angleDeg: number, r: number): { x: number; y: number } {
    const rad = (angleDeg * Math.PI) / 180;
    return { x: 150 + r * Math.sin(rad), y: 150 - r * Math.cos(rad) };
  }

  // Color de texto legible según el fondo del gajo.
  private textOn(hex: string): string {
    const h = hex.replace('#', '');
    if (h.length !== 6) return '#ffffff';
    const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.6 ? '#1c1f26' : '#ffffff';
  }

  private buildWedges(items: RouletteItem[]) {
    const n = items.length;
    if (n === 0) { this.wedges.set([]); return; }
    this.seg = 360 / n;
    const wedges: Wedge[] = items.map((it, i) => {
      const a0 = i * this.seg;
      const a1 = (i + 1) * this.seg;
      const p0 = this.point(a0, 140);
      const p1 = this.point(a1, 140);
      const largeArc = this.seg > 180 ? 1 : 0;
      const path = `M150 150 L${p0.x.toFixed(2)} ${p0.y.toFixed(2)} A140 140 0 ${largeArc} 1 ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} Z`;
      const mid = (a0 + a1) / 2;
      const lp = this.point(mid, 92);
      let rot = mid;
      if (mid > 90 && mid < 270) rot -= 180; // mantener texto legible
      const color = /^#[0-9a-fA-F]{6}$/.test(it.color) ? it.color : '#1a3fa6';
      return {
        path, color,
        label: it.name.length > 14 ? it.name.slice(0, 13) + '…' : it.name,
        labelX: lp.x, labelY: lp.y, labelRot: rot,
        textColor: this.textOn(color),
      };
    });
    this.wedges.set(wedges);
  }

  async spin() {
    if (!this.canSpin() || this.spinning()) return;
    this.spinning.set(true);

    const res = await this.api.post<{ index: number; item: { name: string; points: number }; points: number }>(
      'spin_roulette.php',
    );
    if (res.error) {
      this.spinning.set(false);
      this.canSpin.set(false);
      this.loader.toast(res.message, 'medium');
      return;
    }

    const index = res.data.index;
    // Rotación objetivo: centro del gajo ganador bajo el puntero (arriba).
    const targetMod = (360 - (((index + 0.5) * this.seg) % 360)) % 360;
    const currentMod = ((this.rotation() % 360) + 360) % 360;
    const delta = ((targetMod - currentMod) + 360) % 360;
    const newRotation = this.rotation() + 360 * 5 + delta;
    this.rotation.set(newRotation);

    // Espera a que termine la animación para mostrar el resultado.
    setTimeout(async () => {
      this.spinning.set(false);
      this.canSpin.set(false);
      this.points.set(res.data.points);
      const p = res.data.item.points;
      const msg = p > 0
        ? `Ganaste "${res.data.item.name}" (+${p} puntos). ¡Ahora tienes ${res.data.points} pts!`
        : `Te salió: "${res.data.item.name}". ¡Sigue participando!`;
      const alert = await this.alertCtrl.create({
        header: '🎉 ¡Resultado!',
        message: msg,
        buttons: ['Genial'],
      });
      await alert.present();
    }, 4300);
  }
}
