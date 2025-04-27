import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
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
import GetOneGoogleUser from './GetOneGoogleUser';
import PermissionsAdministration from './PermissionsAdministration';
import ResetGoogleUserPassword from './ResetGoogleUserPassword';
import GrantGoogleDriveAccess from './ShareGoogleDriveAccess';
import TaskGroupListIndex from './TaskGroupListIndex';
import SlackChannelInvite from './SlackChannelInvite';
import SlackChannelMembers from './SlackChannelMembers';
import SlackGetPresence from './SlackGetPresence';
import SlackListUsers from './SlackListMembers';
import SlackSendMessage from './SlackSendMessage';
import UploadCSV from './UploadCSV';
import SouthIcon from '@mui/icons-material/South';


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

  // Alphabetically sort questionnaires and task  groups
  questionnaireList.sort((a, b) => a.questionnaireName.localeCompare(b.questionnaireName));
  taskGroupList.sort((a, b) => a.taskGroupName.localeCompare(b.taskGroupName));
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
      <PageContentContainer style={{ maxWidth: '1500px' }}>
        <h1>
          System Settings
          <Button sx={{ marginLeft: '100%' }} onClick={() => window.scrollTo(0, document.body.scrollHeight)}><SouthIcon /></Button>
        </h1>
        {/* ****  **** */}
        <TaskGroupListIndex />
        {/* ****  **** */}
        <SettingsSubtitle>Questionnaires</SettingsSubtitle>
        {questionnaireList.map((questionnaire) => (
          <OneQuestionnaireWrapper key={`questionnaire-${questionnaire.questionnaireId}`}>
            <ListItemFlexInnerWrapper>
              {/* {console.log('questionnaireList.map((questionnaire)', questionnaire.questionnaireId)} */}
              <GoToQuestionnairePage onClick={() => goToQuestionnairePageClick(questionnaire)}>
                <SpanWithLinkStyle>
                  {questionnaire.questionnaireName} ({questionnaire.questionnaireId})
                </SpanWithLinkStyle>
              </GoToQuestionnairePage>
              <EditQuestionnaire onClick={() => editQuestionnaireClick(questionnaire)}>
                <EditStyled />
              </EditQuestionnaire>
            </ListItemFlexInnerWrapper>
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
        <SettingsSubtitle>Permissions Administration</SettingsSubtitle>
        <PermissionsAdministration />
        {canDoAnythingIsAdmin && (
          <div style={{ paddingTop: '.8rem' }}>
            <UploadCSV />
            <div style={{ display: 'flex', paddingTop: '.5rem' }}>
              <CreateNewGoogleUser isCreate />
              <CreateNewGoogleUser isCreate={false} />
            </div>
            <div style={{ display: 'flex', paddingTop: '.5rem' }}>
              <GetOneGoogleUser getAll={false} />
              <GetOneGoogleUser getAll />
              <ResetGoogleUserPassword />
            </div>
            <div style={{ display: 'flex', paddingTop: '.5rem'  }}>
              <GrantGoogleDriveAccess isShare />
              {/* <GrantGoogleDriveAccess isShare={false} /> */}
            </div>
            <div style={{ display: 'flex', paddingTop: '.5rem'  }}>
              <SlackSendMessage />
              <SlackListUsers />
              <SlackGetPresence />
              <SlackChannelInvite />
            </div>
            <div style={{ display: 'flex', paddingTop: '.5rem'  }}>
              <SlackChannelMembers />
            </div>
          </div>
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

const GoToQuestionnairePage = styled('div')`
`;

const OneQuestionnaireWrapper = styled('div')`
`;

const ListItemFlexInnerWrapper = styled('div')`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-bottom: 6px;
`;

const SettingsSubtitle = styled('h2')`
  margin-top: 30px;
`;

export default withStyles(styles)(SystemSettings);
