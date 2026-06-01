import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reactQueryLog, renderLog } from '../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import weConnectQueryFn, { METHOD } from './WeConnectQuery';

const useRemoveTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('team-delete', params, METHOD.GET),
    onError: (error) => console.log('error in useRemoveTeamMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-list-retrieve']}),
  });
};

// Moved to TeamModel.jsx
const useRemoveTeamMemberMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('remove-person-from-team', params, METHOD.GET),
    onError: (error) => console.log('error in useRemoveTeamMemberMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-list-retrieve']}),
  });
};

const useAddPersonToTeamMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('add-person-to-team', params, METHOD.GET),
    onError: (error) => console.log('error in addPersonToTeamMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['team-list-retrieve']}),
  });
};

const useProfileChangeLogRetrieveMutation = () => useMutation({
  mutationFn: (params) => weConnectQueryFn('profile-change-log-retrieve', params, METHOD.GET),
  onError: (error) => console.log('error in profileChangeLogRetrieve: ', error),
  onSuccess: (data) => {
    renderLog('useProfileChangeLogRetrieveMutation onSuccess');
    // If the backend returns success: false, you might want to log it here
    if (data && !data.success) {
      console.log('Backend returned success:false for logs:', data.status);
    }
  },
});

const useQuestionListSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('question-list-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionListSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['question-list-retrieve']}),
  });
};

const useQuestionSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('question-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['question-list-retrieve']}),
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
      queryClient.invalidateQueries({ queryKey: ['person-list-retrieve']});

      queryClient.invalidateQueries({
        queryKey: ['questionnaire-responses-list-retrieve'],
      });
      queryClient.invalidateQueries({ queryKey: ['task-status-list-retrieve']});
      // TODO BUG: For some reason, neither of these invalidateQueries are causing an immediate re-fetch of the data.
    },
  });
};

const useQuestionnaireSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('questionnaire-save', params, METHOD.GET),
    onError: (error) => console.log('error in useQuestionnaireSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['questionnaire-list-retrieve']}),
  });
};

const useTaskDefinitionSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('task-definition-save', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskDefinitionSaveMutation: ', error),
    // onSuccess: () => queryClient.invalidateQueries('task-status-list-retrieve'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-retrieve']}),
  });
};

const useTaskGroupTeamLinkDeleteMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params) => weConnectQueryFn('task-group-team-link-delete', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskGroupTeamLinkDeleteMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-team-link-list-retrieve']}),
  });
};

const useTaskGroupTeamLinkSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params) => weConnectQueryFn('task-group-team-link-save', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskGroupTeamLinkSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-team-link-list-retrieve']}),
  });
};

const useTaskGroupSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (params) => weConnectQueryFn('task-group-save', params, METHOD.GET),
    onError: (error) => console.log('error in useTaskGroupSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-group-retrieve']}),
  });
};

const useMeetingSaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('meeting-save', params, METHOD.GET),
    onError: (error) => console.log('error in useMeetingSaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meeting-list-retrieve']}),
  });
};

const usePersonAwaySaveMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-away-save', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonAwaySaveMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['person-away-list-retrieve']}),
  });
};

const usePersonSaveMutation = () => {
  const queryClient = useQueryClient();
  const { apiDataCache } = useConnectAppContext();
  const dispatch = useConnectDispatch();
  // console.log('mutations usePersonSaveMutation called');

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-save', params, METHOD.GET),
    onError: (error) => console.log('error in personSaveMutation: ', error),
    onSuccess: (results) => {
      // console.log('PersonModel person-save onSuccess true, results: ', results);
      queryClient.invalidateQueries({ queryKey: ['team-list-retrieve']});

      const { allPeopleCache } = apiDataCache;
      const allPeopleCacheNew = { ...allPeopleCache };
      // console.log('useGetPersonById personId:', personId, ', allPeopleCacheNew:', allPeopleCacheNew);
      if (results.success === false) {
        console.log('usePersonSaveMutation onSuccess failed results:', results);
      } else if (results.personId >= 0) {
        // console.log('usePersonSave personId:', results.personId, ', results: ', results);
        allPeopleCacheNew[results.personId] = results;
        dispatch({ type: 'updateByKeyValue', key: 'allPeopleCache', value: allPeopleCacheNew });
        // For some reason, after this dispatch, the new person values appear and then there is an immediate roll-back to the previous person values.

        // We use this to counteract the roll back to the previous person values.
        queryClient.refetchQueries({ queryKey: ['person-list-retrieve'], refetchType: 'active', exact: true, force: true })
          // .then(() => console.log('userPersonSaveMutation person-list-retrieve refetch completed'))
          .catch((error) => console.error('userPersonSaveMutation person-list-retrieve refetch failed:', error));
      } else {
        console.log('usePersonSaveMutation personId not >= 0:', results);
      }
    },
  });
};

const usePersonDeleteMutation = () => {
  const queryClient = useQueryClient();
  const { setAppContextValue } = useConnectAppContext();

  return useMutation({
    mutationFn: (params) => weConnectQueryFn('person-delete', params, METHOD.GET),
    onError: (error) => console.log('error in usePersonDeleteMutation: ', error),
    onSuccess: (results) => {
      console.log('usePersonDeleteMutation onSuccess, results:', results);
      if (results.success === true) {
        // Invalidate person list to refresh the list after deletion
        queryClient.invalidateQueries({ queryKey: ['person-list-retrieve']});
        queryClient.invalidateQueries({ queryKey: ['team-list-retrieve']});
        // Close the profile drawer
        setAppContextValue('headerProfileDrawerOpen', false);
        setAppContextValue('profileDrawerPerson', undefined);
        setAppContextValue('profileDrawerPersonId', -1);
      } else {
        console.log('usePersonDeleteMutation onSuccess but success flag is false:', results);
      }
    },
  });
};

const useSaveTaskMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestParams) => weConnectQueryFn('task-save', requestParams, METHOD.GET),
    onError: (error) => console.log('error in useSaveTaskMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['task-status-list-retrieve']}).then(() => {}),
  });
};

const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => weConnectQueryFn('logout', {}, METHOD.POST),
    onError: (error) => console.log('error in useLogoutMutation: ', error),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-auth']}),
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
  usePersonAwaySaveMutation, usePersonDeleteMutation, usePersonSaveMutation,
  usePersonRetrieveMutation, usePersonRetrieveByEmailMutation,
  useQuestionListSaveMutation, useQuestionnaireSaveMutation,
  useQuestionSaveMutation,
  useRemoveTeamMutation, useRemoveTeamMemberMutation,
  useSaveTaskMutation,
  useTaskDefinitionSaveMutation,
  useTaskGroupSaveMutation,
  useTaskGroupTeamLinkDeleteMutation, useTaskGroupTeamLinkSaveMutation,
  useProfileChangeLogRetrieveMutation,
};

