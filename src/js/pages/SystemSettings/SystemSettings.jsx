import { KeyboardArrowDown, KeyboardArrowUp, South } from '@mui/icons-material';
import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import webAppConfig from '../../config';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData } from '../../models/TaskModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import CreateNewGoogleUser from './CreateNewGoogleUser';
import GetOneGoogleUser from './GetOneGoogleUser';
import JazzHrAccess from './JazzHrAccess';
import PermissionsAdministration from './PermissionsAdministration';
import ResetGoogleUserPassword from './ResetGoogleUserPassword';
import GrantGoogleDriveAccess from './ShareGoogleDriveAccess';
import SlackChannelInvite from './SlackChannelInvite';
import SlackChannelMembers from './SlackChannelMembers';
import SlackGetPresence from './SlackGetPresence';
import SlackListUsers from './SlackListMembers';
import SlackSendMessage from './SlackSendMessage';
import QuestionnaireListIndex from './QuestionnaireListIndex';
import TaskGroupListIndex from './TaskGroupListIndex';
import UploadCSV from './UploadCSV';


const SystemSettings = () => {
  renderLog('SystemSettings');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);
  const [showQuestionnaireList, setShowQuestionnaireList] = useState(false);
  const [showTaskGroupList, setShowTaskGroupList] = useState(false);
  const [canDoAnythingIsAdmin, setCanDoAnythingIsAdmin] = useState(false);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, allPeopleCache, apiDataCache, dispatch]);

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
    setCanDoAnythingIsAdmin(viewerCanSeeOrDo(['canDoAnythingIsAdmin'], viewerAccessRights));
  }, [viewerAccessRights]);

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
      <PageContentContainer style={{ maxWidth: '1500px' }}>
        <h1>
          System Settings
        </h1>
        <Button sx={{ marginLeft: '100%' }} onClick={() => window.scrollTo(0, document.body.scrollHeight)}><South /></Button>
        {/* ****  **** */}
        <SettingsSubtitle>
          <span onClick={() => setShowTaskGroupList(!showTaskGroupList)}>
            {showTaskGroupList ? (
              <KeyboardArrowUpStyled />
            ) : (
              <KeyboardArrowDownStyled />
            )}
          </span>
          Groups of Tasks
        </SettingsSubtitle>
        <TaskGroupListIndex showTaskGroupList={showTaskGroupList} />
        {/* ****  **** */}
        <SettingsSubtitle>
          <span onClick={() => setShowQuestionnaireList(!showQuestionnaireList)}>
            {showQuestionnaireList ? (
              <KeyboardArrowUpStyled />
            ) : (
              <KeyboardArrowDownStyled />
            )}
          </span>
          Questionnaires
        </SettingsSubtitle>
        <QuestionnaireListIndex showQuestionnaireList={showQuestionnaireList} />
        {/* ****  **** */}
        <SettingsSubtitle>Permissions Administration</SettingsSubtitle>
        <PermissionsAdministration />
        {canDoAnythingIsAdmin && (
          <div style={{ paddingTop: '2rem' }}>
            <UploadCSV />
            <ButtonDividerLine />
            <div style={{ display: 'flex', paddingTop: '.5rem' }}>
              <CreateNewGoogleUser isCreate />
              <CreateNewGoogleUser isCreate={false} />
            </div>
            <ButtonDividerLine />
            <div style={{ display: 'flex', paddingTop: '.5rem' }}>
              <GetOneGoogleUser getAll={false} />
              <GetOneGoogleUser getAll />
              <ResetGoogleUserPassword />
            </div>
            <div style={{ display: 'flex', paddingTop: '.5rem' }}>
              <GrantGoogleDriveAccess isShare />
              {/* <GrantGoogleDriveAccess isRevoke /> Doesn't find all the files, and low priority */}
              <GrantGoogleDriveAccess isTransfer />
            </div>
            <ButtonDividerLine />
            <div style={{ display: 'flex', paddingTop: '.5rem' }}>
              <SlackSendMessage />
              <SlackListUsers />
              <SlackGetPresence />
              <SlackChannelInvite />
            </div>
            <div style={{ display: 'flex', paddingTop: '.5rem'  }}>
              <SlackChannelMembers />
            </div>
            <ButtonDividerLine />
            <div style={{ display: 'flex', paddingTop: '.5rem' }}>
              <JazzHrAccess isGetUsers />
              <JazzHrAccess isGetApplicants />
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

const KeyboardArrowDownStyled = styled(KeyboardArrowDown)`
`;

const KeyboardArrowUpStyled = styled(KeyboardArrowUp)`
`;

const SettingsSubtitle = styled('h2')`
  margin-bottom: 0;
`;

const ButtonDividerLine = styled('div')`
  padding-top: 4px;
  padding-bottom: -1px;
  border-bottom: 1px solid #BCC6CC;
`;

export default withStyles(styles)(SystemSettings);
