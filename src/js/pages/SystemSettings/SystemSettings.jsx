import { KeyboardArrowDown, KeyboardArrowUp, South } from '@mui/icons-material';
import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
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
import PermissionsAdministration from './PermissionsAdministration';
import QuestionnaireListIndex from './QuestionnaireListIndex';
import TaskGroupListIndex from './TaskGroupListIndex';


const SystemSettings = () => {
  renderLog('SystemSettings');
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);
  const [showQuestionnaireList, setShowQuestionnaireList] = useState(false);
  const [showTaskGroupList, setShowTaskGroupList] = useState(false);

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
      </PageContentContainer>
    </div>
  );
};
SystemSettings.propTypes = {
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

export default withStyles(styles)(SystemSettings);
