import { Component, ElementRef, ViewChild, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Params, Router, NavigationExtras } from '@angular/router';
import { MatSnackBar, MatDialogRef, MatDialog, MatDialogConfig, MatSidenav } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DatePipe } from '@angular/common';

import { DialogTempComponent } from '../../Shared/Components/dialog-temp.component';
import { ExceptionDialog } from '../../Shared/Components/exception-dialog.component';
import { Purchase, PurchaseData, Sales, SalesData, FilterPurchaseSearchCriteria, FilterSalesSearchCriteria } from '../../../Models/Record/Record';
import { PurchaseService } from '../../../Services/purchase.service';
import { SalesService } from '../../../Services/sales.service';
import { GlobalConstants } from "../../../core/GlobalConstants/GlobalConstants";

@Component({
  selector: 'view-record',
  templateUrl: './../Views/view-record.component.html',
  styles: [`
  .viewRecord{
    padding: 20px 20px 20px 20px;
  }
  .view-container{
    width:1000px;
  }
  .sidenav-container {
    position: fixed;
    height: 100%;
    min-height: 100%;
    width: 100%;
    min-width: 80%;
  }
  .buffer-indicator{
    margin-top: 18px;
    margin-bottom: 18px;
  }
  `]
})
export class ViewRecordComponent implements OnInit, OnDestroy {

  records: any = [];

  title: string;
  private routeSubscribe: any;
  private querySubscribe: any;
  filterBillNo: string = "";
  filterSupplier: string = "";
  filterCustomer: string = "";
  fromDate: string = "";
  toDate: string = "";

  view_BillNo: string;
  view_BillAmt: string;
  view_Id: string;
  view_BillDate: string;
  view_Supplier: string = undefined;
  view_Customer: string = undefined;
  view_recordItems: PurchaseData[] = [];
  peekCtrl: boolean = false;
  id: any;
  peek_recordItems: any = [];
  tableLoadingIndicator: boolean = true;

  /** 
   * total number of records that are available in the backend for the search criteria
   */
  totalNoOfRecords: number = 0;

  /**
   * By default the back-end will send 50 records, and the page size is 10 records
   * When starting fresh, after we scrolled down and reach the 40th record or the 4th page, we need to send a call to the back-end to fetch the next
   * set of 50 records.
   * So in short, when ever we scroll down and reach the 10th record before the last record, a buffer API call will go to fetch next set of records
   */
  scrollPageLimitForBuffer: number = GlobalConstants.viewRecordsBufferSize / 10;

  // keeps track of the amount of records in the UI
  // buffer value of 1 will have 50 records
  pageBufferUntil: number = 1;

  /**
   * currentPurchaseSearchConfig will be used when sending API call to fetch filtered Purchase records
   * also used in buffering the data for the grid when scrolling
   * bufferPageStart: will be used in the query to fetch the particular set of records that starts from this value. This value is the starting limit
   * bufferPageEnd: will be the end limit of the records needed
   */
  currentPurchaseSearchConfig: FilterPurchaseSearchCriteria = { fromDate: "", toDate: "", supplier: "", billNo: "", bufferPageEnd: 0, bufferPageStart: GlobalConstants.viewRecordsBufferSize };
  currentSalesSearchConfig: FilterSalesSearchCriteria = { fromDate: "", toDate: "", customer: "", billNo: "", bufferPageEnd: 0, bufferPageStart: GlobalConstants.viewRecordsBufferSize };

  reachedEndOfRecords: boolean = false;

