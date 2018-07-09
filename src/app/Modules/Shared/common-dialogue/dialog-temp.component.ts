import { Component, EventEmitter} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'dialog-result-example-dialog',
  templateUrl: './dialog-template.html'
})
export class DialogTempComponent {
  public title:string;
  public message: string;
  public onButtonClick = new EventEmitter();
  public hideCancel: Boolean = false;

  constructor(public dialogRef: MatDialogRef<DialogTempComponent>) {
  }

  buttonClick(value: Boolean){
    this.onButtonClick.emit(value);
    this.dialogRef.close();
  }
}