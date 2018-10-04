import * as actionTypes from './actionTypes';
import { API } from '../../http_api';

export const loadCredentials = () => dispatch => {
  const url = '/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending';

  return API.get(url).then((data) => {
    dispatch({
      type: actionTypes.LOAD_CREDENTIALS,
      payload: data.resources,
    });
  });
};
export const loadRepo = repoId => dispatch => {
  
  const attributes = ['name', 'description', 'scm_type', 'scm_url', 'authentication_id', 'scm_branch', 'scm_clean', 'scm_delete_on_update', 'scm_update_on_launch'];  
  
  return API.get(`/api/configuration_script_sources/${repoId}?attributes=${attributes.join(',')}`).then((data) => {
    dispatch({
      type: actionTypes.LOAD_REPO,
      payload: data,
    });
  });
};

export const loadManagerResource = () => dispatch => {
  return API.get('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager'
  ).then((data) => {
    dispatch({
      type: actionTypes.LOAD_MANAGER_RESOURCE,
      payload: data.resources,
    });
  });
};
