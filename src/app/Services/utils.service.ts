import { Injectable } from '@angular/core';
import { MatDialogRef, MatDialog } from '@angular/material';
import { Store } from '@ngrx/store';
import * as fromAppManagement from '../core/store/app.reducers';
import * as AppActions from '../core/store/app.actions';
import { DialogTempComponent } from './../Modules/Shared/common-dialogue/dialog-temp.component';

@Injectable()
export class UtilsService {

    constructor(
        public dialog: MatDialog,
        private store: Store<fromAppManagement.FeatureState>
    ) { }

    hideNavigationBar(flag: Boolean) {
        this.store.dispatch(new AppActions.HideNavbar(flag));
    }

    ShowYesNoDialog(title: string, message: string) {
        let dialogRef: MatDialogRef<DialogTempComponent> = this.dialog.open(DialogTempComponent, {
            height: '25%',
            width: '20%',
            disableClose: true
        });
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        return dialogRef.componentInstance.onButtonClick;
    }

    ShowNotificationDialog(title: string, message: string) {
        let dialogRef: MatDialogRef<DialogTempComponent> = this.dialog.open(DialogTempComponent, {
            height: '25%',
            width: '20%',
            disableClose: true
        });
        dialogRef.componentInstance.title = title;
        dialogRef.componentInstance.message = message;
        dialogRef.componentInstance.hideCancel = true;
        return dialogRef.componentInstance.onButtonClick;
    }
}
