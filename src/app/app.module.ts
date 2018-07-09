import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { StoreModule } from '@ngrx/store';

import { ɵROUTER_PROVIDERS } from '@angular/router';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';

import { MaterialLoaderModule } from './Modules/MaterialLoader/material-loader.module';
import { AppRoutingModule } from './Route/app-routing.module';
import { DashBoardComponent } from './Modules/Dashboard/dashboard.component';
import { RecordComponent } from './Modules/Record/Components/record.component';
import { ViewRecordComponent } from './Modules/Record/Components/view-record.component';
import { SampleComponent } from './Modules/Record/Components/sample.component';
import { FinanceViewerComponent } from './Modules/FinanceViewer/Components/finance-viewer.component';
import { AppComponent } from './app.component';

import { DialogTempComponent } from './Modules/Shared/common-dialogue/dialog-temp.component';
import { AddNewProductDialog } from './Modules/Shared/add-new-product/addNewProduct-temp.component';
import { ExceptionDialog } from './Modules/Shared/Components/exception-dialog.component';
import { DateFilter } from './Modules/Shared/Components/dateFilter.component';
import { PeekRecord } from './Modules/Shared/peek-record/peek-record.component';
import { RecordModule } from './Modules/Record/record.module';

import { ComponentsService } from './Services/components.service';
import { PurchaseService } from './Services/purchase.service';
import { SalesService } from './Services/sales.service';
import { UtilsService } from './Services/utils.service';
import { SupplierService } from './Services/supplier.service';
import { FinancialViewerService } from './Services/financial-viewer.service';
// import { RecordResolver } from './Modules/Record/record-resolver.service';

import { AppManagementReducer } from './core/store/app.reducers';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialLoaderModule,
        HttpModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        NgxDatatableModule,
        RecordModule,
        StoreModule.forFeature('AppManagement', AppManagementReducer),
        StoreModule.forRoot({})
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
