import { Injectable, inject } from '@angular/core';
import { LoadingController, ToastController } from '@ionic/angular/standalone';

@Injectable({ providedIn: 'root' })
export class LoaderService {
  private loadingController = inject(LoadingController);
  private toastController = inject(ToastController);
  private loading?: HTMLIonLoadingElement;

  async present(message = 'Cargando...'): Promise<void> {
    this.loading = await this.loadingController.create({ message, spinner: 'crescent' });
    await this.loading.present();
  }

  async dismiss(): Promise<void> {
    if (this.loading) {
      await this.loading.dismiss();
      this.loading = undefined;
    }
  }

  async toast(message: string, color: 'success' | 'danger' | 'medium' = 'medium'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2500,
      position: 'bottom',
      color,
    });
    await toast.present();
  }
}
