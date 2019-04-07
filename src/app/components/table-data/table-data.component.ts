import { HttpClient } from '@angular/common/http';
import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { merge, Observable, of as observableOf } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ModalComponent } from '../modal/modal.component';
import { Web3Service } from '../../providers/web3.service';
import { ElectronService } from '../../providers/electron.service';

declare let require: any;

const doctor_board_artifacts = require('./../../../../build/contracts/DoctorBoard.json');
/**
 * @title Table retrieving data through HTTP
 */
@Component({
  selector: 'app-table-data',
  templateUrl: './table-data.component.html',
  styleUrls: ['./table-data.component.css']
})
export class TableDataComponent implements AfterViewInit {
  displayedColumns: string[] = ['created', 'state', 'number', 'title'];
  exampleDatabase: ExampleHttpDatabase | null;
  data: DoctorIssue[] = [];

  resultsLength = 0;
  isLoadingResults = true;
  isRateLimitReached = false;
  animal: string;
  name: string;
  DoctorBoard: any;



  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private http: HttpClient, public dialog: MatDialog,
    private matSnackBar: MatSnackBar, private web3Service: Web3Service, private electronService: ElectronService) { }

  ngAfterViewInit() {
    if (this.electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
      console.log(this.electronService.ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong"

      this.electronService.ipcRenderer.on('asynchronous-reply', (event, arg) => {
        console.log(arg) // prints "pong"
      })
      this.electronService.ipcRenderer.send('asynchronous-message', 'ping')
    } else {
      console.log('Mode web');
    }
    this.exampleDatabase = new ExampleHttpDatabase(this.http);
    this.web3Service.artifactsToContract(doctor_board_artifacts)
      .then((DoctorBoardAbstraction) => {
        this.DoctorBoard = DoctorBoardAbstraction;
        this.DoctorBoard.deployed().then(deployed => {
          console.log(deployed);
          /*  deployed.Transfer({}, (err, ev) => {
             console.log('Transfer event came in, refreshing balance');
           }); */
        });

      });
    // If the user changes the sort order, reset back to the first page.
    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoadingResults = true;
          return this.exampleDatabase!.getRepoIssues(
            this.sort.active, this.sort.direction, this.paginator.pageIndex);
        }),
        map((data: any) => {
          // Flip flag to show that loading has finished.
          console.log('data  :', data);
          this.isLoadingResults = false;
          this.isRateLimitReached = false;
          this.resultsLength = data.total_count;

          return data.items;
        }),
        catchError(() => {
          this.isLoadingResults = false;
          // Catch if the GitHub API has reached its rate limit. Return empty data.
          this.isRateLimitReached = true;
          return observableOf([]);
        })
      ).subscribe(data => this.data = data);
  }

  setStatus(status) {
    this.matSnackBar.open(status, null, { duration: 3000 });
  }

  async selectRow(row) {
    const docBoard = await this.DoctorBoard.deployed();
    const token = 'TOKEN123456789';
    const url32 = this.web3Service.stringToBytes32(token);
    const pastLengthUrl = (url32.length < 66) ? 66 - url32.length : 0;
    const url321 = url32 + '0'.repeat(pastLengthUrl);
    try {
      const transaction = await docBoard.toBytes32(token);
      const transaction1 = await docBoard.checkHashOrder(url321);
      const deshif32 = this.web3Service.bytes32ToString(transaction1);
      // const logOrder = await docBoard.checkOrder(token, {from: this.web3Service.getAccount(0)});
      //console.log('logOrder :', logOrder);
      //console.log('.logsargs._urlFile :', logOrder.logs['0'].args._urlFile);
      if (!transaction) {
        this.setStatus('Transaction failed!');
      } else {
        this.setStatus('Transaction complete!');
      }
    } catch (e) {
      console.log(e);
      this.setStatus('Error sending; see log.');
    }
    console.log(row.html_url);
    const dialogRef = this.dialog.open(ModalComponent, {
      width: '250px',
      data: { name: token, animal: row.title }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });
  }
}

export interface DoctorApi {
  items: DoctorIssue[];
  total_count: number;
}

export interface DoctorIssue {
  created_at: string;
  number: string;
  state: string;
  title: string;
}

/** An example database that the data source uses to retrieve data for the table. */
export class ExampleHttpDatabase {
  constructor(private http: HttpClient) { }

  getRepoIssues(sort: string, order: string, page: number): Observable<DoctorApi> {
    const requestUrl = 'https://nuserver.appspot.com/doctors-board';

    return this.http.get<DoctorApi>(requestUrl);
  }
}

