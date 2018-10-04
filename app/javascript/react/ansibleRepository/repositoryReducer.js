import * as actionTypes from './actionTypes';

const initialState = {
  credentials: [],
  repo: {}
};

export const repositoryReducer = (state = initialState, action) => {
  const updatedState = {...state};
  switch (action.type) {
    case actionTypes.LOAD_CREDENTIALS:
    updatedState.credentials = action.payload.map(credential => ({label: credential.name, value: credential.id}));
    break;
    case actionTypes.LOAD_MANAGER_RESOURCE:
    updatedState.managerResource = action.payload;
    break;
    case actionTypes.LOAD_REPO:
    updatedState.repo = action.payload;
    default:
    return updatedState;
  }
  return updatedState;
};
