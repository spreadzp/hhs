import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-recomendations',
  templateUrl: './recomendations.component.html',
  styleUrls: ['./recomendations.component.css']
})
export class RecomendationsComponent implements OnInit {
  encryptedCapsule: any;
  rekey: any;
  resForRekey: any;
  tokenReKey: any;
  constructor(private http: HttpClient, private electronService: ElectronService) { }

  ngOnInit() {
  }

  getCapsuleFromServer() {
    return this.http.post<any>(
      'https://nuserver.appspot.com/generate_key_pair', {})
      .subscribe((data: any) => {
        this.encryptedCapsule = data.encrypted_result;
        this.sendToPythonEncrypdedCapsule('@@@Public Key');
      })
  }

  sendToPythonEncrypdedCapsule(capsule: string) {
    this.electronService.ipcRenderer.send('asynchronous-message', capsule);
    this.electronService.ipcRenderer.on('asynchronous-reply', (event, arg) => {
      this.rekey = arg;
      // console.log('this.rekey :', this.rekey);
    })
  }

  parseResponse(response: string[]) {
    let container = '';
    let flagCurve = false;
    for (let i = 0; i < response.length; i++) {
      if (response[i].includes('(')) {
        flagCurve = true;
      }
      if (flagCurve) {
        container += response[i];
      }

    }
    console.log('container :', container);
    let newStr = container.replace(/[(')\s[\]]/g, '');
    console.log('newStr :', newStr);
    const keys = newStr.split(',');
    console.log('keys:', keys);
    /* newStr = newStr.substring(0, newStr.length - 1);
    newStr = container.replace(/[']/g, '"'); */
    return keys;
  }

  fillKeys(umbralKeys: string[]) {
    const keys = {
      "delegating": umbralKeys[0],
      "receiving": umbralKeys[1],
      "verifying": umbralKeys[2]
    }
    return keys;
  }

  getTokenReKey() {
    this.electronService.ipcRenderer.send('get-keys-for-rekey', 'keysForCapsule.py');
    this.electronService.ipcRenderer.on('response-keys', (event, arg) => {
      this.resForRekey = arg;
      // const publicKeysForCapcule = this.fillKeys(this.parseResponse(this.resForRekey));
    console.log(arg);
      return this.http.post<any>(
        'https://nuserver.appspot.com/token-re-key', {"publicKeysForCapcule": ""})
        .subscribe((data: any) => {
          this.tokenReKey = data;
          console.log('this.tokenReKey :', this.tokenReKey);
          // send token to smartContract
        })
    })
  }
}
