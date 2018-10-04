import React from 'react';
import { combineReducers } from 'redux';
import { Form, Field } from 'react-final-form';
import { Form as PfForm, Button, TabContainer, TabContent, Spinner, TabPane, Nav, NavItem } from 'patternfly-react';
import AnsiblePlaybookFields from './ansiblePlaybookFields';
import arrayMutators from 'final-form-arrays';
import FormButtons from '../../forms/form-buttons';
import {renderFormField, getResourceOptions} from './helpers';
import {ANSIBLE_FIELDS, DEFAULT_PLACEHOLDER} from './constants';
import reducer from './catalogReducer';
import { API } from '../../http_api';
import PropTypes from 'prop-types';
import {
  FinalFormField,
  FinalFormSelect,
  FinalFormTextArea,
  FinalFormSwitch,
  Condition,
 } from '@manageiq/react-ui-components/dist/forms';
 import { required } from 'redux-form-validators';

export class AnsibleCatalogItemForm extends React.Component {
constructor(props) {
    super(props);
    ManageIQ.redux.addReducer(combineReducers({ ansibleCatalog: reducer }));
    this.state = {
      initialValues: this.setFormDefaultValues(),
      isLoading: true,
      isNew: true
    }
  }
  componentDidMount(){
    const { loadCatalogs, loadDialogs, loadRepos, loadCredentials, loadCloudTypes,
      loadCatalogItem, loadCloudCredential, region, catalogItemFormId } = this.props;
    loadCatalogs();
    loadDialogs();
    loadRepos(region);
    loadCredentials('Machine');
    loadCredentials('Vault');
    loadCloudTypes();
    if (catalogItemFormId){
      this.setState({isNew: false});
      loadCatalogItem(catalogItemFormId).then(() => {
        const {ansibleCatalog} = this.props;
        const {initialValues} = this.state;
        const catalogItem = ansibleCatalog.catalogItem;

        loadCloudCredential(catalogItem.config_info.provision.cloud_credential_id).then(() => {
                    initialValues['provisioning_cloud_type'] = this.props.ansibleCatalog.cloudCredential.type;
                    ['name','description','long_description','service_template_catalog_id'].forEach((field) => {
                      if (catalogItem[field]){
                        initialValues[field] = catalogItem[field];
                      }
                    });
                    ANSIBLE_FIELDS.forEach((field) => {
                     if (catalogItem.config_info.provision[field]){
                       initialValues[`provisioning_${field}`] = catalogItem.config_info.provision[field];
                     }
                     if (catalogItem.config_info.retirement[field]){
                       initialValues[`retirement_${field}`] = catalogItem.config_info.retirement[field];
                     }
                   });
                   initialValues['provisioning_extra_vars'] = this.formatExtraVars(initialValues['provisioning_extra_vars']);
                   initialValues['retirement_extra_vars'] = this.formatExtraVars(initialValues['retirement_extra_vars']);
                   initialValues.dialog_id = (catalogItem.config_info.provision.dialog_id? catalogItem.config_info.provision.dialog_id: '');
                   initialValues.remove_resources = (catalogItem.config_info.retirement.remove_resources ?
                     catalogItem.config_info.retirement.remove_resources : initialValues.remove_resources);
                   this.setState({initialValues, isLoading: false}, this.render);
        });
      });
    } else {
      this.setState({isLoading: false});
    }
  }

  formatExtraVars = (extraVars) => {
   return Object.keys(extraVars).map(key => ({
      key,
      default: extraVars[key].default,
    }))
  };
  
  buildExtraVarsObj = (vars) => {
    const extraVars = {};
    vars.forEach((extraVar) => {
      extraVars[extraVar.key] = { default: extraVar.default };
    });
    return extraVars;
  }

  setFormDefaultValues = ()  => {
    const provisioningFormFields = {
      'repository_id': '',
      'playbook_id': '',
      'credential_id': '',
      'vault_credential_id': '',
      'cloud_type': '',
      'cloud_credential_id': '',
      'execution_ttl': '',
      'hosts': 'localhost',
      'become_enabled': false,
      'verbosity': 0,
      'log_output': 'on_error',
      'extra_vars': []
    };
     const initial = {
      name: '',
      description:'',
      display: false,
      long_description: '',
      service_template_catalog_id: '',
      remove_resources: 'no_without_playbook',
      dialog_id: '',
      dialogOption: 'existing'
    };
    for (var field in provisioningFormFields){
      initial[`provisioning_${field}`] = provisioningFormFields[field];
      initial[`retirement_${field}`] = provisioningFormFields[field];
    }

    return initial;
  }

