import { Routes } from '@angular/router';
import { onboardingGuard } from './core/guards/onboarding.guard';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'splash',
    loadComponent: () =>
      import('./features/splash/splash.page').then((m) => m.SplashPage),
  },
  {
    path: 'auth',
    canActivate: [onboardingGuard],
    children: [
      {
        path: 'phone',
        loadComponent: () =>
          import('./features/auth/phone/phone.page').then((m) => m.PhonePage),
      },
      {
        path: 'otp',
        loadComponent: () =>
          import('./features/auth/otp/otp.page').then((m) => m.OtpPage),
      },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.page').then((m) => m.LoginPage),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register/register.page').then((m) => m.RegisterPage),
      },
      { path: '', redirectTo: 'phone', pathMatch: 'full' },
    ],
  },
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('./features/tabs/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'ticket',
        loadComponent: () =>
          import('./features/tabs/ticket/ticket.page').then((m) => m.TicketPage),
      },
      {
        path: 'para-ti',
        loadComponent: () =>
          import('./features/misc/coming-soon.page').then((m) => m.ComingSoonPage),
        data: { title: 'Para ti' },
      },
      {
        path: 'premios',
        loadComponent: () =>
          import('./features/rewards/rewards.page').then((m) => m.RewardsPage),
        data: { title: 'Premios' },
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/tabs/profile/profile.page').then((m) => m.ProfilePage),
      },
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },
  {
    path: 'coming-soon',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/misc/coming-soon.page').then((m) => m.ComingSoonPage),
  },
  {
    path: 'qr-tool',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dev/qr-tool.page').then((m) => m.QrToolPage),
  },
  {
    path: 'premios',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/rewards/rewards.page').then((m) => m.RewardsPage),
  },
  {
    path: 'ruleta',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/roulette/roulette.page').then((m) => m.RoulettePage),
  },
  { path: '', redirectTo: 'splash', pathMatch: 'full' },
  { path: '**', redirectTo: 'splash' },
];
