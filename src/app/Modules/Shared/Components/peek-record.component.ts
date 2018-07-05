import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatSidenav } from '@angular/material';

@Component({
    selector: 'peek-record',
    templateUrl: './../Views/peek-record.component.html',
    styles: [`
    .viewRecord{
      padding: 20px 20px 20px 20px;
    }
    .view-container{
      width:1000px;
    }
    md-sidenav-container {
      position: fixed;
      height: 100%;
      min-height: 100%;
      width: 100%;
      min-width: 80%;
   }
    `]
})
export class PeekRecord {

    @Input() public billId: string = '';
    @Input() public billNo: string = '';
    @Input() public billDate: string = '';
    @Input() public supplier: string = undefined;
    @Input() public customer: string = undefined;
    @Input() public billAmt: string = '';
    @Input() public rows: any = [];

    @Output() public deleteRecordEvent = new EventEmitter<string>();
    @Output() public editRecordEvent = new EventEmitter<string>();

    constructor() { }

    editRecord() {
        this.editRecordEvent.emit(this.billId);
    }

    deleteRecord() {
        this.deleteRecordEvent.emit(this.billId);
    }
}    