  @ViewChild(DatatableComponent) table: DatatableComponent;
  @ViewChild('sidenav') public viewRecordNav: MatSidenav;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    private purchaseService: PurchaseService,
    private salesService: SalesService
  ) { }

  ngOnInit(): void {

    this.id = undefined;

    this.routeSubscribe = this.route.params.subscribe(params => {
      this.title = params['type'];
      this.tableLoadingIndicator = true;
      this.view_Supplier = undefined;
      this.view_Customer = undefined;

      // resetting table values
      this.reachedEndOfRecords = false;
      this.pageBufferUntil = 1;
      // this.table.bodyComponent.updateOffsetY(50);

      if (this.title == "Purchase") {
        this.currentPurchaseSearchConfig = { fromDate: "", toDate: "", billNo: "", supplier: "", bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
        this.purchaseService.GetCountForFilterRecords(this.currentPurchaseSearchConfig)
          .then(res => this.totalNoOfRecords = res);
        this.purchaseService.GetPurchaseRecords(this.currentPurchaseSearchConfig)
          .then(response => {
            this.records = [...response];
            this.tableLoadingIndicator = false;
            this.table.bodyComponent.updateOffsetY(0);
          });
      } else {
        this.currentSalesSearchConfig = { fromDate: "", toDate: "", billNo: "", customer: "", bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
        this.salesService.GetCountForFilterRecords(this.currentSalesSearchConfig)
          .then(res => this.totalNoOfRecords = res);
        this.salesService.GetSalesRecords(this.currentSalesSearchConfig)
          .then(response => {
            this.records = [...response];
            this.tableLoadingIndicator = false;
            this.table.bodyComponent.updateOffsetY(0);
          });
      }
    });

    this.querySubscribe = this.route
      .queryParamMap
      .subscribe(params => {
        this.id = params.get('id');
        this.view_Id = this.id;
        if (this.id)
          if (this.title == "Purchase")
            this.purchaseService.GetPurchaseRecord(this.id, false).toPromise()
              .then(response => {
                if (!response._body) {
                  this.snackBar.open('Response error', 'ok', { duration: 3000 });
                  return;
                }
                response = JSON.parse(response._body);
                this.view_BillNo = response.BillNo;
                this.view_BillAmt = response.Purchase_amt;
                this.view_Supplier = response.Supplier;
                this.view_BillDate = response.BillDate;
                this.peek_recordItems = response.Items;
                this.viewRecordNav.open();
              });
          else
            this.salesService.GetSalesRecord(this.id, false).toPromise()
              .then(response => {
                if (!response._body) {
                  this.snackBar.open('Response error', 'ok', { duration: 3000 });
                  return;
                }
                response = JSON.parse(response._body);
                this.view_BillNo = response.BillNo;
                this.view_BillAmt = response.Sales_amt;
                this.view_BillDate = response.BillDate;
                this.view_Customer = response.Customer;
                this.peek_recordItems = response.Items;
                this.viewRecordNav.open();
              });
      });

  }

  ngOnDestroy() {
    this.routeSubscribe.unsubscribe();
    this.querySubscribe.unsubscribe();
  }

  viewRecord(row: any) {
    this.view_Id = row.Id;
    this.view_BillDate = row.BillDate;
    this.view_BillNo = row.BillNo;
    if (this.title == "Purchase") {
      this.view_Supplier = row.Supplier;
      this.view_BillAmt = row.Purchase_amt;
    } else {
      this.view_Customer = row.Customer;
      this.view_BillAmt = row.Sales_amt;
    }

    if (row.Id)
      if (this.title == "Purchase")
        this.purchaseService.GetPurchaseRecordData(row.Id)
          .then(res => {
            this.peek_recordItems = res;
            this.viewRecordNav.open();
          });
      else
        this.salesService.GetSalesRecordData(row.Id)
          .then(res => {
            this.peek_recordItems = res;
            this.viewRecordNav.open();
          });
  }

  editRecord(recordId: string) {
    if (this.title == "Purchase")
      this.router.navigate(['/record/Purchase'], { queryParams: { id: recordId } });
    else
      this.router.navigate(['/record/Sales'], { queryParams: { id: recordId } });
  }

  deleteRecord(recordId: string) {
    if (this.title == "Purchase")
      this.purchaseService.DeletePurchaseRecord(recordId)
        .then(res => {
          if (res.Error)
            this._openExceptionDialog(res.Message);
          else {
            let record = this.records.find(item => item.Id === recordId);
            this.records.splice(this.records.indexOf(record), 1);
            this.records = [...this.records];
            this.snackBar.open('Record Deleted', 'Ok', {
              duration: 3000
            });
            this.viewRecordNav.close();
          }
        });
    else
      this.salesService.DeleteSalesRecord(recordId)
        .then(res => {
          if (res.Error)
            this._openExceptionDialog(res.Message);
          else {
            let record = this.records.find(item => item.Id === recordId);
            this.records.splice(this.records.indexOf(record), 1);
            this.records = [...this.records];
            this.snackBar.open('Record Deleted', 'Ok', {
              duration: 3000
            });
            this.viewRecordNav.close();
          }
        });
  }

  openDialog(title: string, message: string): void {
    let config = new MatDialogConfig(),
      dialogRef: MatDialogRef<DialogTempComponent> = this.dialog.open(DialogTempComponent, config);
    dialogRef.componentInstance.title = "Confirm Delete";
    dialogRef.componentInstance.message = "Are you sure?";
  }

  /** 
  * function handles events from DateFilter component
  * @param {object} dateFilterInfo will have 3 values fromDate, toDate, and clearFilter
  */
  fetchRecordsByDate(dateFilterInfo: any) {

    if (dateFilterInfo.isClearFilter == true) {
      this.filterBillNo = "";
      this.filterSupplier = "";
      this.filterCustomer = "";
    }
    // else if (dateFilterInfo.fromDate == "" && dateFilterInfo.toDate == "" && this.filterBillNo == "" && ((this.filterSupplier == "" && this.title == "Purchase") || (this.filterCustomer == "" && this.title == "Sales"))) {
    //   if (this.currentPurchaseSearchConfig.fromDate != "" || )
    //     return;
    // }
    this.tableLoadingIndicator = true;
    if (this.title == "Purchase") {
      // resetting the table buffer configurations
      this.reachedEndOfRecords = false;
      this.pageBufferUntil = 1;

      this.currentPurchaseSearchConfig = { fromDate: dateFilterInfo.fromDate, toDate: dateFilterInfo.toDate, billNo: this.filterBillNo, supplier: this.filterSupplier, bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
      this.purchaseService.GetCountForFilterRecords(this.currentPurchaseSearchConfig)
        .then(res => this.totalNoOfRecords = res);
      this.purchaseService.GetPurchaseRecords(this.currentPurchaseSearchConfig)
        .then(res => {
          this.records = res;
          this.tableLoadingIndicator = false;
          // scroll the table view to the 1st record
          this.table.bodyComponent.updateOffsetY(0);
          this.snackBar.open('Purchase Orders Fetched', 'Ok', {
            duration: 2000
          });
        });
    } else {
      this.reachedEndOfRecords = false;
      this.pageBufferUntil = 1;
      this.currentSalesSearchConfig = { fromDate: dateFilterInfo.fromDate, toDate: dateFilterInfo.toDate, billNo: this.filterBillNo, customer: this.filterCustomer, bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
      this.salesService.GetCountForFilterRecords(this.currentSalesSearchConfig)
        .then(res => this.totalNoOfRecords = res);
      this.salesService.GetSalesRecords(this.currentSalesSearchConfig)
        .then(res => {
          this.records = res;
          this.tableLoadingIndicator = false;
          this.table.bodyComponent.updateOffsetY(0);
          this.snackBar.open('Sales Orders Fetched', 'Ok', {
            duration: 2000
          });
        });
    }
  }
  /**
   * function handles the scroll page change event in the grid
   * @param {object} pageDetail will have 4 values sent by the table plugin: count, pageSize, limit, offset
   */
  onPageChange(pageDetail: any): void {
    /** 
     * if current pageoffset >= the buffer size of the table * the number of pages that is already been rendered
     * then add new set of pages to the grid
     */
    if (pageDetail.offset >= (this.scrollPageLimitForBuffer * this.pageBufferUntil) - 1 && !this.reachedEndOfRecords) {
      // incrementing the number of times the table have been buffered
      this.pageBufferUntil++;
      this.tableLoadingIndicator = true;

      if (this.title == "Purchase") {
        this.currentPurchaseSearchConfig.bufferPageStart = this.currentPurchaseSearchConfig.bufferPageEnd;
        this.currentPurchaseSearchConfig.bufferPageEnd = this.pageBufferUntil * GlobalConstants.viewRecordsBufferSize;
        this.purchaseService.GetPurchaseRecords(this.currentPurchaseSearchConfig)
          .then(res => {
            this.tableLoadingIndicator = false;
            if (res.length > 0)
              this.records = this.records.concat(res);
            else
              this.reachedEndOfRecords = true;
          });
      } else {
        this.currentSalesSearchConfig.bufferPageStart = this.currentSalesSearchConfig.bufferPageEnd;
        this.currentSalesSearchConfig.bufferPageEnd = this.pageBufferUntil * GlobalConstants.viewRecordsBufferSize;
        this.salesService.GetSalesRecords(this.currentSalesSearchConfig)
          .then(res => {
            if (res.length > 0)
              this.records = this.records.concat(res);
            else
              this.reachedEndOfRecords = true;
            this.tableLoadingIndicator = false;
          });
      }
    }
  }

  _openExceptionDialog(message: string): void {
    let config = new MatDialogConfig(),
      dialogRef: MatDialogRef<ExceptionDialog> = this.dialog.open(ExceptionDialog, config);
    dialogRef.componentInstance.title = "Exception";
    dialogRef.componentInstance.message = message;
  }

  printRecord(recordId: string) {
    if (this.title == "Purchase")
      this.router.navigate(['/printRecord/Purchase/' + recordId]);
    else
      this.router.navigate(['/printRecord/Sales/' + recordId]);
  }
}