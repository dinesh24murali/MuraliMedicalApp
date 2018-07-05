import { Component } from '@angular/core';
import { MatDialogRef} from '@angular/material';

@Component({
    selector: 'ShowExceptionDialog',
    template: `<strong mat-dialog-title>{{title}}</strong>
    <div mat-dialog-content>{{message}}</div>
    <div mat-dialog-actions>
      <button mat-button mat-dialog-close="OK">OK</button>
    </div>`
  })
  export class ExceptionDialog {
  
    public title: string;
    public message: string;
  
    constructor(public dialogRef: MatDialogRef<ExceptionDialog>) {
  
    }
  }