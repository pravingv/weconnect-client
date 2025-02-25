import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useConnectAppContext } from '../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from './WeConnectQuery';

const useRemoveTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('team-delete', params, METHOD.GET),
    onError: (error) => console.log('error in useRemoveTeamMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('team-list-retrieve'),
  });
};

// Moved to TeamModel.jsx
const useRemoveTeamMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('remove-person-from-team', params, METHOD.GET),
    onError: (error) => console.log('error in useRemoveTeamMemberMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('team-list-retrieve'),
  });
};

const useAddPersonToTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('add-person-to-team', params, METHOD.GET),
    onError: (error) => console.log('error in addPersonToTeamMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('team-list-retrieve'),
  });
};

const useQuestionSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('question-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('question-list-retrieve'),
  });
};

const useAnswerListSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('answer-list-save', params, METHOD.GET),
    onError: (error) => console.log('error in useAnswerListSaveMutation: ', error),
    onSuccess: () => {
      // We request a fresh person-list-retrieve because some questionnaire responses get saved to the person table.
      // This can be optimized to be conditional and only request person-list-retrieve for questionnaires that update the person table.
      queryClient.invalidateQueries('person-list-retrieve');
      queryClient.invalidateQueries('questionnaire-responses-list-retrieve');
    },
  });
};

const useQuestionnaireSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('questionnaire-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionnaireSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('questionnaire-list-retrieve'),
  });
};

const useTaskDefinitionSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('task-definition-save', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskDefinitionSaveMutation: ', error),
    // onSuccess: () => queryClient.invalidateQueries('task-status-list-retrieve'),
    onSuccess: () => queryClient.invalidateQueries('task-group-retrieve'),
  });
};

const useGroupSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params) => weConnectQueryFn('task-group-save', params, METHOD.GET),
    onError: (error) => console.log('error in useGroupSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('task-group-retrieve'),
  });
};

const usePersonAwaySaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-away-save', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonAwaySaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('person-away-list-retrieve'),
  });
};

// Moved to /models/PersonModel.jsx with a non-conflicting function name
const usePersonSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-save', params, METHOD.GET),
    onError: (error) => console.log('error in personSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('team-list-retrieve'),
  });
};

const usePersonSaveForAuthMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-save', params, METHOD.GET),
    onError: (error) => console.log('error in personSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('get-auth'),
  });
};

const useSaveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestParams) => weConnectQueryFn('task-save', requestParams, METHOD.GET),
    onError: (error) => console.log('error in useSaveTaskMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('task-status-list-retrieve').then(() => {}),
  });
};

const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => weConnectQueryFn('logout', {}, METHOD.POST),
    onError: (error) => console.log('error in useLogoutMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries('get-auth'),
  });
};

const useGetAuthMutation = () => {
  console.log('entry to useGetAuthMutation');
  return useMutation({
    mutationFn: () => weConnectQueryFn('get-auth', {}, METHOD.POST),
    onError: (error) => console.log('error in useGetAuthMutation: ', error),
    onSuccess: () => console.log('useGetAuthMutation called to force refresh'),
  });
};

const usePersonRetrieveMutation = () => {
  console.log('entry to useGetPersonMutation');
  const { setAppContextValue } = useConnectAppContext();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-retrieve', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonRetrieveMutation: ', error),
    onSuccess: (data, variables, context) => {
      console.log('usePersonRetrieveMutation successful, returning', data, variables, context);
      setAppContextValue('authenticatedPerson', data);
    },
  });
};

const usePersonRetrieveByEmailMutation = () => {
  console.log('entry to useGetPersonMutation');
  const { setAppContextValue } = useConnectAppContext();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-retrieve-by-email', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonRetrieveByEmailMutation: ', error),
    onSuccess: (data, variables, context) => {
      console.log('usePersonRetrieveByEmailMutation successful, returning', data, variables, context);
      setAppContextValue('authenticatedPerson', data);
    },
  });
};


export { useRemoveTeamMutation, useRemoveTeamMemberMutation, useAddPersonToTeamMutation,
  useQuestionnaireSaveMutation, useTaskDefinitionSaveMutation, useGroupSaveMutation,
  usePersonAwaySaveMutation,
  useQuestionSaveMutation, usePersonSaveMutation, usePersonSaveForAuthMutation, useSaveTaskMutation, useAnswerListSaveMutation,
  useLogoutMutation, useGetAuthMutation, usePersonRetrieveMutation, usePersonRetrieveByEmailMutation };

