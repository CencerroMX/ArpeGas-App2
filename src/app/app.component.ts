import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
  constructor() {
    this.initStatusBar();
  }

  private async initStatusBar() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }
    try {
      await StatusBar.setStyle({ style: Style.Light });
    } catch {
      // no-op en plataformas sin barra de estado
    }
  }
}
