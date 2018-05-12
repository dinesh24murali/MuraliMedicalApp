import { Component } from '@angular/core';
import { MdDialogRef} from '@angular/material';

@Component({
    selector: 'ShowExceptionDialog',
    template: `<strong md-dialog-title>{{title}}</strong>
    <div md-dialog-content>{{message}}</div>
    <div md-dialog-actions>
      <button md-button md-dialog-close="OK">OK</button>
    </div>`
  })
  export class ExceptionDialog {
  
    public title: string;
    public message: string;
  
    constructor(public dialogRef: MdDialogRef<ExceptionDialog>) {
  
    }
  }