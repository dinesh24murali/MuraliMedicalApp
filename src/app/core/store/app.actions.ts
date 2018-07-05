import { Action } from '@ngrx/store';

export const HIDE_NAV_BAR = 'HIDE_NAV_BAR';

export class HideNavbar implements Action {
    readonly type = HIDE_NAV_BAR;
    constructor(public hide: Boolean) { }
}

export type AppActions = HideNavbar;
