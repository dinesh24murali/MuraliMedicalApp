import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MdDialogRef } from '@angular/material';

@Component({
    selector: 'addNewProductDialog',
    templateUrl: './../Views/addNewProductDialog-Template.html'
  })
  export class AddNewProductDialog {
  
    name = new FormControl('', [Validators.required]);
    manufacturer = new FormControl('', [Validators.required]);
    type: boolean = false;
    tax_percent = new FormControl('', [Validators.required]);
    BatchNo = new FormControl('', [Validators.required]);
    Exp_date = new FormControl('', [Validators.required, Validators.pattern(/^([0-9]{2})\/([0-9]{4})$/)]);
    mrp = new FormControl('', [Validators.required]);
    P_rate = new FormControl('', [Validators.required]);
  
    constructor(public dialogRef: MdDialogRef<AddNewProductDialog>) {
  
    }
  }