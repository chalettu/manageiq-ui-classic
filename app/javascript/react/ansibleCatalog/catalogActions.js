import * as actionTypes from './actionTypes';
import { API } from '../../http_api';

export const commonParams = '&expand=resources&sort_by=name&sort_order=ascending';
export const credentialsRequest = type => `/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::${type}&attributes=id,name${commonParams}`;
const catchError = (action) => {
  window.add_flash(__('Request failed: ') + action, 'error');
};
export const loadCatalogs = () => dispatch => API.get(`/api/service_catalogs/?attributes=id,name${commonParams}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_CATALOGS,
    payload: data,
  });
}).catch(() => {
  catchError(actionTypes.LOAD_CATALOGS);
});
export const loadDialogs = () => dispatch => API.get('/api/service_dialogs/?expand=resources&attributes=id,label&sort_by=label&sort_order=ascending').then((data) => {
  dispatch({
    type: actionTypes.LOAD_DIALOGS,
    payload: data,
  });
}).catch(() => {
  catchError(actionTypes.LOAD_DIALOGS);
});
export const loadRepos = region => dispatch => API.get(`/api/configuration_script_sources?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ConfigurationScriptSource&attributes=id,name&filter[]=region_number=${region}${commonParams}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_REPOS,
    payload: data,
  });
}).catch(() => {
  catchError(actionTypes.LOAD_REPOS);
});
export const loadPlaybooks = (region, repoId, playbookType) => dispatch => API.get(`/api/configuration_script_sources/${repoId}/configuration_script_payloads?filter[]=region_number=${region}${commonParams}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_PLAYBOOKS,
    payload: { ...data, playbookType },
  });
}).catch(() => {
  catchError(actionTypes.LOAD_PLAYBOOKS);
});
export const loadCredentials = type => (dispatch) => {
  const actionType = (type === 'Machine' ? actionTypes.LOAD_MACHINE_CREDENTIALS : actionTypes.LOAD_VAULT_CREDENTIALS);

  return API.get(credentialsRequest(`${type}Credential`)).then((data) => {
    dispatch({
      type: actionType,
      payload: data,
    });
  }).catch(() => {
    catchError(actionType);
  });
};
export const loadCloudTypes = () => dispatch => API.options('/api/authentications').then((data) => {
  dispatch({
    type: actionTypes.LOAD_CLOUD_TYPES,
    payload: data.data,
  });
}).catch(() => {
  catchError(actionTypes.LOAD_CLOUD_TYPES);
});
export const loadCloudCredentials = (fieldType, cloudType) => dispatch => API.get(`/api/authentications?collection_class=${cloudType}&attributes=id,name${commonParams}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_CLOUD_CREDENTIALS,
    payload: { ...data, fieldType },
  });
}).catch(() => {
  catchError(actionTypes.LOAD_CLOUD_CREDENTIALS);
});
export const loadCatalogItem = catalogItemId => dispatch => API.get(`/api/service_templates/${catalogItemId}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_CATALOG_ITEM,
    payload: data,
  });
}).catch(() => {
  catchError(actionTypes.LOAD_CATALOG_ITEM);
});
export const loadCloudCredential = credentialId => dispatch => API.get(`/api/authentications/${credentialId}`).then((data) => {
  dispatch({
    type: actionTypes.LOAD_CLOUD_CREDENTIAL,
    payload: data,
  });
}).catch(() => {
  catchError(actionTypes.LOAD_CLOUD_CREDENTIAL);
});
export const duplicateDropdowns = fields => ({
  type: actionTypes.DUPLICATE_DROPDOWNS,
  payload: fields,
});
