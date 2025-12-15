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

export const readerReducer = (state, action) => {
    switch(action.type){
        case 'set_readerUrl': {
            return ({
                ...state,
                paragraphUrl: action.payload
            })
        }
        case 'set_minimized': {
            return ({
                ...state,
                isMinimized: action.payload
            })
        }
        case 'set_charIndex':
        case 'set_location': {
            return ({
                ...state,
                charIndex: action.payload
            })
        }
        default: {
            return state
        }
    }
}

