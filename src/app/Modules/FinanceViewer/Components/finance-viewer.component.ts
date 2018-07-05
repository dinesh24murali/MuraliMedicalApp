import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatDialogRef, MatDialog, MatDialogConfig, MatSidenav } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { DatePipe } from '@angular/common';

import { ExceptionDialog } from '../../Shared/Components/exception-dialog.component';
import { Supplier, Purchase, Sales, FilterPurchaseSearchCriteria, FilterSalesSearchCriteria } from '../../../Models/Record/Record';
import { SupplierPayment } from '../../../Models/Payment/Payment';
import { SupplierService } from '../../../Services/supplier.service';
import { FinancialViewerService } from '../../../Services/financial-viewer.service';
import { PurchaseService } from '../../../Services/purchase.service';
import { SalesService } from '../../../Services/sales.service';
import { DateFilter } from "../../Shared/Components/dateFilter.component";

import { GlobalConstants } from "../../../core/GlobalConstants/GlobalConstants";
@Component({
    selector: 'finance-viewer',
    templateUrl: './../Views/finance-viewer.component.html',
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
export class FinanceViewerComponent implements OnInit, OnDestroy {

    @ViewChild('sidenav') public viewRecordNav: MatSidenav;
    @ViewChild(DatatableComponent) table: DatatableComponent;

    suppliersList: Supplier[] = [];
    selSupplier: string = '';
    suppSubscribe: any;
    paramSubscribe: any;

    title: string = '';
    filteredRecords: any = [];
    checkedRecords: any = [];
    totalAmount: number = -1;
    totalCheckedRecords: number = 0;
    view_Id: string = "";
    view_BillNo: string = "";
    view_BillAmt: number = 0;
    view_BillDate: string = "";
    view_Supplier: string = undefined;
    view_Customer: string = undefined;
    peek_recordItems: any = [];
    isFilterBySupplier: boolean = false;
    reachedEndOfRecords: boolean = false;
    tableLoadingIndicator: boolean = true;
    /**
     * currentPurchaseSearchConfig will be used when sending API call to fetch filtered Purchase records
     * also used in buffering the data for the grid when scrolling
     * bufferPageStart: will be used in the query to fetch the particular set of records that starts from this value. This value is the starting limit
     * bufferPageEnd: will be the end limit of the records needed
     */
    currentPurchaseSearchConfig: FilterPurchaseSearchCriteria = { fromDate: "", toDate: "", supplier: "", billNo: "", bufferPageEnd: 0, bufferPageStart: GlobalConstants.viewRecordsBufferSize };
    currentSalesSearchConfig: FilterSalesSearchCriteria = { fromDate: "", toDate: "", customer: "", billNo: "", bufferPageEnd: 0, bufferPageStart: GlobalConstants.viewRecordsBufferSize };
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

    constructor(
        private route: ActivatedRoute,
        private supplierService: SupplierService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private financialViewerService: FinancialViewerService,
        private purchaseService: PurchaseService,
        private salesService: SalesService,
        private router: Router
    ) { }

    ngOnInit() {

        this.paramSubscribe = this.route.params.subscribe(params => {
            let scope = this;
            this.title = params['type'];
            this.tableLoadingIndicator = true;
            this.isFilterBySupplier = false;
            this.view_Customer = undefined;
            this.view_Supplier = undefined;
            if (this.title == "Purchase") {
                this.currentPurchaseSearchConfig = { fromDate: "", toDate: "", billNo: "", supplier: "", bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
                this.purchaseService.GetPurchaseRecords(this.currentPurchaseSearchConfig)
                    .then(res => this._afterFetchRecords(res));
                this.suppSubscribe = this.supplierService.GetFilteredSuppliers(null)
                    .subscribe(res => {
                        if (res[0])
                            this.selSupplier = res[0].id;
                        this.suppliersList = res;
                    });
                this.purchaseService.GetTotalAmtForFilterRecords(this.currentPurchaseSearchConfig)
                    .then(res => {
                        this.totalAmount = res.total_amount;
                        this.totalNoOfRecords = res.count;
                    });
            } else {
                this.currentSalesSearchConfig = { fromDate: "", toDate: "", billNo: "", customer: "", bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
                this.salesService.GetSalesRecords(this.currentSalesSearchConfig)
                    .then(res => this._afterFetchRecords(res));
                this.salesService.GetTotalAmtForFilterRecords(this.currentSalesSearchConfig)
                    .then(res => {
                        this.totalAmount = res.total_amount;
                        this.totalNoOfRecords = res.count;
                    });
            }
        });
    }
    /**
     * function is called after getting response from server when filtering and initializing
     * @param {res} Object[] contains the array of records that are needed
     */
    _afterFetchRecords(res: any) {
        if (res) {
            this.filteredRecords = [...res];
            this.tableLoadingIndicator = false;
            this.table.bodyComponent.updateOffsetY(0);
            this.calcTotal();
        }
    }

    ngOnDestroy() {
        if (this.title == "Purchase")
            this.suppSubscribe.unsubscribe();
        this.paramSubscribe.unsubscribe();
    }

    fetchRecords(dateFilterInfo: any) {
        this.checkedRecords = [];
        if (dateFilterInfo.isClearFilter == true)
            this.selSupplier = this.suppliersList[0] ? this.suppliersList[0].id : "";
        this.tableLoadingIndicator = true;
        if (this.title == "Purchase") {
            // This code is temperuary, you need to write a seperate method that fetches supplier details based on supplierId
            let supplierName = "";
            // resetting the table buffer configurations
            this.reachedEndOfRecords = false;
            this.pageBufferUntil = 1;
            if (this.isFilterBySupplier)
                this.suppliersList.forEach(item => {
                    if (item.id == this.selSupplier) {
                        supplierName = item.name;
                        return false;
                    }
                }, this);
            this.currentPurchaseSearchConfig = { fromDate: dateFilterInfo.fromDate, toDate: dateFilterInfo.toDate, billNo: "", supplier: supplierName, bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
            this.purchaseService.GetPurchaseRecords(this.currentPurchaseSearchConfig)
                .then(res => {
                    this._afterFetchRecords(res);
                    this.snackBar.open('Purchase Orders Filtered', 'Ok', {
                        duration: 2000
                    });
                });
            this.purchaseService.GetTotalAmtForFilterRecords(this.currentPurchaseSearchConfig)
                .then(res => {
                    this.totalAmount = res.total_amount;
                    this.totalNoOfRecords = res.count;
                });
        } else {
            this.reachedEndOfRecords = false;
            this.pageBufferUntil = 1;
            this.currentSalesSearchConfig = { fromDate: dateFilterInfo.fromDate, toDate: dateFilterInfo.toDate, billNo: "", customer: "", bufferPageStart: 0, bufferPageEnd: GlobalConstants.viewRecordsBufferSize };
            this.salesService.GetSalesRecords(this.currentSalesSearchConfig)
                .then(res => {
                    this._afterFetchRecords(res);
                    this.snackBar.open('Sales Orders Filtered', 'Ok', {
                        duration: 2000
                    });
                });
            this.salesService.GetTotalAmtForFilterRecords(this.currentSalesSearchConfig)
                .then(res => {
                    this.totalAmount = res.total_amount;
                    this.totalNoOfRecords = res.count;
                });
        }
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

    editRecordFromView(recordId: string) {
        if (this.title == "Purchase")
            this.router.navigate(['/record/Purchase'], { queryParams: { id: recordId } });
        else
            this.router.navigate(['/record/Sales'], { queryParams: { id: recordId } });
    }
    /**
     * function called when recorded is deleted from peek-record ctrl
     * @param {string} recordId contains the recordId needed to delete
     */
    deleteRecord(recordId: string) {

        if (this.title == "Purchase")
            this.purchaseService.DeletePurchaseRecord(recordId)
                .then(res => {
                    if (res.Error)
                        this._openExceptionDialog(res.Message);
                    else {
                        let record = this.filteredRecords.find(item => item.Id === recordId);
                        let deletedRecord = this.filteredRecords.splice(this.filteredRecords.indexOf(record), 1);
                        // Subtract the deleted records amt from total amt
                        this.totalAmount -= deletedRecord.Purchase_amt;
                        this.totalNoOfRecords--;
                        this.filteredRecords = [...this.filteredRecords];
                        this.snackBar.open('Record Deleted', 'Ok', {
                            duration: 3000
                        });
                        this.calcTotal();
                        this.viewRecordNav.close();
                    }
                });
        else
            this.salesService.DeleteSalesRecord(recordId)
                .then(res => {
                    if (res.Error)
                        this._openExceptionDialog(res.Message);
                    else {
                        let record = this.filteredRecords.find(item => item.Id === recordId);
                        let deletedRecord = this.filteredRecords.splice(this.filteredRecords.indexOf(record), 1);
                        // Subtract the deleted records amt from total amt
                        this.totalAmount -= deletedRecord.Sales_amt;
                        this.totalNoOfRecords--;
                        this.filteredRecords = [...this.filteredRecords];
                        this.snackBar.open('Record Deleted', 'Ok', {
                            duration: 3000
                        });
                        this.calcTotal();
                        this.viewRecordNav.close();
                    }
                });
    }
    /**
     * Function is used to calculate the total amount for checkbox selected records
     */
    calcTotal() {
        this.totalCheckedRecords = 0;
        this.checkedRecords.forEach(function (item) {
            this.totalCheckedRecords += this.title == "Purchase" ? item.Purchase_amt : item.Sales_amt;
        }, this);
    }
    /**
     * function handles the scroll page change event in the grid
     * @param {pageDetail} object will have 4 values sent by the table plugin: count, pageSize, limit, offset
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
                            this.filteredRecords = this.filteredRecords.concat(res);
                        else
                            this.reachedEndOfRecords = true;
                    });
            } else {
                this.currentSalesSearchConfig.bufferPageStart = this.currentSalesSearchConfig.bufferPageEnd;
                this.currentSalesSearchConfig.bufferPageEnd = this.pageBufferUntil * GlobalConstants.viewRecordsBufferSize;
                this.salesService.GetSalesRecords(this.currentSalesSearchConfig)
                    .then(res => {
                        if (res.length > 0)
                            this.filteredRecords = this.filteredRecords.concat(res);
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
}