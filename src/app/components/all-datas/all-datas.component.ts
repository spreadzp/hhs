import { Component, OnInit } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-all-datas',
  templateUrl: './all-datas.component.html',
  styleUrls: ['./all-datas.component.css']
})
export class AllDatasComponent implements OnInit {
  pyKey: string;
  constructor(public electronService: ElectronService) { }

  ngOnInit() {
    console.log(this.electronService.ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

    this.electronService.ipcRenderer.on('asynchronous-reply', (event, arg) => {
      console.log(arg) // prints "pong"
      this.pyKey = arg;
    })
    this.electronService.ipcRenderer.send('asynchronous-message', 'ping')
  }

}
