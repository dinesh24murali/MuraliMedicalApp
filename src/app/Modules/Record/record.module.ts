import { RecordResolver } from './record-resolver.service';
import { RecordService } from './record.service';
import { NgModule } from '@angular/core';
import { PrintRecordComponent } from './PrintRecord/print-record.component';
import { CommonModule } from '@angular/common';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [PrintRecordComponent],
    providers: [RecordService, RecordResolver]
})
export class RecordModule { }
