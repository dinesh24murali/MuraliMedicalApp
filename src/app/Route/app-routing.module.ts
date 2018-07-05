import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { DashBoardComponent } from '../Modules/Dashboard/dashboard.component';
import { FinanceViewerComponent } from '../Modules/FinanceViewer/Components/finance-viewer.component';
import { RecordComponent } from '../Modules/Record/Components/record.component';
import { ViewRecordComponent } from '../Modules/Record/Components/view-record.component';
import { SampleComponent } from '../Modules/Record/Components/sample.component';

const routes: Routes = [
  { path: 'dashboard', component: DashBoardComponent },
  { path: 'record/:type', component: RecordComponent },
  { path: 'finance/:type', component: FinanceViewerComponent },
  { path: 'viewRecord/:type', component: ViewRecordComponent },
  { path: 'sample', component: SampleComponent },
  {
    path: 'product',
    loadChildren: '../Modules/EditProduct/edit-product.module#EditProductModule'
  },
  { path: '', redirectTo: '/viewRecord/Purchase', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