  submitForm = (values) => {
    const {isNew} = this.state;
    const {catalogItemFormId} = this.props;
    const { name,description,display,long_description, service_template_catalog_id } = values;
    const provisionFields = {};
    const retirementFields = {};

    ANSIBLE_FIELDS.forEach((field) => {
      const isIdField = field.includes('_id');
      
      if (isIdField) { //blank ids passed to api cause failures
        ['provisioning', 'retirement'].forEach(prefix => {
          const value = values[`${prefix}_${field}`];
          if (value) {
            (prefix === 'provisioning' ? provisionFields[field] = value: retirementFields[field] = value);
          }
        });
      } else {
        provisionFields[field] = values[`provisioning_${field}`];
        retirementFields[field] = values[`retirement_${field}`];
      }
    });
    const provision = {
      dialog_id: values['dialog_id'],
      ...provisionFields,
      extra_vars: this.buildExtraVarsObj(provisionFields.extra_vars)
    };
    
    if (values.dialogOption === 'new') {
      provision.new_dialog_name = values.dialog_name;
    }

    const retirement = {
      ...retirementFields,
      extra_vars: this.buildExtraVarsObj(retirementFields.extra_vars),
      remove_resources: values.remove_resources
    };

    const catalogItem = {
      action: (isNew ? 'create': 'edit'),
      resource: {
        name,
        description,
        long_description,
        display,
        service_template_catalog_id,
        prov_type: 'generic_ansible_playbook',
        type: 'ServiceTemplateAnsiblePlaybook',
        config_info: {
            provision,
            retirement
        }
      }
    };
    const url = `/api/service_templates/${!isNew? catalogItemFormId:''}`;
    const msg = isNew ? 'added': 'updated';
    API.post(url, catalogItem).then(result => {
      window.add_flash(__(`Catalog item was ${msg} successfully.`),'success');
    }).catch(error => {
      if (!error.data) {
        error.data = { // eslint-disable-line no-param-reassign
          error: { message: `Catalog item failed to be ${msg}. ${error.message || ''}` },
        };
      }
      window.add_flash(error.data.error.message, 'error');
    });
  }
  render() {
    const {region, ansibleCatalog, duplicateDropdowns} = this.props;
    const dropdowns = ansibleCatalog.dropdowns || {};
    const formMutators = {
      ...arrayMutators,
    copyValues: (args, state, utils) => {
      ANSIBLE_FIELDS.forEach((field) => {
       utils.changeValue(state, `retirement_${field}`, () => state.formState.values[`provisioning_${field}`])
      });
      duplicateDropdowns(['playbooks', 'cloudCredentials']);
    }};
    const formFields = [
      {
        component: FinalFormField,
        name: 'name',
        label: __('Name'),
        validateOnMount: true,
        validate: required({ msg: __('Required') })
      },
      {
        component: FinalFormField,
        name: 'description',
        id: 'description',
        label: __('Description'),
      },
      {
        name: 'display',
        component: FinalFormSwitch,
        label: __('Display in Catalog'),
        onText: __('Yes'),
        offText: __('No'),
      },
      {
        condition: {when: 'display', is: true},
        name: 'long_description',
        label: __('Long Description'),
        component: FinalFormTextArea
      },
      {
        options: dropdowns.catalogs || [],
        label: __('Catalog'),
        component: FinalFormSelect,
        name: 'service_template_catalog_id',
        placeholder: DEFAULT_PLACEHOLDER,
        searchable: true
      }
    ];
  const dialogOptions = [
    {label: __('Use Existing'), value: 'existing'},
    {label: __('Create New'), value: 'new'}
  ];
  const handleCancel = () => {
    $window.location.href = '/catalog/explorer#/';
  };
  const { isLoading, initialValues, isNew } = this.state;
  return (isLoading? ( <Spinner loading size="lg" />) :
    (<Form
      initialValues={initialValues}
      onSubmit={this.submitForm}
      mutators={{
        ...formMutators
      }}
      render={({ invalid,
        values,
        submitting,
        pristine,
        handleSubmit,
        form: { change, reset, mutators: { push, copyValues } } }) => (
        <PfForm horizontal onSubmit={handleSubmit}>
        <div id="flash_msg_div"/>
          {
            formFields.map(fields => {
              if (fields['condition'])
              {
                if (values[fields.condition['when']] !== fields.condition.is) {
                return;
                }
              }
              return renderFormField(fields)
            })
          }
          <TabContainer defaultActiveKey={1} id="ansibleCatalogForm">
            <div>
              <Nav bsClass={'nav nav-tabs nav-tabs-pf'}>
                <NavItem eventKey={1}>
                  {__('Provisioning')}
                </NavItem>
                <NavItem eventKey={2}>
                  {__('Retirement')}
                </NavItem>
              </Nav>
              <TabContent animation>
                <TabPane eventKey={1} mountOnEnter={true} unmountOnExit={true}>
                  <AnsiblePlaybookFields
                    region={region}
                    prefix='provisioning'
                    addExtraVars={push}
                    formValues={values}
                    changeField={change}
                  >
                  <Field
                    options={dialogOptions}
                    label={__('Dialog')}
                    name='dialogOption'
                    component={FinalFormSelect}
                  />
                  <Condition when="dialogOption" is='existing'>
                    <Field
                      name='dialog_id'
                      label={__('Select Dialog')}
                      validateOnMount= {true}
                      validate={required({ msg: __('Required') })}
                      options={dropdowns.dialogs || []}
                      placeholder={DEFAULT_PLACEHOLDER}
                      component={FinalFormSelect}
                    />
                  </Condition>
                  <Condition when="dialogOption" is='new'>
                    <Field
                      name='dialog_name'
                      label={__('New')}
                      component={FinalFormField}
                      validateOnMount={true}
                      validate={value => {
                        if (!value) {
                          return (__('Required'));
                        }
                        const exists = dropdowns.dialogs.find( dialog => dialog.label === value);
                        return (exists ? __('Dialog name exists') : '');
                      }
                      }
                    />
                  </Condition>
                  </AnsiblePlaybookFields>
                </TabPane>
                {/* Retirement tab */}
                <TabPane eventKey={2} mountOnEnter={true}>
                    <div>
                      <div className="col-xs-3" />
                      <div className="col-xs-8 provisioning-copy-button">
                        <Button
                          type="button"
                          bsStyle="primary"
                          onClick={() => copyValues()}>
                          {__('Copy from Provisioning')}
                        </Button>
                      </div>
                    </div>
                  <AnsiblePlaybookFields
                    region={region}
                    prefix='retirement'
                    addExtraVars={push}
                    formValues={values}
                    changeField={change}
                  >
                  <Field
                    name='remove_resources'
                    component={FinalFormSelect}
                    label={__('Remove Resources?')}
                    options={getResourceOptions(values)}
                    placeholder={DEFAULT_PLACEHOLDER}
                  />
                  </AnsiblePlaybookFields>
                </TabPane>
              </TabContent>
            </div>
          </TabContainer>
          <FormButtons
            newRecord={isNew}
            saveable={!invalid && !submitting}
            saveClicked={handleSubmit}
            addClicked={handleSubmit}
            cancelClicked={handleCancel}
            resetClicked={reset}
            pristine={pristine}
          />
        </PfForm>
      )}
    />
  ));
  }
}

AnsibleCatalogItemForm.propTypes = {
ansibleCatalog: PropTypes.shape({}).isRequired,
loadCatalogs: PropTypes.func.isRequired,
loadDialogs: PropTypes.func.isRequired,
loadRepos: PropTypes.func.isRequired,
loadPlaybooks: PropTypes.func.isRequired,
loadCloudCredential: PropTypes.func.isRequired,
loadCredentials: PropTypes.func.isRequired,
loadCloudTypes: PropTypes.func.isRequired,
loadCatalogItem: PropTypes.func.isRequired,
duplicateDropdowns: PropTypes.func.isRequired,
region: PropTypes.number.isRequired,
catalogItemFormId: PropTypes.number
};
AnsibleCatalogItemForm.defaultProps = {
  catalogItemFormId: null
};
export default AnsibleCatalogItemForm;
