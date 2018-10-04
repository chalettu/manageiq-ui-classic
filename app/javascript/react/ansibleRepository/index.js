import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as repositoryActions from './repositoryActions';
import AnsibleRepositoryForm from './ansibleRepositoryForm';

const mapStateToProps = state => ({
  ansibleRepository: state.ansibleRepository || {},
  });
  const actions = { ...repositoryActions };
  const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapDispatchToProps)(AnsibleRepositoryForm);
