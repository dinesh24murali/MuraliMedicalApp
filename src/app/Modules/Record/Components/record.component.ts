import { Component, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { MdDialogRef, MdDialog, MdDialogConfig, MdSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';

import { ExceptionDialog } from '../../Shared/Components/exception-dialog.component';
import { Item, Sales, SalesData } from '../../../Models/Record/Record';
import { ComponentsService } from '../../../Services/components.service';
import { PurchaseService } from '../../../Services/purchase.service';
import { SalesService } from '../../../Services/sales.service';
import { SupplierService } from '../../../Services/supplier.service';

import { AddNewProductDialog } from '../../Shared/Components/addNewProduct-temp.component';

import { PurchaseHelper } from '../HelperClasses/PurchaseHelper';

@Component({
  selector: 'record',
  templateUrl: './../Views/record.component.html',
  styles: [`
    .record-card{
		  width:80%;
		  margin-left: 10%;
    }
    .main-container{
      position: fixed;
      height: 100%;
      min-height: 100%;
      width: 100%;
      min-width: 80%;
    }
`]
})
export class RecordComponent implements OnInit, OnDestroy {

  @ViewChild('recordTable') recordTable: any;

  salesHelper: SalesHelper;
  purchaseOperations: PurchaseHelper;

  checkedItems: Item[] = [];
  selectAllToggle: any;
  filteredProducts: any;
  filteredSuppliers: any;
  selectedItems: any[] = [];
  title: string;
  private routeSubscribe: any;
  private querySubscribe: any;
  billAmount: number = 0;
  id: any;

  products = new FormControl();
  billNo = new FormControl('', [Validators.required, Validators.maxLength(50)]);
  billDate = new FormControl('', [Validators.required]);
  supplier = new FormControl('', [Validators.required, Validators.maxLength(50)]);
  CustomerName = new FormControl('', [Validators.required, Validators.maxLength(36)]);

  // For Update Operation
  OldSelectedItems: any[] = [];
  AddItems_u: Item[] = [];
  RemoveItems_u: Item[] = [];
  UpdateItems_u: any[] = [];
  billNo_u: string;
  billDate_u: string;
  supplier_u: string;
  customer_u: string;
  billAmount_u: string;
  temp: any[] = [];

  ngOnInit(): void {
    this.id = undefined;
    let scope = this;

    this.querySubscribe = this.route
      .queryParamMap
      .subscribe(params => {
        this.id = params.get('id');
        if (!this.id)
          this.reset();
      });

    this.routeSubscribe = this.route.params.subscribe(params => {
      let scope = this;
      this.title = params['type'];
      if (this.id == undefined)
        this.reset();
      else {
        if (this.title == "Purchase") {
          this.purchaseService.GetPurchaseRecord(this.id, true)
            .then(res => {
              this.billNo.setValue(res.BillNo);
              this.billDate.setValue(res.BillDate);
              this.supplier.setValue(res.Supplier);
              this.billDate_u = res.BillDate;
              this.billNo_u = res.BillNo;
              this.supplier_u = res.Supplier;
              this.billAmount = this.billAmount_u = res.Purchase_amt;
              this.selectedItems = res.Items;
              this.OldSelectedItems = JSON.parse(JSON.stringify(res.Items));

              this.supplierService.GetFilteredSuppliers(res.Supplier)
                .subscribe(res => {
                  return this.filteredSuppliers = res;
                });
            });
        } else
          this.salesService.GetSalesRecord(this.id, true)
            .then(res => {
              this.billNo.setValue(res.BillNo);
              this.billDate.setValue(res.BillDate);
              this.CustomerName.setValue(res.Customer);
              this.billDate_u = res.BillDate;
              this.billNo_u = res.BillNo;
              this.customer_u = res.Customer;
              this.billAmount = res.Sales_amt;
              this.selectedItems = res.Items;
              this.OldSelectedItems = JSON.parse(JSON.stringify(res.Items));
            });
        this.componentsService.GetFilteredProducts(null, this.title)
          .subscribe(res => {
            return this.filteredProducts = res;
          });
      }
    });

    this.products.valueChanges
      .debounceTime(400)
      .subscribe(name => {
        this.componentsService.GetFilteredProducts(name, this.title)
          .subscribe(res => {
            return this.filteredProducts = res;
          });
      });

    this.componentsService.GetFilteredProducts(null, this.title)
      .subscribe(res => {
        return this.filteredProducts = res;
      });

    this.supplierService.GetFilteredSuppliers(null)
      .subscribe(res => {
        return this.filteredSuppliers = res;
      });

    this.supplier.valueChanges
      .debounceTime(400)
      .subscribe(name => {
        this.supplierService.GetFilteredSuppliers(name)
          .subscribe(res => {
            return this.filteredSuppliers = res;
          });
      });
  }

  reset() {
    this.selectedItems = [];
    this.checkedItems = [];
    this.products.reset();
    this.billNo.reset();
    this.billDate.reset();
    this.supplier.reset();
    this.CustomerName.reset();
    this.billAmount = 0;
    this.OldSelectedItems = [];
    this.AddItems_u = [];
    this.RemoveItems_u = [];
    this.UpdateItems_u = [];
    this.billNo_u = "";
    this.billDate_u = "";
    this.supplier_u = "";
  }

  ngOnDestroy() {
    this.routeSubscribe.unsubscribe();
    this.querySubscribe.unsubscribe();
  }

  constructor(
    private _router: Router,
    private route: ActivatedRoute,
    public snackBar: MdSnackBar,
    public dialog: MdDialog,
    private componentsService: ComponentsService,
    private purchaseService: PurchaseService,
    private salesService: SalesService,
    private supplierService: SupplierService
  ) {
    this.salesHelper = new SalesHelper(this.salesService);
    this.purchaseOperations = new PurchaseHelper(this.snackBar, this.dialog);
  }

  fillDetailsPurchase(event: any, row: any) {
    let batch: any = row.Batches.find((item: any) => item.BatchNumber == event);
    if (batch) {
      row.BatchNo = batch.BatchNumber;
      row.Exp_date = batch.Exp_date;
      row.P_rate = batch.P_rate;
      row.stock = batch.stock;
      row.pack = batch.pack;
      row.mrp = batch.mrp;
      row.stock = batch.stock ? batch.stock : undefined;
    }
  }

  fillDetailsSales(event: any, row: any) {
    if (event) {
      let totalStock: number = 0;
      row.Batches.forEach(function (item: any) {
        if (row.BatchNo.indexOf(item.BatchNumber) >= 0)
          totalStock += item.stock;
      });
      row.stock = totalStock;
      row.Batches.forEach(function (item: any) {
        if (row.BatchNo.indexOf(item.BatchNumber) >= 0) {
          item.show = true;
          item.batchQty = item.batchQty && row.qty <= row.stock ? item.batchQty : 0;
          item.batchValue = item.batchValue && row.qty <= row.stock ? item.batchValue : 0;
        } else {
          item.show = false;
        }
      });
      row.toggleVisible = false;

      if (row.qty <= row.stock)
        this.calculateTotal(row);
      else {
        this.billAmount -= row.value;
        row.value = 0;
      }
    } else {
      row.BatchNo = [row.Batches[0].BatchNumber];
      row.Batches[0].show = true;
      row.Batches[0].batchQty = 0;
      row.Batches[0].batchValue = 0;
      row.stock = row.Batches[0].stock;
      row.value = 0;
      row.toggleVisible = false;
    }
  }

  onSelect(selected: any) {

    if (selected.type)
      return;
    this.selectAllToggle = selected.selected.length == this.selectedItems.length;

    this.checkedItems.splice(0, this.checkedItems.length);
    this.checkedItems.push(...selected.selected);
  }

  addProduct(): void {
    let record = this.filteredProducts.find((item: any) => item.Pname == this.products.value), isPresent;
    if (this.title == "Sales")
      isPresent = this.selectedItems.find((item: any) => item.Pname == this.products.value);
    if ((record && this.title == "Purchase") || (record && this.title == "Sales" && !isPresent)) {
      if (this.title == "Sales")
        this.fillDetailsSales(undefined, record);
      else
        record.newBatchFlag = false;

      let item = JSON.stringify(record);
      this.selectedItems.push(JSON.parse(item));
      this.selectedItems = [...this.selectedItems];
      this.products.reset();
    } else if (record && this.title == "Sales" && isPresent) {
      this._openSnackBar("Item already present", "ok");
      this.products.reset();
    }
  }

  removeProduct() {
    let scope = this, removedAmt = 0;
    this.checkedItems.forEach(function (item) {
      removedAmt += (item.P_rate * item.qty);
      let index = scope.selectedItems.indexOf(item);
      scope.selectedItems.splice(index, 1);
    });
    this.checkedItems = [];
    this.billAmount -= removedAmt;
    this.selectAllToggle = false;
  }

  addRecord() {

    // for testing
    // if(true){
    //   let purchase = {"Id":"","BillNo":"SupplierTest","BillDate":"2018-3-6","Supplier":{"name":"SSK","id":""},"Items":"","Purchase_amt":3};
    //   let items = [{"Pid":"P59d63b29125233.10662052","Pname":"Crocin","manufacturer":"Crocin","type":false,"tax_percent":"5.00","BatchNo":"DC45FG","qty":1,"Batches":[{"BatchNumber":"DC45FG","Exp_date":"02/2019","mrp":4,"stock":200,"P_rate":3},{"BatchNumber":"ER-78_erf","Exp_date":"08/2019","mrp":2,"stock":88,"P_rate":1.5},{"BatchNumber":"45DFT","Exp_date":"02/2020","mrp":4.5,"stock":171,"P_rate":3.5},{"BatchNumber":"dfg#$vio","Exp_date":"04/2020","mrp":5,"stock":133,"P_rate":4.5}],"Exp_date":"02/2019","mrp":4,"P_rate":3,"stock":200,"newBatchFlag":false}];
    //   this.purchaseService.AddPurchaseRecord(purchase,items);
    // }

    if (this.id) {
      this._updateRecord();
      return;
    }
    if (this.title == "Purchase") {
      if (this.billNo.valid && this.billDate.valid && this.supplier.valid && this._verifyItems()) {
        let billDate = new Date(this.billDate.value),
          supplierId = this.filteredSuppliers.find((item: any) => item.name == this.supplier.value);
        this.purchaseService.AddPurchaseRecord({ Id: "", BillNo: this.billNo.value, BillDate: billDate.getFullYear() + "-" + (billDate.getMonth() + 1) + "-" + billDate.getDate(), Supplier: supplierId ? supplierId : { name: this.supplier.value, id: "" }, Items: "", Purchase_amt: this.billAmount }, this.selectedItems)
          .then(res => {
            if (!res.Error) {
              this._openSnackBar("Purchase Added", "ok");
              this.selectedItems = [];
              this.checkedItems = [];
              this.products.reset();
              this.billNo.reset();
              this.billDate.reset();
              this.supplier.reset();
              this.CustomerName.reset();
              this.billAmount = 0;
            } else
              this._openExceptionDialog("Purchase not added: " + res.Message);
          });
      } else {
        if (!this.billNo.valid)
          this.billNo.markAsTouched({ onlySelf: true });
        if (!this.billDate.valid)
          this.billDate.markAsTouched({ onlySelf: true });
        if (!this.supplier.valid)
          this.supplier.markAsTouched({ onlySelf: true });
        this._openSnackBar("Fill all Required Fields", "ok");
      }
    } else {
      if (this.billNo.valid && this.billDate.valid && this.CustomerName.valid) {
        let flag = false, msg = "";
        this.selectedItems.forEach(function (item, index) {
          if (flag == true)
            return false;
          if (item.value == 0) {
            flag = true;
            msg = "check values for " + item.Pname;
          }
        });
        if (!flag) {
          let billDate = new Date(this.billDate.value);
          this.salesHelper.AddRecord({ Id: "", BillNo: this.billNo.value, BillDate: billDate.getFullYear() + "-" + (billDate.getMonth() + 1) + "-" + billDate.getDate(), Customer: this.CustomerName.value, Items: "" }, this.selectedItems, this);
        } else
          this._openSnackBar(msg, "ok");
      } else {
        if (!this.billNo.valid)
          this.billNo.markAsTouched({ onlySelf: true });
        if (!this.billDate.valid)
          this.billDate.markAsTouched({ onlySelf: true });
        if (!this.CustomerName.valid)
          this.CustomerName.markAsTouched({ onlySelf: true });
        this._openSnackBar("Fill all Required Fields", "ok");
      }
    }
  }

  _updateRecord() {
    if (this.title == "Purchase") {
      if (this.billNo.valid && this.billDate.valid && this.supplier.valid && this._verifyItems()) {
        let exception: any = this._compareItems(),
          billDate = new Date(this.billDate.value),
          bDate = billDate.getFullYear() + "-" + (billDate.getMonth() + 1) + "-" + billDate.getDate();

        if (exception.exception && exception.exception.message) {
          this._openExceptionDialog(exception.exception.message);
        } else if ((exception.exception && exception.exception == "noChange") || (!exception.exception)) {
          if (this.billNo_u != this.billNo.value || this.billDate_u != bDate || this.supplier_u != this.supplier.value || !exception.exception) {
            let tempSupplier = this.filteredSuppliers.find((item: any) => item.name == this.supplier.value);
            this.purchaseService.UpdatePurchaseRecord({ Id: this.id, BillNo: this.billNo.value, BillDate: bDate, Supplier: tempSupplier ? tempSupplier : { id: "", name: this.supplier.value }, Items: "", Purchase_amt: this.billAmount }, this.selectedItems)
              .then(res => {
                this._openSnackBar(res.error ? "Purchase not updated" : "Purchase updated", "ok");
                this._router.navigate(['/viewRecord/Purchase'], { queryParams: { id: this.id } });
              });
          } else {
            this._router.navigate(['/viewRecord/Purchase'], { queryParams: { id: this.id } });
          }
        }
      } else
        this._openSnackBar("Fill all Required Fields", "ok");
    } else {
      if (this.billNo.valid && this.billDate.valid && this.CustomerName.valid) {
        let flag = false, msg = "";
        this.selectedItems.forEach(function (item, index) {
          if (item.value == 0) {
            flag = true;
            msg = "check values for " + item.Pname;
            return false;
          }
        });
        if (!flag) {
          let billDate = new Date(this.billDate.value);
          this.salesHelper.PrepareItemsForUpdate(this);
          this.salesService.UpdateSalesRecord({ Id: this.id, BillNo: this.billNo.value, BillDate: billDate.getFullYear() + "-" + (billDate.getMonth() + 1) + "-" + billDate.getDate(), Customer: this.CustomerName.value, Items: "" }, this.selectedItems)
            .then(res => {
              this._openSnackBar(res.error ? "Sales not updated" : "Sales updated", "ok");
              this._router.navigate(['/viewRecord/Sales'], { queryParams: { id: this.id } });
            });
        } else
          this._openSnackBar(msg, "ok");
      } else {
        this._openSnackBar("Fill all Required Fields", "ok");
      }
    }
  }
  _verifyItems() {
    let flag = true,
      exp = /^([0-9]{2})\/([0-9]{4})$/;
    this.selectedItems.forEach(function (item, index) {
      if (flag) {
        if (!item.BatchNo || !exp.test(item.Exp_date) || parseInt(item.Exp_date.split('/')[0]) > 12 || !item.manufacturer || item.mrp <= 0 || item.P_rate <= 0 || item.qty <= 0 || item.tax_percent < 0) {
          flag = false;
        }
      } else
        return;
    });
    return flag;
  }

  _compareItems() {
    let scope = this,
      StockException: any = undefined;

    if (JSON.stringify(this.selectedItems) === JSON.stringify(this.OldSelectedItems))
      return { exception: "noChange" };

    this.selectedItems.forEach(function (item, index) {
      if (StockException)
        return false;

      scope.OldSelectedItems.forEach(function (oldItem: any) {
        // checks only of the qty is different for the same Product with same batch number
        if (item.Pid == oldItem.Pid && item.BatchNo == oldItem.BatchNo && (item.qty != oldItem.qty || item.pack != oldItem.pack)) {
          oldItem.noChange = item.noChange = "change";

          if (item.qty < oldItem.qty && (oldItem.stock - ((oldItem.qty - item.qty) * item.pack)) < 0) {
            let msg = "Cannot reduct quantity of " + item.Pname + ": Batch: " + item.BatchNo + ". Stock too low ";
            StockException = { message: msg };
            return false;
          }
          // check if Exp_date or mrp or P_rate or tax percent have been changed but not the qty for the same Product with same batch number
        } else if (item.Pid == oldItem.Pid && item.BatchNo == oldItem.BatchNo && item.qty == oldItem.qty && item.Exp_date == oldItem.Exp_date && item.mrp == oldItem.mrp && item.P_rate == oldItem.P_rate && item.tax_percent == oldItem.tax_percent)
          oldItem.noChange = item.noChange = "noChange";

      });
    });
    // filling the items to be removed after updating the record
    if (!StockException) {
      this.OldSelectedItems.forEach(function (item) {
        if (!item.noChange && ((item.stock - (item.qty * item.pack)) >= 0))
          scope.RemoveItems_u.push(item);
        else if (!item.noChange && ((item.stock - (item.qty * item.pack)) < 0)) {
          let msg = "Cannot remove " + item.Pname + ": Batch: " + item.BatchNo + ". Stock too low";
          StockException = { message: msg };
        }
      });
      this.selectedItems.forEach(function (item) {
        if (!item.noChange)
          scope.AddItems_u.push(item);
      });
    }
    return StockException ? { exception: StockException } : { exception: undefined };
  }
  _openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 4000
    });
  }

  calculateTotal(row: any) {
    let total = 0;
    if (this.title == "Purchase") {
      this.selectedItems.forEach(function (item) {
        if (item.BatchNo)
          total += item.qty * item.P_rate;
      });
      this.billAmount = parseFloat(total.toFixed(2));
    } else {
      let value: number = 0, temp_qty = row.qty;
      this.billAmount -= row.value;
      row.value = 0;
      row.Batches.forEach(function (item: any) {
        item.batchQty = 0;
        item.batchValue = 0;
        if (row.qty <= row.stock && item.show == true && temp_qty > 0) {
          item.batchQty = item.stock <= temp_qty ? item.stock : temp_qty;
          item.batchValue = (item.mrp / item.pack) * item.batchQty;
          item.batchValue = parseFloat(item.batchValue.toFixed(2));
          value += item.batchValue;
          if (item.stock <= temp_qty)
            temp_qty -= item.stock;
          else
            temp_qty = 0;
        }
      });
      row.value = value;
      this.billAmount += row.value;
    }
    this.billAmount = Math.round(this.billAmount * 100) / 100;
  }

  addNewProduct() {
    let config = new MdDialogConfig(), selectedOption,
      dialogRef: MdDialogRef<AddNewProductDialog> = this.dialog.open(AddNewProductDialog, {
        height: '60%',
        width: '60%'
      });
    dialogRef.afterClosed().subscribe(result => {
      let selectedOption = result,
        dialogCtrls = dialogRef.componentInstance;
      if (result == "OK") {
        if (dialogCtrls.name.valid && dialogCtrls.manufacturer.valid && dialogCtrls.tax_percent.valid && dialogCtrls.BatchNo.valid && dialogCtrls.Exp_date.valid && dialogCtrls.Exp_date.value.split('/')[0] <= 12 && dialogCtrls.mrp.valid && dialogCtrls.P_rate.valid) {
          let NewItem: any = {
            Pid: "",
            Pname: dialogCtrls.name.value,
            manufacturer: dialogCtrls.manufacturer.value,
            type: dialogCtrls.type,
            tax_percent: dialogCtrls.tax_percent.value,
            BatchNo: dialogCtrls.BatchNo.value,
            Batches: [],
            Exp_date: dialogCtrls.Exp_date.value,
            qty: 0,
            pack: 0,
            stock: 0,
            mrp: dialogCtrls.mrp.value,
            newBatchFlag: true,
            P_rate: dialogCtrls.P_rate.value
          };
          this.snackBar.open("Record Added", "ok", {
            duration: 3000
          });
          this.selectedItems.push(NewItem);
          this.selectedItems = [...this.selectedItems];
        } else
          this.snackBar.open("Invalied Details", "ok", {
            duration: 3000
          });
      }
    });
  }

  _openExceptionDialog(message: string): void {
    let config = new MdDialogConfig(),
      dialogRef: MdDialogRef<ExceptionDialog> = this.dialog.open(ExceptionDialog, config);
    dialogRef.componentInstance.title = "Exception";
    dialogRef.componentInstance.message = message;
  }

  toggleExpandRow(row: any, flag: any) {
    if (!flag && row.BatchNo.length > 0) {
      row.toggleVisible = !row.toggleVisible;
      this.recordTable.rowDetail.toggleExpandRow(row);
    } else if (row.toggleVisible == true) {
      row.toggleVisible = false;
      this.recordTable.rowDetail.toggleExpandRow(row);
    }
  }

  toggleAddNewBatch(row: any) {

    if (row.newBatchFlag == false) {
      row.mrp = 0;
      row.BatchNo = "";
      row.Exp_date = "";
      row.stock = 0;
      row.qty = 0;
      row.P_rate = 0;
    }

    row.newBatchFlag = !row.newBatchFlag;
  }

  filterBatch(event: any, row: any) {

    let flag = true;

    row.Batches.forEach(function (item: any) {
      if (item.BatchNumber.startsWith(event.srcElement.value))
        return flag = false;
    });

    if (flag || event.srcElement.value == "")
      this.componentsService.GetFilteredBatches(event.srcElement.value, row.Pid)
        .subscribe(res => {
          return row.Batches = res;
        });
  }

  validateExpiryDate(row: any) {

    if (row.Exp_date.indexOf('1') == 0 && row.Exp_date.length == 2 && row.Exp_date.indexOf('/') > 0)
      row.Exp_date = "01/";
    else if (row.Exp_date != '0' && row.Exp_date.length == 1 && row.Exp_date.indexOf('1') < 0)
      row.Exp_date = "0" + row.Exp_date + "/";
    else if (row.Exp_date.length == 2)
      row.Exp_date = row.Exp_date + "/";
    else if (row.Exp_date.length == 3 && row.Exp_date.indexOf('/') > 0)
      row.Exp_date = row.Exp_date.substr(0, 2);
    else if (row.Exp_date.length >= 3 && row.Exp_date.indexOf('/') < 0)
      row.Exp_date = row.Exp_date.substr(0, 2) + "/" + row.Exp_date.substring(2, row.Exp_date.length);

  }

  getHeight(row: any, index: number) {
    return (row.BatchNo.length * 32) + (row.BatchNo.length > 0 ? 40 : 0);
  }
}

