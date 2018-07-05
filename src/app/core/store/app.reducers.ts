import * as AppActions from './app.actions';


export interface State {
    hide: Boolean;
}

export interface FeatureState {
    appManagement: State;
}

const intialState: State = {
    hide: false
};

export function AppManagementReducer(state = intialState, action: AppActions.AppActions) {

    debugger;
    switch (action.type) {
        case AppActions.HIDE_NAV_BAR:
            return {
                ...state,
                hide: action.hide
            };

        default: {
            return state;
        }
    }
}

