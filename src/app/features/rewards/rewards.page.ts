import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
} from '@ionic/angular/standalone';
import { ApiService } from '../../core/services/api.service';
import { LoaderService } from '../../core/services/loader.service';
import { Reward, PointsSummary } from '../../core/models/rewards.model';

@Component({
  selector: 'app-rewards',
  standalone: true,
  imports: [
    CommonModule, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent,
  ],
  template: `
    <ion-header>
      <ion-toolbar class="rw-toolbar">
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/tabs/home" text=""></ion-back-button>
        </ion-buttons>
        <ion-title>Reclama tus premios</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="rw-content">
      <div class="rw-wrap">
        <!-- Puntos del usuario -->
        <div class="rw-points" *ngIf="points() as p">
          <span>Tienes</span>
          <b>{{ p.points }} pts</b>
        </div>

        <!-- Sin premios -->
        <div class="rw-empty" *ngIf="loaded() && rewards().length === 0">
          <div class="rw-emoji">🎁</div>
          <p>Aún no hay premios disponibles. ¡Vuelve pronto!</p>
        </div>

        <!-- Lista de premios -->
        <div class="rw-card" *ngFor="let r of rewards()">
          <div class="rw-img" [class.placeholder]="!r.image">
            <img *ngIf="r.image" [src]="r.image" [alt]="r.name" />
            <img *ngIf="!r.image" class="rw-ph" src="assets/illustrations/cup.png" alt="" />
          </div>
          <div class="rw-body">
            <h3 class="rw-name">{{ r.name }}</h3>
            <p class="rw-desc" *ngIf="r.desc">{{ r.desc }}</p>
            <div class="rw-foot">
              <span class="rw-cost">{{ r.points }} pts</span>
              <button
                class="rw-btn"
                [class.enabled]="canAfford(r)"
                (click)="redeem(r)"
              >
                {{ canAfford(r) ? 'Canjear' : 'Te faltan ' + missing(r) + ' pts' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .rw-toolbar { --background: var(--arpe-blue-deep); --color: #fff; }
    .rw-toolbar ion-title, .rw-toolbar ion-back-button { --color: #fff; color: #fff; }
    .rw-content { --background: var(--arpe-bg); }
    .rw-wrap { padding: 16px; }

    .rw-points {
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: var(--arpe-blue-deep); color: #fff;
      border-radius: 14px; padding: 12px; margin-bottom: 16px;
    }
    .rw-points b { font-size: 1.2rem; }

    .rw-empty { text-align: center; color: #4a4f5a; padding: 48px 20px; }
    .rw-emoji { font-size: 56px; margin-bottom: 10px; }

    .rw-card {
      background: #fff; border-radius: 16px; box-shadow: var(--arpe-shadow-card);
      display: flex; overflow: hidden; margin-bottom: 14px;
    }
    .rw-img {
      width: 110px; min-width: 110px; background: #eef0f8;
      display: flex; align-items: center; justify-content: center;
    }
    .rw-img img { width: 100%; height: 100%; object-fit: cover; }
    .rw-img .rw-ph { width: 64px; height: 64px; object-fit: contain; }
    .rw-img span { font-size: 40px; }
    .rw-body { flex: 1; padding: 14px; }
    .rw-name { color: var(--arpe-blue); font-weight: 700; font-size: 1.05rem; margin: 0 0 4px; }
    .rw-desc { color: #4a4f5a; font-size: 0.85rem; margin: 0 0 10px; }
    .rw-foot { display: flex; align-items: center; justify-content: space-between; }
    .rw-cost { color: var(--arpe-red); font-weight: 800; font-size: 1.1rem; }
    .rw-btn {
      border: 0; border-radius: 999px; padding: 8px 16px;
      font-weight: 600; font-size: 0.85rem;
      background: #d5d8e0; color: #6b7180;
    }
    .rw-btn.enabled { background: var(--arpe-blue); color: #fff; }
  `],
})
export class RewardsPage {
  private api = inject(ApiService);
  private loader = inject(LoaderService);

  rewards = signal<Reward[]>([]);
  points = signal<PointsSummary | null>(null);
  loaded = signal<boolean>(false);

  userPoints = computed(() => this.points()?.points ?? 0);

  async ionViewWillEnter() {
    const [rw, pts] = await Promise.all([
      this.api.post<Reward[]>('get_rewards.php'),
      this.api.post<PointsSummary>('get_points.php'),
    ]);
    if (!rw.error) this.rewards.set(rw.data);
    if (!pts.error) this.points.set(pts.data);
    this.loaded.set(true);
  }

  canAfford(r: Reward): boolean {
    return this.userPoints() >= r.points;
  }

  missing(r: Reward): number {
    return Math.max(0, r.points - this.userPoints());
  }

  redeem(r: Reward) {
    if (!this.canAfford(r)) {
      return;
    }
    // El canje aún no está implementado (siguiente etapa).
    this.loader.toast('¡Pronto podrás canjear tus premios!', 'medium');
  }
}
