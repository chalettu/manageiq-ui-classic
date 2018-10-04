import {repositoryReducer} from './repositoryReducer';
import * as actionTypes from './actionTypes';
import { testReducerSnapshotWithFixtures } from '../../components/test-utils';
import * as testFixtures from './test.fixtures';

const resources = testFixtures.testRecords;
const fixtures = {
  'should return the initial state': {},
  'should load a credential': {
    action: {
      type: actionTypes.LOAD_CREDENTIALS,
      payload:  testFixtures.testCredentialRecords,
    },
  },
  'should load a list of Manager resources': {
    action: {
      type: actionTypes.LOAD_MANAGER_RESOURCE,
      payload: { resources: testFixtures.managerResource },
    },
  },
  'should load a repo': {
    action: {
      type: actionTypes.LOAD_REPO,
      payload: testFixtures.existingRepo,
    },
  },
};
describe('Ansible repository reducer', () => testReducerSnapshotWithFixtures(repositoryReducer, fixtures));
