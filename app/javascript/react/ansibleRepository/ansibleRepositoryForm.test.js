import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PropTypes from 'prop-types';
import { API } from '../../http_api';
import {existingRepo} from './test.fixtures'
import AnsibleRepositoryForm from './';
import fetchMock from 'fetch-mock';
 const initialProps = {
  repoId: null,
  loadCredentials: jest.fn(),
  loadManagerResource: jest.fn(),
  loadRepo: jest.fn(),
}
let store;
const mockStore = configureStore([thunk]);
const shallowMount = (props) => {
  return shallow(<AnsibleRepositoryForm {...props} />,
    {
      context: { store: store },
      childContextTypes: { store: PropTypes.object.isRequired }
    }
  ).dive();
}
describe('Ansible Repository form component', () => {
  beforeEach(() => {
    store = mockStore({
      ansibleRepository: {
        credentials: [],
        managerResource: [],
        repo: {},
      },
    });

    fetchMock.get('/api/providers', {
      resources: {
        managerResource: [
          {
            href: 'http://github.com'
          }
        ]
      }
    });
    fetchMock.get('/api/authentications', {
      resources: { name: 'test', id: 1 }
    });
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('should render correctly', () => {
    const wrapper = mount(<AnsibleRepositoryForm {...initialProps} />,
      {
        context: { store: store },
        childContextTypes: { store: PropTypes.object.isRequired }
      }
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });
  it('should allow fields to be setup', () => {
    const wrapper = shallow(<AnsibleRepositoryForm {...initialProps} />,
      {
        context: { store: store },
        childContextTypes: { store: PropTypes.object.isRequired }
      }
    ).dive();
    const fields = wrapper.instance().setupFields();
    expect(fields.length).toEqual(6);
  });
  it('should allow you to add a repository', () => {

    const wrapper = shallowMount();
    fetchMock.postOnce('/api/configuration_script_sources/', {});
    const spy = jest.spyOn(API, 'post');
    wrapper.instance().submitForm({name: '',
    description: '',
    scm_type: 'git',
    scm_url: '',
    authentication_id: null,
    scm_branch: '',
    scm_clean: false,
    scm_delete_on_update: false,
    scm_update_on_launch: false,});

    expect(spy).toHaveBeenCalled;
      
  });
  it('should allow you to update a repository', () => {
    const repoId = '1234';
    const componentProps = {...initialProps, repoId};
    fetchMock.getOnce('/api/configuration_script_sources/1234', {
      resources: existingRepo
    });
    fetchMock.mock(`/api/configuration_script_sources/${repoId}`, {}, {
      method: 'put',
    });
    const spy = jest.spyOn(API, 'put')
    const wrapper = shallowMount(componentProps);
    
    wrapper.instance().submitForm(existingRepo);
    expect(spy).toHaveBeenCalled; 
  });
  it('should message if it failed to update a repo', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const repoId = '1234';
    const componentProps = {...initialProps, repoId};
    fetchMock.getOnce('/api/configuration_script_sources/1234', {
      resources: existingRepo
    });

    const wrapper = shallowMount(componentProps);
    fetchMock.mock(`/api/configuration_script_sources/${repoId}`,500, {
      method: 'put',
      body: ''
    });

    const spy = jest.spyOn(window,'add_flash');
    window.add_flash = spy;
    wrapper.instance().submitForm(existingRepo);
    wrapper.update();
    setImmediate(() => {
      expect(spy).toHaveBeenCalledWith('Unable to edit Repository. Update failed', 'error');
    });
  });
});
