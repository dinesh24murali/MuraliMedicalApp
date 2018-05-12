import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
    selector: 'date-filter',
    template: `<md-grid-list [cols]="cols" [rowHeight]="rowHeight">
    <md-grid-tile [colspan]="colspan">
        <md-input-container class="full-width">
            <input mdInput [mdDatepicker]="FromDate" placeholder="From Date" [formControl]="fromDate">
            <button mdSuffix [mdDatepickerToggle]="FromDate"></button>
        </md-input-container>
        <md-datepicker #FromDate></md-datepicker>
    </md-grid-tile>

    <md-grid-tile [colspan]="colspan">
        <md-input-container class="full-width">
            <input mdInput [mdDatepicker]="ToDate" placeholder="To Date" [formControl]="toDate">
            <button mdSuffix [mdDatepickerToggle]="ToDate"></button>
        </md-input-container>
        <md-datepicker #ToDate></md-datepicker>
    </md-grid-tile>
    <md-grid-tile [colspan]="colspan">
        <button (click)="searchRecords()" md-raised-button color="primary">
            <span class="glyphicon glyphicon-search"></span> Search</button>
    </md-grid-tile>
    <md-grid-tile [colspan]="colspan">
        <button (click)="clearFilter()" md-raised-button>
            Clear</button>
    </md-grid-tile>
</md-grid-list> `
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