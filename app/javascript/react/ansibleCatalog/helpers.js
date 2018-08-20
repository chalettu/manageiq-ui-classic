import React from 'react';
import { Field } from 'react-final-form';
import { PLAYBOOK_OPTIONS } from './constants';

export const buildDropDown = (data, label, value) => {
  if (data) return data.map(item => ({ label: item[label], value: item[value] }));
  return [];
};

export const renderFormField = (field) => {
  const id = (field.id ? field.id : field.name);
  return (
    <Field key={id} inputColumnSize={8} labelColumnSize={3} {...field} />
  );
};

export const getResourceOptions = (values) => {
  if (values.retirement_playbook_id) {
    return PLAYBOOK_OPTIONS;
  }

  return [
    { label: __('No'), value: 'no_without_playbook' },
    { label: __('Yes'), value: 'yes_without_playbook' },
  ];
};
