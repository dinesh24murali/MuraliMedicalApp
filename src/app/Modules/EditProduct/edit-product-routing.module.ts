import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { EditProductComponent } from './edit-product.component';
import { ViewProductComponent } from './view-product/view-product.component';

const routes: Routes = [{
    path: '',
    component: EditProductComponent,
    children: [
        {
            path: 'view-products',
            component: ViewProductComponent
        },
        {
            path: '', redirectTo: 'view-products', pathMatch: 'full'
        },
    ]
}
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EditProductRoutingModule { }
