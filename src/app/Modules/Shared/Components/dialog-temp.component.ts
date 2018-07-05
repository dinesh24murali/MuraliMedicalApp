import { Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'dialog-result-example-dialog',
  templateUrl: './../Views/dialog-template.html'
})
export class DialogTempComponent {
  public title:string;
  public message: string;

  constructor(public dialogRef: MatDialogRef<DialogTempComponent>) {
  }
}