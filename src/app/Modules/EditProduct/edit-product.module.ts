import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MaterialLoaderModule } from './../MaterialLoader/material-loader.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { EditProductComponent } from './edit-product.component';
import { EditProductRoutingModule } from './edit-product-routing.module';
import { ViewProductComponent } from './view-product/view-product.component';
import { EditProductService } from './edit-product.service';

@NgModule({
    imports: [
        EditProductRoutingModule,
        FormsModule,
        NgxDatatableModule,
        ReactiveFormsModule,
        MaterialLoaderModule
    ],
    declarations: [
        EditProductComponent,
        ViewProductComponent
    ],
    providers: [EditProductService]
})
export class EditProductModule { }
