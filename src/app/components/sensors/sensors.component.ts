import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-sensors',
  templateUrl: './sensors.component.html',
  styleUrls: ['./sensors.component.css']
})
export class SensorsComponent implements OnInit {
  pyKey: string;
  constructor(public electronService: ElectronService) { }

  ngOnInit() {
    /* console.log(this.electronService.ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

    this.electronService.ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg) // prints "pong"
      this.pyKey = arg;
    }) */
    this.pyKey = '';
    // this.electronService.ipcRenderer.send('asynchronous-message', 'ping')
  }

}