class SalesHelper {

  constructor(private salesService: SalesService) { }

  AddRecord(salesDetails: Sales, salesData: SalesData[], scope: any) {
    this.salesService.AddSalesRecord(salesDetails, salesData)
      .then(res => {
        if (!res.Error) {
          scope._openSnackBar("Sales Added", "ok");
          scope.selectedItems = [];
          scope.checkedItems = [];
          scope.products.reset();
          scope.billNo.reset();
          scope.billDate.reset();
          scope.supplier.reset();
          scope.CustomerName.reset();
          scope.billAmount = 0;
        } else {
          scope._openExceptionDialog("Sales not added: " + res.Message);
        }
      });
  }

  PrepareItemsForUpdate(scope: any) {

    // Check for item present in Old selection list and new selection list and manage the batches
    scope.selectedItems.forEach(function (item: any, index: number) {
      let oldItem = scope.OldSelectedItems.find((oItem: any) => oItem.Pid == item.Pid);

      if (oldItem) {
        oldItem.isPresentInNew = true;
        for (let i = 0; i < item.Batches.length; i++) {
          let tempItem: Item = {
            Pid: item.Pid,
            Pname: item.Pname,
            manufacturer: item.manufacturer,
            type: item.type,
            tax_percent: item.tax_percent,
            BatchNo: item.Batches[i].BatchNumber,
            Exp_date: item.Exp_date,
            stock: item.Batches[i].stock,
            qty: item.Batches[i].batchQty,
            mrp: item.Batches[i].mrp,
            P_rate: item.Batches[i].P_rate,
            Batches: []
          };
          if (item.Batches[i].batchValue > 0 && oldItem.Batches[i].batchValue == 0)
            scope.AddItems_u.push(tempItem);
          else if (item.Batches[i].batchValue == 0 && oldItem.Batches[i].batchValue > 0) {
            tempItem = {
              Pid: oldItem.Pid,
              Pname: oldItem.Pname,
              manufacturer: oldItem.manufacturer,
              type: oldItem.type,
              tax_percent: oldItem.tax_percent,
              BatchNo: oldItem.Batches[i].BatchNumber,
              Exp_date: oldItem.Exp_date,
              stock: oldItem.Batches[i].stock,
              qty: oldItem.Batches[i].batchQty,
              mrp: oldItem.Batches[i].mrp,
              P_rate: oldItem.Batches[i].P_rate,
              Batches: []
            };
            scope.RemoveItems_u.push(tempItem);
          } else if (item.Batches[i].batchValue > 0 && oldItem.Batches[i].batchValue > 0 && item.Batches[i].batchValue != oldItem.Batches[i].batchValue)
            scope.UpdateItems_u.push(tempItem);
        }
      } else {
        // New item added to list that is not present in old selection list
        item.Batches.forEach(function (j: any) {
          if (j.batchValue > 0)
            scope.AddItems_u.push({
              Pid: item.Pid,
              Pname: item.Pname,
              manufacturer: item.manufacturer,
              type: item.type,
              tax_percent: item.tax_percent,
              BatchNo: j.BatchNumber,
              Exp_date: item.Exp_date,
              stock: j.stock,
              qty: j.batchQty,
              mrp: j.mrp,
              P_rate: j.P_rate,
              Batches: []
            });
        });
      }
      oldItem = undefined;
    });
    // Remove the items that are present in old selection list and not new selection list
    scope.OldSelectedItems.forEach(function (oldItem: any) {
      if (!oldItem.isPresentInNew)
        oldItem.Batches.forEach(function (i: any) {
          if (i.batchValue > 0)
            scope.RemoveItems_u.push({
              Pid: oldItem.Pid,
              Pname: oldItem.Pname,
              manufacturer: oldItem.manufacturer,
              type: oldItem.type,
              tax_percent: oldItem.tax_percent,
              BatchNo: i.BatchNumber,
              Exp_date: oldItem.Exp_date,
              stock: i.stock,
              qty: i.batchQty,
              mrp: i.mrp,
              P_rate: i.P_rate,
              Batches: []
            });
        });
    });
  }
}