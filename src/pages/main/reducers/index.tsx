export const localStorageReducer = (state, action) => {
    switch(action.type){
        case 'set_all': {
            return action.payload
        }
        case 'set': {
            return ({
                ...state,
                [action.key]: action.value
            })
        }
        case 'remove': {
            const oldEntries = Object.entries(state)
            return Object.fromEntries(oldEntries
                .filter(([k,_]) => (k !== action.key)))
        }
        default: {
            return state
        }
    }
}

