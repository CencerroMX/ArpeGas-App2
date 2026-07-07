import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { StorageService } from './storage.service';
import { OtpChannel, User } from '../models/user.model';

const TOKEN_KEY = 'arpe_token';
const USER_KEY = 'arpe_user';
const PENDING_PHONE_KEY = 'arpe_pending_phone';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private storage = inject(StorageService);

  private _user = signal<User | null>(null);
  private _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());

  /** Carga la sesión persistida al iniciar la app. */
  async loadSession(): Promise<void> {
    const token = await this.storage.get<string>(TOKEN_KEY);
    const user = await this.storage.get<User>(USER_KEY);
    this._token.set(token);
    this._user.set(user);
  }

  /**
   * Envía el código OTP por el canal elegido.
   * Devuelve devCode si el backend está en modo dev (para mostrarlo y poder probar).
   */
  async requestOtp(phone: string, channel: OtpChannel): Promise<{ devCode?: string }> {
    await this.storage.set(PENDING_PHONE_KEY, phone);
    const res = await this.api.post<{ sent: boolean; channel: string; dev_code?: string }>(
      'request_otp.php',
      { phone, channel },
    );
    if (res.error) {
      throw new Error(res.message);
    }
    return { devCode: res.data?.dev_code };
  }

  /** Teléfono capturado en la pantalla de inicio (para login/registro). */
  async getPendingPhone(): Promise<string> {
    return (await this.storage.get<string>(PENDING_PHONE_KEY)) ?? '';
  }

  /** Guarda el teléfono e indica si ya existe una cuenta (con contraseña). */
  async checkPhone(phone: string): Promise<boolean> {
    await this.storage.set(PENDING_PHONE_KEY, phone);
    const res = await this.api.post<{ exists: boolean }>('check_phone.php', { phone });
    if (res.error) {
      throw new Error(res.message);
    }
    return res.data.exists;
  }

  /** Login de usuarios existentes con teléfono + contraseña (sin OTP). */
  async loginPassword(password: string): Promise<void> {
    const phone = (await this.storage.get<string>(PENDING_PHONE_KEY)) ?? '';
    const res = await this.api.post<{ token: string; user: User }>('login_password.php', {
      phone,
      password,
    });
    if (res.error) {
      throw new Error(res.message);
    }
    await this.persist(res.data.token, res.data.user);
  }

  /**
   * Verifica el código. Devuelve isNew=true si el teléfono no tenía cuenta
   * (hay que completar el registro) o false si ya existe (login directo).
   */
  async verifyOtp(code: string): Promise<{ isNew: boolean }> {
    const phone = (await this.storage.get<string>(PENDING_PHONE_KEY)) ?? '';
    const res = await this.api.post<{ token: string; user: User | null; is_new: boolean }>(
      'verify_otp.php',
      { phone, code },
    );
    if (res.error) {
      throw new Error(res.message);
    }
    if (res.data.is_new) {
      // Aún NO hay sesión: el usuario y el token se crean al completar el registro.
      return { isNew: true };
    }
    await this.persist(res.data.token, res.data.user);
    return { isNew: false };
  }

  /** Completa el registro con los datos personales y la contraseña. */
  async register(data: Omit<User, 'phone'> & { password: string }): Promise<void> {
    const phone = (await this.storage.get<string>(PENDING_PHONE_KEY)) ?? '';
    const res = await this.api.post<{ token: string; user: User }>('register.php', {
      phone,
      name: data.name,
      lastname: data.lastname,
      second_lastname: data.secondLastname ?? '',
      birthdate: data.birthdate ?? '',
      password: data.password,
    });
    if (res.error) {
      throw new Error(res.message);
    }
    await this.persist(res.data.token, res.data.user);
  }

  async logout(): Promise<void> {
    await this.storage.remove(TOKEN_KEY);
    await this.storage.remove(USER_KEY);
    this._token.set(null);
    this._user.set(null);
  }

  private async persist(token: string, user: User | null): Promise<void> {
    this._token.set(token);
    await this.storage.set(TOKEN_KEY, token);
    if (user) {
      this._user.set(user);
      await this.storage.set(USER_KEY, user);
    }
  }
}
