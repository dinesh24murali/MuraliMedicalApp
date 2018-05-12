import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

import { ɵROUTER_PROVIDERS } from '@angular/router';
import { MaterialModule, MdNativeDateModule } from '@angular/material';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { AppRoutingModule } from './Route/app-routing.module';
import { DashBoardComponent } from './Modules/Dashboard/dashboard.component';
import { RecordComponent } from './Modules/Record/Components/record.component';
import { ViewRecordComponent } from './Modules/Record/Components/view-record.component';
import { SampleComponent } from './Modules/Record/Components/sample.component';
import { FinanceViewerComponent } from './Modules/FinanceViewer/Components/finance-viewer.component';
import { AppComponent } from './app.component';

import { DialogTempComponent } from './Modules/Shared/Components/dialog-temp.component';
import { AddNewProductDialog } from './Modules/Shared/Components/addNewProduct-temp.component';
import { ExceptionDialog } from './Modules/Shared/Components/exception-dialog.component';
import { DateFilter } from './Modules/Shared/Components/dateFilter.component';
import { PeekRecord } from './Modules/Shared/Components/peek-record.component';

import { ComponentsService } from './Services/components.service';
import { PurchaseService } from './Services/purchase.service';
import { SalesService } from './Services/sales.service';
import { UtilsService } from './Services/utils.service';
import { SupplierService } from './Services/supplier.service';
import { FinancialViewerService } from './Services/financial-viewer.service';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        MdNativeDateModule,
        AppRoutingModule,
        NgxDatatableModule
    ],
    declarations: [
        DashBoardComponent,
        AppComponent,
        RecordComponent,
        AddNewProductDialog,
        DialogTempComponent,
        SampleComponent,
        ViewRecordComponent,
        ExceptionDialog,
        DateFilter,
        PeekRecord,
        FinanceViewerComponent
    ],
    bootstrap: [AppComponent],
    entryComponents: [AddNewProductDialog, DialogTempComponent, ExceptionDialog],
    providers: [ComponentsService, PurchaseService, SalesService, UtilsService, SupplierService, FinancialViewerService]
    // providers: [ComponentsService, PurchaseService, SalesService, UtilsService, SupplierService, FinancialViewerService, { provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppModule { }
