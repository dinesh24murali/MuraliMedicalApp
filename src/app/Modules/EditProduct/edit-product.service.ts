import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { GlobalConstants } from '../../core/GlobalConstants/GlobalConstants';

@Injectable()
export class EditProductService {
    private headers: Headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
    private options: RequestOptions = new RequestOptions({ headers: this.headers });
    
    constructor(private http: Http) { }

    searchProducts(searchCriteria: any): Observable<any> {
        return this.http.post(`${GlobalConstants.host}${GlobalConstants.searchProducts}`, 'data='+JSON.stringify(searchCriteria), this.options);
    }
}
