import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { EditStyled } from '../../components/Style/iconStyles';
import { SpanWithLinkStyle } from '../../components/Style/linkStyles';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import webAppConfig from '../../config';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { captureQuestionnaireListRetrieveData } from '../../models/QuestionnaireModel';
import { captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData } from '../../models/TaskModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import CreateNewGoogleUser from './CreateNewGoogleUser';
import PermissionsAdministration from './PermissionsAdministration';
import UploadCSV from './UploadCSV';


const SystemSettings = ({ classes }) => {
  renderLog('SystemSettings');
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache, allTaskGroupsCache, allQuestionnairesCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);
  const [questionnaireList, setQuestionnaireList] = useState([]);
  const [taskGroupList, setTaskGroupList] = useState([]);
  const [canDoAnythingIsAdmin, setCanDoAnythingIsAdmin] = useState(false);

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, apiDataCache, dispatch]);

  const questionnaireListRetrieveResults = useFetchData(['questionnaire-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (questionnaireListRetrieveResults) {
      captureQuestionnaireListRetrieveData(questionnaireListRetrieveResults, apiDataCache, dispatch);
    }
  }, [questionnaireListRetrieveResults, allQuestionnairesCache, apiDataCache, dispatch]);

  const taskDefinitionListRetrieveResults = useFetchData(['task-definition-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (taskDefinitionListRetrieveResults) {
      captureTaskDefinitionListRetrieveData(taskDefinitionListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, taskDefinitionListRetrieveResults]);

  const taskGroupListRetrieveResults = useFetchData(['task-group-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (taskGroupListRetrieveResults) {
      captureTaskGroupListRetrieveData(taskGroupListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, taskGroupListRetrieveResults]);

  const taskStatusListRetrieveResults = useFetchData(['task-status-list-retrieve'], { personIdList: personIdsList }, METHOD.GET);
  useEffect(() => {
    if (taskStatusListRetrieveResults) {
      captureTaskStatusListRetrieveData(taskStatusListRetrieveResults, apiDataCache, dispatch);
    }
  }, [apiDataCache, dispatch, personIdsList, taskStatusListRetrieveResults]);

  useEffect(() => {
    if (allPeopleCache) {
      const allCachedPeopleList = Object.values(allPeopleCache);
      setPersonIdsList(allCachedPeopleList.map((person) => person.personId));
    }
  }, [allPeopleCache]);

  useEffect(() => {
    if (allQuestionnairesCache) {
      setQuestionnaireList(Object.values(allQuestionnairesCache));
    }
  }, [allQuestionnairesCache]);

  useEffect(() => {
    if (allTaskGroupsCache) {
      setTaskGroupList(Object.values(allTaskGroupsCache));
    }
  }, [allTaskGroupsCache]);

  useEffect(() => {
    setCanDoAnythingIsAdmin(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  }, [viewerAccessRights]);

  const addQuestionnaireClick = () => {
    setAppContextValue('editQuestionnaireDrawerOpen', true);
    setAppContextValue('selectedQuestionnaire', undefined);
    setAppContextValue('editQuestionnaireDrawerLabel', 'Add Questionnaire');
  };

  const editQuestionnaireClick = (questionnaire) => {
    setAppContextValue('editQuestionnaireDrawerOpen', true);
    setAppContextValue('selectedQuestionnaire', questionnaire);
    setAppContextValue('editQuestionnaireDrawerLabel', 'Edit Questionnaire');
  };

  const addTaskGroupClick = () => {
    setAppContextValue('editTaskGroupDrawerOpen', true);
    setAppContextValue('editTaskGroupDrawerTaskGroup', undefined);
    setAppContextValue('editTaskGroupDrawerLabel', 'Add Task Grouping');
  };

  const editTaskGroupClick = (taskGroup) => {
    setAppContextValue('editTaskGroupDrawerOpen', true);
    setAppContextValue('editTaskGroupDrawerTaskGroup', taskGroup);
    setAppContextValue('editTaskGroupDrawerLabel', 'Edit Task Grouping');
  };

  const goToQuestionnairePageClick = (questionnaire) => {
    setAppContextValue('selectedQuestionnaire', questionnaire);

    queryClient.invalidateQueries(['question-list-retrieve']).then(() => {});
    // console.log('goToQuestionnairePageClick = (questionnaire)', questionnaire.questionnaireId);

    navigate(`/questionnaire/${questionnaire.questionnaireId}`);
  };

  if (!viewerCanSeeOrDo(['canViewSystemSettings'], viewerAccessRights)) {
    return (
      <PageContentContainer>
        <h1>You do not have permission to access this page.</h1>
      </PageContentContainer>
    );
  }

  return (
    <div>
      <Helmet>
        <title>
          System Settings -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        <link rel="canonical" href={`${webAppConfig.WECONNECT_URL_FOR_SEO}/system-settings`} />
      </Helmet>
      <PageContentContainer style={{ maxWidth: '1200px' }}>
        <h1>
          System Settings
        </h1>
        {/* ****  **** */}
        <SettingsSubtitle>Questionnaires</SettingsSubtitle>
        {questionnaireList.map((questionnaire) => (
          <OneQuestionnaireWrapper key={`questionnaire-${questionnaire.questionnaireId}`}>
            <QuestionnaireInnerWrapper>
              {/* {console.log('questionnaireList.map((questionnaire)', questionnaire.questionnaireId)} */}
              <GoToQuestionnairePage onClick={() => goToQuestionnairePageClick(questionnaire)}>
                <SpanWithLinkStyle>
                  {questionnaire.questionnaireName}
                </SpanWithLinkStyle>
              </GoToQuestionnairePage>
              <EditQuestionnaire onClick={() => editQuestionnaireClick(questionnaire)}>
                <EditStyled />
              </EditQuestionnaire>
            </QuestionnaireInnerWrapper>
          </OneQuestionnaireWrapper>
        ))}
        <AddButtonWrapper>
          <Button
            classes={{ root: classes.addQuestionnaireButtonRoot }}
            color="primary"
            variant="outlined"
            onClick={addQuestionnaireClick}
          >
            Add Questionnaire
          </Button>
        </AddButtonWrapper>
        {/* ****  **** */}
        <SettingsSubtitle>Onboarding Task Groupings</SettingsSubtitle>
        {taskGroupList.map((taskGroup) => (
          <OneQuestionnaireWrapper key={`taskGroup-${taskGroup.id}`}>
            <QuestionnaireInnerWrapper>
              <Link to={`/task-group/${taskGroup.id}`} state={taskGroup}>
                {taskGroup.taskGroupName}
              </Link>
              <EditTaskGroup onClick={() => editTaskGroupClick(taskGroup)}>
                <EditStyled />
              </EditTaskGroup>
            </QuestionnaireInnerWrapper>
          </OneQuestionnaireWrapper>
        ))}
        <AddButtonWrapper>
          <Button
            classes={{ root: classes.addQuestionnaireButtonRoot }}
            color="primary"
            variant="outlined"
            onClick={addTaskGroupClick}
          >
            Add Task Grouping
          </Button>
        </AddButtonWrapper>
        <SettingsSubtitle>Permissions Administration</SettingsSubtitle>
        <PermissionsAdministration />
        {canDoAnythingIsAdmin && (
          <>
            <UploadCSV />
            <CreateNewGoogleUser isCreate />
            <CreateNewGoogleUser isCreate={false} />
          </>
        )}
      </PageContentContainer>
    </div>
  );
};
SystemSettings.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  addQuestionnaireButtonRoot: {
    width: 185,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const AddButtonWrapper = styled('div')`
  margin-top: 24px;
`;

const EditQuestionnaire = styled('div')`
  cursor: pointer;
  margin-left: 25px;
`;

const EditTaskGroup = styled('div')`
  cursor: pointer;
  margin-left: 25px;
`;

const GoToQuestionnairePage = styled('div')`
`;

const OneQuestionnaireWrapper = styled('div')`
`;

const QuestionnaireInnerWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 6px;
`;

const SettingsSubtitle = styled('h2')`
  margin-top: 30px;
`;

export default withStyles(styles)(SystemSettings);
