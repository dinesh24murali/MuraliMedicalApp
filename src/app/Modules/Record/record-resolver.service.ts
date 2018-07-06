import { Injectable } from '@angular/core';
import {
    Router, Resolve, RouterStateSnapshot,
    ActivatedRouteSnapshot
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { RecordService } from './record.service';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class RecordResolver implements Resolve<any> {
    constructor(
        private recordService: RecordService,
        private router: Router,
        private snackBar: MatSnackBar
    ) { }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
        let id = route.paramMap.get('id');
        let type = route.paramMap.get('type');
        let callBack = (record: any) => {
            if (record && record._body) {
                return JSON.parse(record._body);
            } else { // id not found
                this.router.navigate(['/viewRecord/' + type]);
                this.snackBar.open('No '+type+' order with the given ID present', 'ok', {
                    duration: 6000
                });
                return null;
            }
        };
        if (type === 'Purchase')
            return this.recordService.GetPurchaseRecord(id, false).pipe(
                take(1),
                map(callBack)
            );
        else
            return this.recordService.GetSalesRecord(id, false).pipe(
                take(1),
                map(callBack)
            );
    }
}