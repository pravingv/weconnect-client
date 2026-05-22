import { Workspaces as WorkspacesIcon, Quiz as QuizIcon, AdminPanelSettings as AdminPanelSettingsIcon, BarChart as BarChartIcon } from '@mui/icons-material';
import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { PageContentContainer } from '../../components/Style/pageLayoutStyles';
import webAppConfig from '../../config';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { captureTaskDefinitionListRetrieveData, captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData } from '../../models/TaskModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import useRedirectToLoginIfLoggedOut from '../../utils/useRedirectToLoginIfLoggedOut';


const SystemSettings = () => {
  renderLog('SystemSettings');
  const navigate = useNavigate();
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  const API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD = 200;
  useRedirectToLoginIfLoggedOut(personListRetrieveResults, API_RETRIEVE_ERRORS_IN_A_ROW_THRESHOLD); //or maybe taskDefinitionListRetrieveResults or taskGroupListRetrieveResults or taskStatusListRetrieveResults?

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
    // console.log('SystemSettings taskGroupListRetrieveResults');
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
    <Wrapper>
      <Helmet>
        <title>
          System Settings -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        <link rel="canonical" href={`${webAppConfig.WECONNECT_URL_FOR_SEO}/system-settings`} />
      </Helmet>
      <Content>
        <Settings>
          <Label>System Settings</Label>
          <StyledButton
            variant="contained"
            startIcon={<WorkspacesIcon />}
            onClick={() => navigate('/system-settings/groups-of-tasks')}
          >
            Groups of Tasks
          </StyledButton>
          <StyledButton
            variant="contained"
            startIcon={<QuizIcon />}
            onClick={() => navigate('/system-settings/questionnaires')}
          >
            Questionnaires
          </StyledButton>
          <StyledButton
            variant="contained"
            startIcon={<AdminPanelSettingsIcon />}
            onClick={() => navigate('/system-settings/permissions')}
          >
            Permissions Administration
          </StyledButton>
          <StyledButton
            variant="contained"
            startIcon={<BarChartIcon />}
            onClick={() => navigate('/system-settings/reports')}
          >
            Reports
          </StyledButton>
        </Settings>
      </Content>
    </Wrapper>
  );
};
SystemSettings.propTypes = {
};

const Content = styled(PageContentContainer)`
  text-align: center;
`;

const Label = styled('div')`
  position: absolute;
  top: -24px;
  left: 30px;
  background: #fff;
  padding: 0 16px;
  color: #1e6fb9;
  font-size: 28px;
  font-weight: 700;
`;

const Settings = styled('div')`
  position: relative;
  border: 1px solid #1e6fb9;
  border-radius: 14px;
  padding: 60px 60px 50px;
  max-width: 800px;
  width: 90%;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 30px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
`;


const StyledButton = styled(Button)`
  min-height: 60px;
  font-size: 18px;
  border-radius: 12px;
  padding: 16px 20px;
  width: 100%;
`;

const Wrapper = styled('div')`
  display: flex;
  justify-content: center;
  padding: 60px 20px;
`;

export default SystemSettings;
