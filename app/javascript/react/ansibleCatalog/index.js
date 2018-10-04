import { bindActionCreators, combineReducers } from 'redux';
import { connect } from 'react-redux';
import * as catalogActions from './catalogActions';

import AnsibleCatalogItemForm from './ansibleCatalogItemForm';

const actions = { ...catalogActions };
const mapDispatchToProps = dispatch => bindActionCreators(actions, dispatch);
const mapStateToProps = state => ({
  ansibleCatalog: state.ansibleCatalog || {},
});

export default connect(mapStateToProps, mapDispatchToProps)(AnsibleCatalogItemForm);
