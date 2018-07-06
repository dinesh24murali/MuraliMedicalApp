import { OnInit, Component, EventEmitter } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatDialogRef, MatSnackBar } from '@angular/material';
import { GlobalConstants } from '../../../core/GlobalConstants/GlobalConstants';

@Component({
  selector: 'addNewProductDialog',
  templateUrl: './../Views/addNewProductDialog-Template.html'
})
export class AddNewProductDialog implements OnInit {

  newProductForm: FormGroup;
  public onSave = new EventEmitter();

  constructor(
    public dialogRef: MatDialogRef<AddNewProductDialog>,
    private formBuilder: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    // building the form controls
    this.newProductForm = this.formBuilder.group({
      name        : ['', [Validators.required]],
      manufacturer: ['', [Validators.required]],
      type        : false,
      tax_percent : ['', [Validators.required]],
      BatchNo     : ['', [Validators.required]],
      Exp_date    : ['', [Validators.required, Validators.pattern(GlobalConstants.expiryDatePattern)]],
      mrp         : ['', [Validators.required]],
      P_rate      : ['', [Validators.required]],
    });
  }

  onSaveClick() {
    const formCtrls = this.newProductForm.controls;
    // check for validation errors
    if (!this.newProductForm.valid || formCtrls.name.value.trim() === '' || formCtrls.manufacturer.value.trim() === '' ||
      formCtrls.BatchNo.value.trim() === '') {
      this.snackBar.open('Fill all required fields', 'ok', {
        duration: 4000
      });
      // set validation error for controls
      Object.keys(formCtrls).forEach(field => {
        const control = this.newProductForm.get(field);
        control.markAsTouched({ onlySelf: true });
      });
      return;
    }
    // prepare new product object
    const newProduct = {
      Pid: "",
      Pname: formCtrls.name.value,
      manufacturer: formCtrls.manufacturer.value,
      type: formCtrls.type.value,
      tax_percent: formCtrls.tax_percent.value,
      BatchNo: formCtrls.BatchNo.value,
      Batches: [],
      Exp_date: formCtrls.Exp_date.value,
      qty: 0,
      pack: 0,
      stock: 0,
      mrp: formCtrls.mrp.value,
      newBatchFlag: true,
      P_rate: formCtrls.P_rate.value
    };
    // emit the new product
    this.onSave.emit(newProduct);
    this.dialogRef.close();
  }
}