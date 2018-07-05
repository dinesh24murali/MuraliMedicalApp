import { NgModule } from '@angular/core';

import { EditProductComponent } from './edit-product.component';
import { EditProductRoutingModule } from './edit-product-routing.module';
import { ViewProductComponent } from './view-product/view-product.component';

@NgModule({
    imports: [
        EditProductRoutingModule
    ],
    declarations: [
        EditProductComponent,
        ViewProductComponent
    ]
})
export class EditProductModule { }
