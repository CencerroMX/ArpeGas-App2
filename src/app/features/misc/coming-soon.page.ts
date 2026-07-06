import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';

/**
 * Pantalla "¡Espéralo pronto!" reutilizada por todas las secciones aún no
 * disponibles. El título llega por route data o query param.
 */
@Component({
  selector: 'app-coming-soon',
  standalone: true,
  imports: [CommonModule, IonContent],
  template: `
    <ion-content class="cs-content" [scrollY]="false">
      <div class="cs-wrap">
        <div class="cs-emoji">🚧</div>
        <h1 class="cs-title">¡Espéralo pronto!</h1>
        <p class="cs-sub" *ngIf="title">{{ title }} estará disponible muy pronto.</p>
        <p class="cs-sub" *ngIf="!title">Estamos trabajando en esta sección.</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .cs-content { --background: var(--arpe-bg); }
    .cs-wrap {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 32px;
    }
    .cs-emoji { font-size: 72px; margin-bottom: 12px; }
    .cs-title { color: var(--arpe-blue); font-weight: 800; font-size: 1.7rem; margin: 0 0 8px; }
    .cs-sub { color: #4a4f5a; font-size: 1rem; margin: 0; max-width: 280px; }
  `],
})
export class ComingSoonPage {
  private route = inject(ActivatedRoute);
  title = this.route.snapshot.data['title'] ?? this.route.snapshot.queryParamMap.get('title') ?? '';
}
