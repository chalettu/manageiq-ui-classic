import React from 'react';
import PropTypes from 'prop-types';
import { Field } from 'react-final-form';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as catalogActions from './catalogActions';
import { required } from 'redux-form-validators';
import { FieldArray } from 'react-final-form-arrays';
import { Button } from 'patternfly-react';
import { LOGGING_OUTPUT_OPTIONS, VERBOSITY_OPTIONS, DEFAULT_PLACEHOLDER } from './constants';
import { FinalFormSelect, FinalFormTextArea, FinalFormField, FinalFormSwitch } from '@manageiq/react-ui-components/dist/forms';
import { renderFormField } from './helpers';

export class AnsiblePlaybookFields extends React.Component {
  constructor(props) {
    super(props);
    const { formValues, prefix } = this.props;
    this.state = {
      isProvisioning: (prefix === 'provisioning' ? true : false),
      repoId: formValues[`${prefix}_repository_id`]
    }
  }
  componentDidMount() {
    const { formValues, prefix } = this.props;
    if (formValues[`${prefix}_cloud_type`]) {
      this.updateCloudCredentialsList(formValues[`${prefix}_cloud_type`]);
    }
    if (this.state.repoId) {
      this.updatePlaybookList();
    }
  }
  updatePlaybookList() {
    const { region, loadPlaybooks, prefix } = this.props;
    const { repoId } = this.state;
    if (!repoId) {
      return;
    }
    loadPlaybooks(region, repoId, prefix);
  }
  updateCloudCredentialsList(cloudType) {
    const { loadCloudCredentials, prefix } = this.props;
    loadCloudCredentials(prefix, cloudType);
  }
  render() {
    const { prefix, data, changeField, addExtraVars, children, formValues } = this.props;
    const { isProvisioning } = this.state;
    const dropdowns = data.dropdowns || {};
    const formFields = [
      {
        name: `${prefix}_playbook_id`,
        label: __('Playbook'),
        component: FinalFormSelect,
        options: dropdowns[`${prefix}_playbooks`] || [],
        placeholder: DEFAULT_PLACEHOLDER,
        validateOnMount: isProvisioning,
        validate: isProvisioning ? required({ msg: __('Required') }) : undefined
      },
      {
        name: `${prefix}_credential_id`,
        label: __('Machine Credential'),
        component: FinalFormSelect,
        options: dropdowns.machineCredentials || [],
        placeholder: DEFAULT_PLACEHOLDER,
        validateOnMount: isProvisioning,
        validate: isProvisioning ? required({ msg: __('Required') }) : undefined
      },
      {
        name: `${prefix}_vault_credential_id`,
        label: __('Vault Credential'),
        component: FinalFormSelect,
        options: dropdowns.vaultCredentials || [],
        placeholder: DEFAULT_PLACEHOLDER
      },
      {
        name: `${prefix}_hosts`,
        label: __('Hostnames'),
        component: FinalFormTextArea
      },
      {
        name: `${prefix}_execution_ttl`,
        label: __('Max TTL (mins)'),
        component: FinalFormField
      },
      {
        name: `${prefix}_log_output`,
        label: __('Logging Output'),
        component: FinalFormSelect,
        options: LOGGING_OUTPUT_OPTIONS,
        placeholder: DEFAULT_PLACEHOLDER
      },
      {
        name: `${prefix}_become_enabled`,
        component: FinalFormSwitch,
        label: __('Escalate Privileges'),
        onText: __('Yes'),
        offText: __('No'),
      },
      {
        name: `${prefix}_verbosity`,
        label: __('Verbosity'),
        component: FinalFormSelect,
        options: VERBOSITY_OPTIONS,
        placeholder: DEFAULT_PLACEHOLDER
      }
    ];
    return (
      <div className="row">
        <div className="col-md-12 col-lg-6">
          <Field
            label={__('Repository')}
            name={`${prefix}_repository_id`}
            validateOnMount={isProvisioning}
            validate={isProvisioning ? required({ msg: __('Required') }) : undefined}
            render={({ input, meta }) =>
              <FinalFormSelect
                inputColumnSize={8}
                labelColumnSize={3}
                name={`${prefix}_repository_id`}
                searchable={true}
                options={dropdowns.repos || []}
                placeholder={DEFAULT_PLACEHOLDER}
                validateOnMount={isProvisioning}
                validate={isProvisioning ? required({ msg: __('Required') }) : undefined}
                label={__('Repository')}
                input={{
                  ...input, onChange: value => {
                    if (value) {
                      this.setState({ repoId: value }, this.updatePlaybookList);
                      changeField(`${prefix}_playbook_id`, '');
                    }
                    input.onChange(value)
                  }
                }}
                meta={meta}
              />}
          />
          {
            formFields.map(field => renderFormField(field))
          }
          <Field
            name={`${prefix}_cloud_type`}
            label={__('Cloud Type')}
            render={({ input, meta }) =>
              <FinalFormSelect
                inputColumnSize={8}
                labelColumnSize={3}
                name={`${prefix}_cloud_type`}
                options={dropdowns.cloudTypes || []}
                label={__('Cloud Type')}
                placeholder={DEFAULT_PLACEHOLDER}
                input={{
                  ...input, onChange: value => {
                    if (value) {
                      this.updateCloudCredentialsList(value);
                    }
                    input.onChange(value)
                  }
                }}
                meta={meta}
              />}
          />
          <Field
            inputColumnSize={8}
            labelColumnSize={3}
            name={`${prefix}_cloud_credential_id`}
            label={__('Cloud Credentials')}
            component={FinalFormSelect}
            options={dropdowns[`${prefix}_cloudCredentials`] || []}
            placeholder={DEFAULT_PLACEHOLDER}
          />
        </div>
        <div className="col-md-12 col-lg-6">
          <div className="form-group">
            <label className="control-label col-xs-2">
              {__('Variables & Default Values')}
            </label>
            <div className="col-xs-8">
              <div>
                <Button
                  type="button"
                  bsStyle="primary"
                  onClick={() => addExtraVars(`${prefix}_extra_vars`, undefined)}>
                  {__('Add')}
                </Button>
              </div>
              {
                formValues[`${prefix}_extra_vars`].length ? (
                  <table className="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>{__('Variable')}</th>
                        <th>{__('Default')}</th>
                        <th>{__('Action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <FieldArray name={`${prefix}_extra_vars`}>
                        {({ fields }) =>
                          fields.map((name, index) => (
                            <tr key={name}>
                              <td>
                                <Field
                                  name={`${name}.key`}
                                  component="input"
                                  placeholder={__('Variable')}
                                />
                              </td>
                              <td>
                                <Field
                                  name={`${name}.default`}
                                  component="input"
                                  placeholder={__('Default Value')}
                                />
                              </td>
                              <td>
                                <button className="btn btn-link" type="button">
                                  <span
                                    onClick={() => fields.remove(index)}
                                    className="pficon pficon-delete">
                                  </span>
                                </button>
                              </td>
                            </tr>
                          ))}
                      </FieldArray>
                    </tbody>
                  </table>
                ) : ''
              }
            </div>
          </div>
          {children}
        </div>
      </div>
    )
  }
}

AnsiblePlaybookFields.propTypes = {
  region: PropTypes.number,
  prefix: PropTypes.string,
  loadPlaybooks: PropTypes.func.isRequired,
  loadCloudCredentials:  PropTypes.func.isRequired,
  formValues: PropTypes.shape({}).isRequired,
  changeField: PropTypes.func.isRequired,
  addExtraVars: PropTypes.func.isRequired,
  children: PropTypes.node
};
const mapStateToProps = state => ({
  data: state.ansibleCatalog || {},
});
const actions = { ...catalogActions };
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AnsiblePlaybookFields);
