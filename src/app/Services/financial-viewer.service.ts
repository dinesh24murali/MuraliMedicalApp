import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { GlobalConstants } from '../core/GlobalConstants/GlobalConstants';

@Injectable()
export class FinancialViewerService {

    private headers: Headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    private options: RequestOptions = new RequestOptions({ headers: this.headers });
    
    private host: string = GlobalConstants.host;
    constructor(private http: Http) { }

    getPurchaseRecords(): Promise<any> {
        return this.http.post(this.host + "/medical/main.php/Purchase/GetPurchaseRecord", 'data={"RecordDetail":}', this.options).toPromise()
            .then((response: any) => {
                return response._body ? JSON.parse(response._body) : {};
            }).catch(function (response) {
                return { Error: true, type: 'Network Error' };
            });
    }

    getPurchaseSales(): Promise<any> {
        return this.http.post(this.host + "/medical/main.php/Sales/GetSalesRecord", 'data={"RecordDetail":}', this.options).toPromise()
            .then((response: any) => {
                return response._body ? JSON.parse(response._body) : {};
            }).catch(function (response) {
                return { Error: true, type: 'Network Error' };
            });
    }
}