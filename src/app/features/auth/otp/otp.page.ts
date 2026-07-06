import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-otp',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit, AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private loader = inject(LoaderService);
  private router = inject(Router);

  @ViewChild('hiddenInput') hiddenInput!: ElementRef<HTMLInputElement>;

  readonly slots = [0, 1, 2, 3];
  code = '';
  focused = false;
  countdown = 59;
  private timer?: ReturnType<typeof setInterval>;

  get isComplete(): boolean {
    return this.code.length === 4;
  }

  digitAt(index: number): string {
    return this.code[index] ?? '';
  }

  ngOnInit() {
    this.startCountdown();
  }

  ngAfterViewInit() {
    // Enfoca el input para abrir el teclado al entrar.
    setTimeout(() => this.focusInput(), 300);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  private startCountdown() {
    clearInterval(this.timer);
    this.countdown = 59;
    this.timer = setInterval(() => {
      if (this.countdown > 0) {
        this.countdown--;
      } else {
        clearInterval(this.timer);
      }
    }, 1000);
  }

  focusInput() {
    this.hiddenInput?.nativeElement.focus();
  }

  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    // Un único input maneja todo: solo dígitos, máximo 4.
    this.code = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = this.code;
  }

  async resend() {
    if (this.countdown > 0) {
      return;
    }
    this.startCountdown();
    this.loader.toast('Código reenviado');
  }

  async continue() {
    if (!this.isComplete) {
      return;
    }
    await this.loader.present('Verificando...');
    try {
      const { isNew } = await this.auth.verifyOtp(this.code);
      await this.loader.dismiss();
      this.router.navigateByUrl(isNew ? '/auth/register' : '/tabs/home', { replaceUrl: true });
    } catch (e) {
      await this.loader.dismiss();
      this.loader.toast((e as Error).message || 'Código incorrecto', 'danger');
    }
  }
}
