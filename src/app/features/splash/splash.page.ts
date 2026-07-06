import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-splash',
  standalone: true,
  imports: [IonContent],
  template: `
    <ion-content [fullscreen]="true" class="splash-content" [scrollY]="false">
      <div class="splash-wrap">
        <img class="logo" src="assets/logo/arpe-logo-white.png" alt="ARPE Gas" />
      </div>
    </ion-content>
  `,
  styles: [`
    .splash-content {
      --background: linear-gradient(180deg, var(--arpe-blue-deep) 0%, var(--arpe-blue-deep-2) 100%);
    }
    .splash-wrap {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .logo {
      width: 62%;
      max-width: 260px;
      animation: fadeInUp 700ms ease-out;
    }
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  `],
})
export class SplashPage implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);

  async ngOnInit() {
    await new Promise((r) => setTimeout(r, 1800));
    const target = this.auth.isLoggedIn() ? '/tabs/home' : '/auth/phone';
    this.router.navigateByUrl(target, { replaceUrl: true });
  }
}
