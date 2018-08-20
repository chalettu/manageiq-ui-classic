export const LOGGING_OUTPUT_OPTIONS = [
  { label: __('On Error'), value: 'on_error' },
  { label: __('Always'), value: 'always' },
  { label: __('Never'), value: 'never' },
];
export const VERBOSITY_OPTIONS = [
  { label: __('0 (Normal)'), value: 0 },
  { label: __('1 (Verbose)'), value: 1 },
  { label: __('2 (More Verbose)'), value: 2 },
  { label: __('3 (Debug)'), value: 3 },
  { label: __('4 (Connection Debug)'), value: 4 },
  { label: __('5 (WinRM Debug)'), value: 5 },
];
export const ANSIBLE_FIELDS = ['repository_id',
  'playbook_id', 'credential_id', 'vault_credential_id',
  'cloud_type', 'cloud_credential_id', 'execution_ttl', 'hosts',
  'become_enabled', 'verbosity', 'log_output', 'extra_vars'];

export const PLAYBOOK_OPTIONS = [
  { label: __('No'), value: 'no_with_playbook' },
  { label: __('Before Playbook runs'), value: 'pre_with_playbook' },
  { label: __('After Playbook runs'), value: 'post_with_playbook' },
];
export const DEFAULT_PLACEHOLDER = __('<Choose>');
