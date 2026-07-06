import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { AuthService } from '../../../core/services/auth.service';
import { LoaderService } from '../../../core/services/loader.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private auth = inject(AuthService);
  private loader = inject(LoaderService);
  private router = inject(Router);

  name = '';
  lastname = '';
  secondLastname = '';
  birthdate = '';
  password = '';
  showPassword = false;
  accepted = false;

  get isValid(): boolean {
    const dateOk = /^\d{2}\/\d{2}\/\d{4}$/.test(this.birthdate);
    return (
      this.name.trim().length > 0 &&
      this.lastname.trim().length > 0 &&
      dateOk &&
      this.password.length >= 6 &&
      this.accepted
    );
  }

  onBirthdateInput(value: string) {
    const d = value.replace(/\D/g, '').slice(0, 8);
    let out = d;
    if (d.length > 4) {
      out = `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
    } else if (d.length > 2) {
      out = `${d.slice(0, 2)}/${d.slice(2)}`;
    }
    this.birthdate = out;
  }

  async submit() {
    if (!this.isValid) {
      this.loader.toast('Completa los campos requeridos y acepta el aviso', 'danger');
      return;
    }
    await this.loader.present('Creando tu cuenta...');
    try {
      await this.auth.register({
        name: this.name.trim(),
        lastname: this.lastname.trim(),
        secondLastname: this.secondLastname.trim(),
        birthdate: this.birthdate,
        password: this.password,
      });
      await this.loader.dismiss();
      this.router.navigateByUrl('/tabs/home', { replaceUrl: true });
    } catch (e) {
      await this.loader.dismiss();
      this.loader.toast((e as Error).message || 'No se pudo completar el registro', 'danger');
    }
  }
}
