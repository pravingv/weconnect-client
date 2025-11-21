import { Workspaces as WorkspacesIcon, Quiz as QuizIcon, AdminPanelSettings as AdminPanelSettingsIcon } from '@mui/icons-material';
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

const SystemSettings = () => {
  renderLog('SystemSettings');
  const navigate = useNavigate();
  const { apiDataCache } = useConnectAppContext();
  const { viewerAccessRights, allPeopleCache } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [personIdsList, setPersonIdsList] = useState([]);

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
  top: -18px;
  left: 24px;
  background: #fff;
  padding: 0 10px;
  color: #1e6fb9;
  font-size: 22px;
  font-weight: 600;
`;

const Settings = styled('div')`
  position: relative;
  border: 2px solid #1e6fb9;
  border-radius: 14px;
  padding: 45px 30px 35px;
  max-width: 560px;
  width: 100%;
  background: white;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const StyledButton = styled(Button)`
  padding: 16px 14px;
  border-radius: 14px;
  min-height: 54px;
  width: 100%;
  max-width: 360px;
  margin: 0 auto;
  font-size: 17px;
  font-weight: 500;
`;

const Wrapper = styled('div')`
  display: flex;
  padding: 40px 20px;
`;

export default SystemSettings;
