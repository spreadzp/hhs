import { Component } from '@angular/core';
import { ElectronService } from './providers/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public electronService: ElectronService,
    private translate: TranslateService) {

    translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
      console.log(electronService.ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

      /* electronService.ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
      })
      electronService.ipcRenderer.send('asynchronous-message', 'ping') */
    } else {
      console.log('Mode web');
    }
  }
}
