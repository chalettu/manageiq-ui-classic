import React from 'react';
import { shallow, mount } from 'enzyme';
import toJson from 'enzyme-to-json';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PropTypes from 'prop-types';
import {reduxStore, sampleForm} from './test.fixtures'
import AnsibleCatalogItemForm from './';
import {AnsibleCatalogItemForm as AnsibleCatalogItemForm1} from './ansibleCatalogItemForm';
import fetchMock from 'fetch-mock';

describe('Ansible catalog item form component', () => {
  const mockStore = configureStore([thunk]);
  const shallowMount = () => {
    return shallow(<AnsibleCatalogItemForm {...initialProps} />,
      {
        context: { store: store },
        childContextTypes: { store: PropTypes.object.isRequired }
      }
    ).dive();
  }
  let store;
  let initialProps;

  beforeEach(() => {
    store = mockStore({
      ansibleCatalog: {
        ...reduxStore
      },
    });
    initialProps = {
     loadCatalogs: jest.fn(),
     loadDialogs: jest.fn(),
     loadRepos: jest.fn(),
     loadCatalogItem: jest.fn(),
     loadPlaybooks: jest.fn(),
     loadCredentials: jest.fn(),
     loadCloudTypes: jest.fn(),
     loadCloudCredential: jest.fn(),
     duplicateDropdowns: jest.fn(),
     region: 10
    };
  });
  afterEach(() => {
    fetchMock.reset();
    fetchMock.restore();
  });
  it('should render correctly', () => {
    const wrapper = mount(<AnsibleCatalogItemForm {...initialProps} />,
      {
        context: { store: store },
        childContextTypes: { store: PropTypes.object.isRequired }
      }
    );
    expect(toJson(wrapper)).toMatchSnapshot();
  });

  it('should populate form default values', () => {
    const wrapper = shallowMount();
    const initialValues = wrapper.instance().setFormDefaultValues();
    expect(initialValues).toMatchSnapshot();
  });
  it('should format extra vars', () => {
    const wrapper = shallowMount();
    const formattedValues = wrapper.instance().formatExtraVars({
      testvalue1: {
        default: 1
      },
      testValue2: {
        default: 2
      }
    });
    expect(formattedValues).toMatchSnapshot();
  });
  it('should build an extra vars object', () => {
    const wrapper = shallowMount();
    const formattedValues = wrapper.instance().buildExtraVarsObj([
      {
        key: 'test',
        default: 'test'
      },
      {
        key: 'test2',
        default: 'test2'
      },
    ]);
    expect(formattedValues).toMatchSnapshot();
  });
  it('should allow a catalog item to be edited', () => {
    const catalogItemId = 1234;

    const loadCatalogItem = jest.fn((catalogItemId) => {
      return Promise.resolve({});
    });
    const loadCredential = jest.fn(() => {
      return Promise.resolve({});
    });
    const wrapper = mount(<AnsibleCatalogItemForm1 {...initialProps}
      ansibleCatalog={{ ...reduxStore }} loadCatalogItem={loadCatalogItem}
      loadCloudCredential={loadCredential}
      catalogItemFormId={catalogItemId} />,
      {
        context: { store: store },
        childContextTypes: { store: PropTypes.object.isRequired }
      }
    );
    expect(loadCatalogItem).toHaveBeenCalledWith(1234);
  });
  it('should set default values when a catalog item is being edited', () => {
    const catalogItemId = 1234;

    store = mockStore({
      ansibleCatalog: {
        ...reduxStore
      },
    });
     const loadCatalogItem = jest.fn((catalogItemId) =>{
       return Promise.resolve({});
     });
     const loadCredential =  jest.fn(() => {
      return Promise.resolve({});
    });
    const loadPlaybooks = jest.fn(() => {
      return Promise.resolve({});
    });
    delete(initialProps.loadCatalogItem);
    delete(initialProps.loadCloudCredential);
    delete(initialProps.loadPlaybooks);
    const wrapper = mount(<AnsibleCatalogItemForm1 {...initialProps}
      ansibleCatalog={{...reduxStore}} loadCatalogItem={loadCatalogItem}
      loadCloudCredential={loadCredential}
      loadPlaybooks={loadPlaybooks}
      catalogItemFormId={catalogItemId} />
    ,{
      context: { store: store },
      childContextTypes: { store: PropTypes.object.isRequired }
    });

     expect(loadCatalogItem).toHaveBeenCalledWith(1234);
     expect(loadCredential).toHaveBeenCalled;
     wrapper.update();
     setImmediate(() => {
      const formValues = wrapper.state().initialValues;
      expect(formValues).toEqual(sampleForm);
     });
  });
  it('should allow a form to be submitted', () => {
    const wrapper = shallowMount();
    fetchMock.postOnce('/api/service_templates/', {});
    const values = {
      name: 'test',
      description: '',
      long_description: '',
      service_template_catalog_id: '',
      provisioning_extra_vars:[],
      retirement_extra_vars:[]
    };
    wrapper.instance().submitForm(values);
    expect(fetchMock.called('/api/service_templates/')).toBe(true);
  });
  it('should report an error if submitting failed', () => {
    // eslint-disable-next-line no-console
    console.error = jest.fn();
    const spy = jest.spyOn(window,'add_flash');
    window.add_flash = spy;
    const wrapper = shallowMount();
    fetchMock.mock('/api/service_templates/', {
      body: '',
      status: 500
    });
    const values = {
      name: 'test',
      description: '',
      long_description: '',
      service_template_catalog_id: '',
      provisioning_extra_vars:[],
      retirement_extra_vars:[]
    };
    wrapper.instance().submitForm(values);
    wrapper.update();
    setImmediate(() => {
      expect(spy).toHaveBeenCalledWith('Catalog item failed to be added. ', 'error');
    });
  });
});
