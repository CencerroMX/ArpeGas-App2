import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { BrandHeaderComponent } from '../../../shared/components/brand-header.component';
import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { PointsSummary, TIERS, WeeklyStreak } from '../../../core/models/rewards.model';

interface FeatureCard {
  title: string;
  emoji: string;
  img?: string;  // ilustración real (si existe)
  route: string;
  path?: string; // ruta real si la sección ya existe
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonContent, BrandHeaderComponent],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);

  tiers = TIERS;
  streakDays = Array.from({ length: 7 }, (_, i) => i + 1);

  points = signal<PointsSummary | null>(null);
  streak = signal<WeeklyStreak | null>(null);

  fullName = computed(() => {
    const u = this.auth.user();
    return u ? `${u.name} ${u.lastname}`.trim() : '';
  });

  features: FeatureCard[] = [
    { title: 'Ruleta Semanal', emoji: '🛡️', img: 'assets/illustrations/shield.png', route: 'Ruleta Semanal', path: '/ruleta' },
    { title: 'Reclama tus premios', emoji: '🏆', img: 'assets/illustrations/cup.png', route: 'Reclama tus premios', path: '/premios' },
    { title: 'Historial de Compras', emoji: '🎖️', img: 'assets/illustrations/laurel.png', route: 'Historial de Compras' },
    { title: 'Sucursales', emoji: '📍', route: 'Sucursales' },
  ];

  // ionViewWillEnter se dispara cada vez que se entra a la pestaña Inicio,
  // así los puntos se refrescan al volver de escanear un ticket.
  async ionViewWillEnter() {
    const [pts, stk] = await Promise.all([
      this.api.post<PointsSummary>('get_points.php'),
      this.api.post<WeeklyStreak>('get_streak.php'),
    ]);
    if (!pts.error) this.points.set(pts.data);
    if (!stk.error) this.streak.set(stk.data);
  }

  progressPercent(): number {
    const p = this.points();
    if (!p) return 0;
    const total = p.points + p.pointsToNextTier;
    return total > 0 ? Math.min(100, Math.round((p.points / total) * 100)) : 0;
  }

  openFeature(card: FeatureCard) {
    if (card.path) {
      this.router.navigateByUrl(card.path);
      return;
    }
    this.router.navigate(['/coming-soon'], { queryParams: { title: card.route } });
  }

  goToScanner() {
    this.router.navigateByUrl('/tabs/ticket');
  }
}
