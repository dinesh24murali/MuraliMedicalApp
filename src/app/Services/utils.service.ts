import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromAppManagement from '../core/store/app.reducers';
import * as AppActions from '../core/store/app.actions';

@Injectable()
export class UtilsService {

    constructor(
        private store: Store<fromAppManagement.FeatureState>
    ) { }

    hideNavigationBar(flag: Boolean) {
        this.store.dispatch(new AppActions.HideNavbar(flag));
    }
}