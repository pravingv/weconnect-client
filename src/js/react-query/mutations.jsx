import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryLog } from '../common/utils/logging';
import { useConnectAppContext } from '../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from './WeConnectQuery';

const useRemoveTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('team-delete', params, METHOD.GET),
    onError: (error) => console.log('error in useRemoveTeamMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-list-retrieve'] }),
  });
};

// Moved to TeamModel.jsx
const useRemoveTeamMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('remove-person-from-team', params, METHOD.GET),
    onError: (error) => console.log('error in useRemoveTeamMemberMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-list-retrieve'] }),
  });
};

const useAddPersonToTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('add-person-to-team', params, METHOD.GET),
    onError: (error) => console.log('error in addPersonToTeamMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-list-retrieve'] }),
  });
};

const useQuestionListSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('question-list-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionListSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['question-list-retrieve'] }),
  });
};

const useQuestionSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('question-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['question-list-retrieve'] }),
  });
};

const useAnswerListSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('answer-list-save', params, METHOD.POST),
    onError: (error) => console.log('error in useAnswerListSaveMutation: ', error),
    onSuccess: () => {
      console.log('useAnswerListSaveMutation onSuccess true');
      // We request a fresh person-list-retrieve because some questionnaire responses get saved to the person table.
      // This can be optimized to be conditional and only request person-list-retrieve for questionnaires that update the person table.
      queryClient.invalidateQueries({ queryKey: ['person-list-retrieve'] });

      queryClient.invalidateQueries({
        queryKey: ['questionnaire-responses-list-retrieve'],
      });
      queryClient.invalidateQueries({ queryKey: ['task-status-list-retrieve'] });
      // TODO BUG: For some reason, neither of these invalidateQueries are causing an immediate re-fetch of the data.
    },
  });
};

const useQuestionnaireSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('questionnaire-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionnaireSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questionnaire-list-retrieve'] }),
  });
};

const useTaskDefinitionSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('task-definition-save', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskDefinitionSaveMutation: ', error),
    // onSuccess: () => queryClient.invalidateQueries('task-status-list-retrieve'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-retrieve'] }),
  });
};

const useTaskGroupTeamLinkDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params) => weConnectQueryFn('task-group-team-link-delete', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskGroupTeamLinkDeleteMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-team-link-list-retrieve'] }),
  });
};

const useTaskGroupTeamLinkSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params) => weConnectQueryFn('task-group-team-link-save', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskGroupTeamLinkSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-team-link-list-retrieve'] }),
  });
};

const useTaskGroupSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params) => weConnectQueryFn('task-group-save', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskGroupSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-retrieve'] }),
  });
};

const useMeetingSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('meeting-save', params, METHOD.GET),
    onError: (error) => console.log('error in useMeetingSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meeting-list-retrieve'] }),
  });
};

const usePersonAwaySaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-away-save', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonAwaySaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['person-away-list-retrieve'] }),
  });
};

// Copied to /models/PersonModel.jsx with a non-conflicting function name
const usePersonSaveMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-save', params, METHOD.GET),
    onError: (error) => console.log('error in personSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-list-retrieve'] }),
  });
};

const useSaveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestParams) => weConnectQueryFn('task-save', requestParams, METHOD.GET),
    onError: (error) => console.log('error in useSaveTaskMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-status-list-retrieve'] }).then(() => {}),
  });
};

const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => weConnectQueryFn('logout', {}, METHOD.POST),
    onError: (error) => console.log('error in useLogoutMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-auth'] }),
  });
};

const useGetAuthMutation = () => {
  console.log('entry to useGetAuthMutation');
  return useMutation({
    mutationFn: () => weConnectQueryFn('get-auth', {}, METHOD.POST),
    onError: (error) => console.log('error in useGetAuthMutation: ', error),
    onSuccess: (auth) => reactQueryLog('useGetAuthMutation called to force refresh', auth),
  });
};

// eslint-disable-next-line arrow-body-style
const usePasswordSaveMutation = () => {
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('save-password', params, METHOD.PUT),
    onError: (error) => console.log('error in usePasswordSaveMutation: ', error),
    onSuccess: (data, variables, context) => reactQueryLog('usePasswordSaveMutation successful, returning', data, variables, context),
  });
};

const usePersonRetrieveMutation = () => {
  const { setAppContextValue } = useConnectAppContext();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-retrieve', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonRetrieveMutation: ', error),
    onSuccess: (data, variables, context) => {
      reactQueryLog('usePersonRetrieveMutation successful, returning', data, variables, context);
      const person = { ...data };
      if (person && person.personId) {
        person.personId = person.id;    // Initialize legacy (redundant) 'personId' field, which is not in the database
      }
      setAppContextValue('authenticatedPerson', person);
    },
  });
};

const usePersonRetrieveByEmailMutation = () => {
  const { setAppContextValue } = useConnectAppContext();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-retrieve-by-email', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonRetrieveByEmailMutation: ', error),
    onSuccess: (data, variables, context) => {
      reactQueryLog('usePersonRetrieveByEmailMutation successful, returning', data, variables, context);
      const person = { ...data };
      if (person && person.id) {
        person.personId = person.id;    // Initialize legacy (redundant) 'personId' field, which is not in the database
      }
      setAppContextValue('authenticatedPerson', person);
    },
  });
};


export {
  useAddPersonToTeamMutation, useAnswerListSaveMutation, useGetAuthMutation,
  useLogoutMutation, useMeetingSaveMutation, usePasswordSaveMutation,
  usePersonAwaySaveMutation, usePersonSaveMutation,
  usePersonRetrieveMutation, usePersonRetrieveByEmailMutation,
  useQuestionListSaveMutation, useQuestionnaireSaveMutation,
  useQuestionSaveMutation,
  useRemoveTeamMutation, useRemoveTeamMemberMutation,
  useSaveTaskMutation,
  useTaskDefinitionSaveMutation,
  useTaskGroupSaveMutation,
  useTaskGroupTeamLinkDeleteMutation, useTaskGroupTeamLinkSaveMutation,
};

