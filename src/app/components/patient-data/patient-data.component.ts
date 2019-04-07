import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ElectronService } from '../../providers/electron.service';
import { Web3Service } from '../../providers/web3.service';
import { MatSnackBar, MatDialog } from '@angular/material';
import { ModalComponent } from '../modal/modal.component';

declare let require: any;

const doctor_board_artifacts = require('./../../../../build/contracts/DoctorBoard.json');

@Component({
  selector: 'app-patient-data',
  templateUrl: './patient-data.component.html',
  styleUrls: ['./patient-data.component.css']
})
export class PatientDataComponent implements OnInit {
  tokenUrl: any;
  token: any;
  encryptedCapsule: any;
  patientData: any;
  rekey: any;
  resForRekey: any;
  tokenReKey: any;
  DoctorBoard: any;
  animal: string;
  name: string;
  docBoard: any;
  reencryptedData: any;
  doctorPublic: any;
  responseHexData: any;
  
  constructor(private dialog: MatDialog, private matSnackBar: MatSnackBar,
     private http: HttpClient, private electronService: ElectronService, private web3Service: Web3Service) { }

  ngOnInit() {
    this.web3Service.artifactsToContract(doctor_board_artifacts)
      .then((DoctorBoardAbstraction) => {
        this.DoctorBoard = DoctorBoardAbstraction;
        this.DoctorBoard.deployed().then(deployed => {
          console.log(deployed);
          this.docBoard = deployed;
         /*  deployed.Transfer({}, (err, ev) => {
            console.log('Transfer event came in, refreshing balance');
          }); */
        });

      });
  }

 

  recivePatienData() {
    this.encryptedCapsule = "encryptedCapsule";
    console.log('this.token :', this.encryptedCapsule);
  }

  encryptedPatientData() {
    this.patientData = "encryptedPatientData";
    console.log('this.token  :', this.patientData);
  }

  getCapsuleFromServer() {
    return this.http.post<any>(
      'https://nuserver.appspot.com/generate_key_pair', {})
      .subscribe((data: any) => {
        this.encryptedCapsule = data.encrypted_result;
        this.sendToPythonEncrypdedCapsule('@@@Public Key ');
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
    // console.log('container :', container);
    let newStr = container.replace(/[(')\s[\]]/g, '');
    // console.log('newStr :', newStr);
    const keys = newStr.split(',');
    // console.log('keys:', keys);
    /*  newStr = newStr.substring(0, newStr.length - 1);
    newStr = container.replace(/[']/g, '"'); */
    return JSON.parse(newStr);
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
    this.electronService.ipcRenderer.send('get-keys-for-rekey', 'encCapsule.py');
    this.electronService.ipcRenderer.on('response-keys', (event, arg) => {
      this.resForRekey = arg;
      this.responseHexData = JSON.stringify(this.parseResponse(arg));
      // console.log('responseHexData:', this.responseHexData);
      //const publicKeysForCapcule = this.fillKeys(this.parseResponse(this.resForRekey));
    // console.log("@@@@@@", this.responseHexData);
      return this.http.post<any>(
        'https://nuserver.appspot.com/re-capsule', this.parseResponse(arg))
        .subscribe((data: any) => {
          this.tokenReKey = data.capsule; // only token access
          console.log('this.tokenReKey :', this.tokenReKey);
          const args = ['doctorDecrypt.py', this.tokenReKey];
          this.electronService.ipcRenderer.send('send-re-capsule', args);
          //  send token to smartContract
        });
    });
    this.electronService.ipcRenderer.on('response-capsule', (event, capsuleResponse) => {
      console.log('capsuleResponse :', capsuleResponse);
      this.setStatus(capsuleResponse);
    });
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 3000 });
  }

  async checkToken() {
    const hashToken = await this.docBoard.checkTokenPatient({from: this.web3Service.getAccount(0)});
    console.dir(hashToken);
    this.token = hashToken.logs['0'].args._urlToken;
    return this.http.get<any>(
      `https://nuserver.appspot.com/capsule/${this.token}`)
      .subscribe((data: any) => {
        this.reencryptedData = data;
        console.log('this.reencryptedData :', this.reencryptedData);
        //  send token to python reencrypted data urlFile, capsule
      })
  }

  getDoctorKey() {
    this.electronService.ipcRenderer.send('get-keys-for-rekey', 'doctorPublicKey.py');
    this.electronService.ipcRenderer.on('response-keys', (event, arg) => {
    this.doctorPublic = arg;
    });
  }

  async getToken() {
    // const docBoard = await this.DoctorBoard.deployed();
    //console.log('row.html_url :',   row.html_url);
    const token = 'TOKEN123456789';
    const url32 = this.web3Service.stringToBytes32(token);
    console.log('url32', url32);
    const pastLengthUrl = (url32.length < 66)? 66 - url32.length : 0;
    console.log('pastLengthUrl :', pastLengthUrl);
    const url321 = url32 + '0'.repeat(pastLengthUrl);
    console.log('url321 ', url321.length, url321);
    try {
      const transaction = await this.docBoard.toBytes32(token);
      console.log('transaction:', transaction);
      const transaction1 = await this.docBoard.checkHashOrder(url321);
      console.log('transaction1:', transaction1);
      const deshif32 = this.web3Service.bytes32ToString(transaction1);
      console.log('deshif32:', deshif32);
      const logOrder = await this.docBoard.setTokenPatient(this.web3Service.getAccount(0), token, {from: this.web3Service.getAccount(0)});
      console.log('logOrder :', logOrder);
      this.tokenUrl = logOrder.logs['0'].args._urlToken;
      console.log('this.tokenUrl :', this.tokenUrl);
      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending; see log.');
    }
    
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '250px',
      data: { name: this.name, animal: this.animal }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
}

