import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'date-filter',
    template: `<mat-grid-list [cols]="cols" [rowHeight]="rowHeight">
    <mat-grid-tile [colspan]="colspan">
        <mat-form-field class="full-width">
            <input matInput autocomplete="off" [matDatepicker]="FromDate" placeholder="From Date" [formControl]="fromDate">
            <mat-datepicker-toggle matSuffix [for]="FromDate"></mat-datepicker-toggle>
            <mat-datepicker #FromDate></mat-datepicker>
        </mat-form-field>
    </mat-grid-tile>

    <mat-grid-tile [colspan]="colspan">
        <mat-form-field class="full-width">
            <input matInput autocomplete="off" [matDatepicker]="ToDate" placeholder="To Date" [formControl]="toDate">
            <mat-datepicker-toggle matSuffix [for]="ToDate"></mat-datepicker-toggle>
            <mat-datepicker #ToDate></mat-datepicker>
        </mat-form-field>

    </mat-grid-tile>
    <mat-grid-tile [colspan]="colspan">
        <button (click)="searchRecords()" mat-raised-button color="primary">
            <span class="glyphicon glyphicon-search"></span> Search</button>
    </mat-grid-tile>
    <mat-grid-tile [colspan]="colspan">
        <button (click)="clearFilter()" mat-raised-button>
            Clear</button>
    </mat-grid-tile>
</mat-grid-list> `
})
export class DateFilter {

    @Input() public cols: string = '';
    @Input() public rowHeight: string = '';
    @Input() public colspan: string = '';

    @Output('fetchRecordEvent') public filterOutput = new EventEmitter<any>();

    public fromDate = new FormControl();
    public toDate = new FormControl();

    constructor() { }

    searchRecords() {
        let fDate = new Date(this.fromDate.value),
            tDate = new Date(this.toDate.value),
            filterData = {
                fromDate: this.fromDate.value != null ? fDate.getFullYear() + "-" + (fDate.getMonth() + 1) + "-" + fDate.getDate() : "",
                toDate: this.toDate.value != null ? tDate.getFullYear() + "-" + (tDate.getMonth() + 1) + "-" + tDate.getDate() : "",
                isClearFilter: false
            };
        this.filterOutput.emit(filterData);
    }

    clearFilter() {
        this.fromDate.reset();
        this.toDate.reset();
        this.filterOutput.emit({ fromDate: "", toDate: "", isClearFilter: true });
    }
}