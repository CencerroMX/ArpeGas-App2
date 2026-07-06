import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonBadge } from '@ionic/angular/standalone';

/**
 * Header azul de la app: campana de notificaciones (con badge) + marca ARPE.
 */
@Component({
  selector: 'app-brand-header',
  standalone: true,
  imports: [CommonModule, IonHeader, IonToolbar, IonBadge],
  template: `
    <ion-header class="brand-header" [translucent]="false">
      <ion-toolbar class="brand-toolbar">
        <div class="bar">
          <button class="bell" type="button" (click)="notifications.emit()">
            <img src="assets/icons/notificaciones-white.svg" alt="Notificaciones" width="26" height="26" />
            <ion-badge *ngIf="badge > 0" class="bell-badge">{{ badge }}</ion-badge>
          </button>
          <img class="mark" src="assets/logo/arpe-logo-white.png" alt="ARPE" />
          <span class="spacer"></span>
        </div>
      </ion-toolbar>
    </ion-header>
  `,
  styles: [`
    .brand-header::after { display: none; }
    .brand-toolbar {
      --background: var(--arpe-blue-deep);
      --border-width: 0;
      padding-top: var(--ion-safe-area-top, 0);
    }
    .bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 18px 10px;
    }
    .bell {
      position: relative;
      background: transparent;
      border: 0;
      padding: 0;
    }
    .bell-badge {
      position: absolute;
      top: -6px;
      right: -8px;
      --background: var(--arpe-red);
      --color: #fff;
      border-radius: 999px;
      font-size: 11px;
    }
    .mark { height: 40px; }
    .spacer { width: 26px; }
  `],
})
export class BrandHeaderComponent {
  @Input() badge = 0;
  @Output() notifications = new EventEmitter<void>();
}
