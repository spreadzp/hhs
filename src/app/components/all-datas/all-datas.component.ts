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
  }

}
