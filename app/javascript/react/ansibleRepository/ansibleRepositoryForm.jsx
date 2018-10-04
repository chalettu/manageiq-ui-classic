import React from 'react';
//Implement cancel
//implement save
//implement reset
//implement edit
import { Form, Field } from 'react-final-form';
import { Form as PfForm, Spinner } from 'patternfly-react';
import {repositoryReducer} from './repositoryReducer';
import { combineReducers } from 'redux';
import FormButtons from '../../forms/form-buttons';
import { API } from '../../http_api';
import PropTypes from 'prop-types';
import { required, url } from 'redux-form-validators';

import {
  FinalFormField,
  FinalFormSelect,
  FinalFormCheckBox,
 } from '@manageiq/react-ui-components/dist/forms';

export class AnsibleRepositoryForm extends React.Component {
  constructor (props) {
    super(props);
    ManageIQ.redux.addReducer(combineReducers({ ansibleRepository: repositoryReducer }));
    this.state = {
      initialValues: this.setupDefaults(),
      isLoading: false,
      isNew: props.repoId === null,
      managerResource: null,
    };
  }
  componentDidMount() {
    const { loadCredentials, loadManagerResource, loadRepo, repoId } = this.props;
    const { isNew, initialValues } = this.state;
    if (isNew) {
      loadManagerResource().then(() => {
        if (this.props.ansibleRepository.managerResource.length) {
          this.setState({ managerResource: this.props.ansibleRepository.managerResource[0].href });
        } else {
          //error
        }
      });
    } else {
      loadRepo(repoId).then(() => {
        this.setState({ initialValues: { ...initialValues, ...this.props.ansibleRepository.repo } });
      });
    }
    loadCredentials();
  }
  setupDefaults() {
    return {
      name: '',
      description: '',
      scm_type: 'git',
      scm_url: '',
      authentication_id: null,
      scm_branch: '',
      scm_clean: false,
      scm_delete_on_update: false,
      scm_update_on_launch: false,
    };
  }
  setupFields () {
    const { managerResource } = this.state;
    const {  credentials } = this.props.ansibleRepository;
    return [
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
        component: FinalFormSelect,
        name: 'scm_type',
        label: __('SCM Type'),
        options: [ {label: 'GIT', value: 'git'}],
        disabled: true,
      },
      {
        component: FinalFormField,
        name: 'scm_url',
        label: __('URL'),
        validateOnMount: true,
        validate: url({ msg: __('Required') })
      },
      {
        component: FinalFormSelect,
        name: 'authentication_id',
        label: __('SCM credentials'),
        options: credentials || [],
        disabled: !managerResource,
        placeholder: __('Select credentials')
      },
      {
        component: FinalFormField,
        name: 'scm_branch',
        label: __('SCM Branch'),
      },
    ];
  }
  submitForm = (values) => {
    const { repoId } = this.props;
    const { isNew, managerResource } = this.state;
    const mode = isNew ? __('Add'): 'Edit';

    const successMessage = sprintf(__(`${mode} of Repository "%s" was successfully initiated.`), values.name);
    if (isNew) {
      API.post('/api/configuration_script_sources/', {...values, manager_resource: managerResource}).then((data) => {
       window.add_flash(successMessage, 'success');
      });
    } else {
      API.put(`/api/configuration_script_sources/${repoId}`, {...values,href:undefined }).then((data) =>{
        window.add_flash(successMessage, 'success');
      }).catch(error => {
        if (!error.data) {
          error.data = { // eslint-disable-line no-param-reassign
            error: { message: __('Update failed') },
          };
        }
        window.add_flash(`${__('Unable to edit Repository')}. ${error.data.error.message}`, 'error');
      });
    }
  }
  render() {
    const { isLoading, initialValues, isNew } = this.state;
    const formFields = this.setupFields();
    const handleCancel = () => {
      window.location.href = '/ansible_repository/show_list';
    };
    return (isLoading ? (<Spinner loading size="lg" />) :
      (<Form
        initialValues={initialValues}
        onSubmit={this.submitForm}
        render={({ invalid,
          values,
          submitting,
          pristine,
          handleSubmit,
          form: { change, reset } }) => (
            <PfForm horizontal onSubmit={handleSubmit}>
              <div id="flash_msg_div" />
              {
                formFields.map(field =>
                  <Field key={field.name} inputColumnSize={8} labelColumnSize={3} {...field} />
                )
              }
              <div className="form-group">
                <label className="col-xs-3 control-label">
                  {__('SCM Update Options')}
                </label>
                <div className="col-xs-8 scm_checkboxes">
                  <Field
                    component={FinalFormCheckBox}
                    name="scm_clean"
                    type='checkbox'
                    label={__('Clean')}
                  />
                  <Field
                    component={FinalFormCheckBox}
                    name="scm_delete_on_update"
                    type='checkbox'
                    label={__('Delete on Update')}
                  />
                  <Field
                    component={FinalFormCheckBox}
                    name="scm_update_on_launch"
                    type='checkbox'
                    label={__('Update on launch')}
                  />
                </div>
              </div>
              <FormButtons
                newRecord={isNew}
                saveable={!invalid && !submitting}
                saveClicked={handleSubmit}
                addClicked={handleSubmit}
                resetClicked={reset}
                cancelClicked={handleCancel}
                pristine={pristine}
              />
            </PfForm>
              )
        }>
        </Form>
        )
      )
    }
  }

AnsibleRepositoryForm.propTypes = {
  ansibleRepository: PropTypes.shape({}).isRequired,
  loadCredentials: PropTypes.func.isRequired,
  loadManagerResource: PropTypes.func.isRequired,
  loadRepo: PropTypes.func.isRequired,
  repoId: PropTypes.string,
};

AnsibleRepositoryForm.defaultProps = {
  repoId: null
};
export default AnsibleRepositoryForm;
