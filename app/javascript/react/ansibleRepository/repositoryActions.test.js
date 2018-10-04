import fetchMock from 'fetch-mock';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as actions from './repositoryActions';
import * as fixtures from './test.fixtures';

const mockRequest = (url, response) => {
  fetchMock
  .getOnce(url, response);
};
const resources = [{ id: 1, name: 'test' }];
describe('Ansible Repository Actions', () => {
  let mockStore;
  let middlewares;
  let store;
  beforeEach(() => {
    middlewares = [thunk];
    mockStore = configureMockStore(middlewares);
    store = mockStore({});
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });

  it('displays a list of credentials', () => {
    const url = '/api/authentications?collection_class=ManageIQ::Providers::EmbeddedAnsible::AutomationManager::ScmCredential&expand=resources&sort_by=name&sort_order=ascending';
    mockRequest(url, {
      resources,
    });

    return store.dispatch(actions.loadCredentials()).then(() => {
      const loadCredentialsActions = store.getActions();
      expect(loadCredentialsActions).toEqual(fixtures.repositoryActionCredentials);
    });
  });
  /* it('Fails a http request', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const spy = jest.spyOn(window, 'add_flash');
    window.add_flash = spy;
    fetchMock
    .mock('/api/service_catalogs/?attributes=id,name&expand=resources&sort_by=name&sort_order=ascending', {
      body: '', status: 500,
    });
    store.dispatch(actions.loadCatalogs()).then(() => {
      expect(spy).toHaveBeenCalledWith('Request failed: @@manageiq/ansibleCatalogItem/ Load catalogs', 'error');
    });
  }); */
  it('fetches a repo', () => {
    const repoId = '1234';
    const attributes = ['name', 'description', 'scm_type', 'scm_url', 'authentication_id', 'scm_branch', 'scm_clean', 'scm_delete_on_update', 'scm_update_on_launch'];  
    const url = `/api/configuration_script_sources/${repoId}?attributes=${attributes.join(',')}`;
    mockRequest(url, {
      ...fixtures.existingRepo
    });
    return store.dispatch(actions.loadRepo(repoId)).then(() => {
      const loadRepoActions = store.getActions();

      const expectedPayload = [
        {
          payload: fixtures.existingRepo,
          type: '@@manageiq/ansibleCatalogItem/ LOAD_REPO'
        }];
      expect(loadRepoActions).toEqual(expectedPayload);
    });
  });
  it('fetches manager resources', () => {
    mockRequest('/api/providers?collection_class=ManageIQ::Providers::EmbeddedAutomationManager',
      {resources: fixtures.managerResource});
    return store.dispatch(actions.loadManagerResource()).then(() => {
      const loadManagerResourceAction = store.getActions();
      expect(loadManagerResourceAction).toEqual([
        {
          payload: fixtures.managerResource,
          "type": "@@manageiq/ansibleCatalogItem/ LOAD_MANAGER_RESOURCE"
        }]);
    });
  });
});
