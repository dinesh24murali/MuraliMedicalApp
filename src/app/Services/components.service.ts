import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/map';
import { Item } from '../Models/Record/Record';
import { GlobalConstants } from '../core/GlobalConstants/GlobalConstants';

@Injectable()
export class ComponentsService {

    private host: string = GlobalConstants.host;
    constructor(private http: Http) { }

    GetFilteredProducts(searchText: string, recordType: string): Observable<Item[]> {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host + "/medical/main.php/Components/GetFilteredProducts", 'data={"queryString":"' + searchText + '","recordType":"' + recordType + '"}', options)
            .map(response => response.json());
    }

    GetFilteredBatches(searchText: string, Pid: string): Observable<Item[]> {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' });
        let options = new RequestOptions({ headers: headers });
        return this.http.post(this.host + "/medical/main.php/Components/GetFilteredBatches", 'data={"queryString":"' + searchText + '","Pid":"' + Pid + '"}', options)
            .map(response => response.json());
    }
}