export const existingRepo = {
  name: 'Test',
  description: 'test',
  scm_type: 'git',
  scm_url: 'https://github.com/test',
  authentication_id: null,
  scm_branch: 'master',
  scm_clean: false,
  scm_delete_on_update: false,
  scm_update_on_launch: false,
};

export const repositoryActionCredentials = [
  {
    "payload": [{ "id": 1, "name": "test" }],
    "type": "@@manageiq/ansibleCatalogItem/ LOAD_CREDENTIALS"
  }];

export const managerResource =  [
    {
      href: 'http://test.com'
    }
  ];

export const testCredentialRecords = [
  {
    name: 'test',
    id: 1
  }
];
