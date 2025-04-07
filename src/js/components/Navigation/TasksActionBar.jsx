import React from 'react';
import styled from 'styled-components';
import SearchBar2024 from '../../common/components/Search/SearchBar2024';
import { renderLog } from '../../common/utils/logging';
import { ActionBarItem, ActionBarSection, SearchBarWrapper } from '../Style/actionBarStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';


const TasksActionBar = () => {
  renderLog('TasksActionBar');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  const clearFunction = () => {
    setAppContextValue('tasksActionBarSearchText', '');
  };

  const searchFunction = (incomingSearchText) => {
    setAppContextValue('tasksActionBarSearchText', incomingSearchText);
  };

  const addTeamMemberClick = () => {
    setAppContextValue('addPersonDrawerOpen', true);
    setAppContextValue('AddPersonDrawerLabel', 'Add Person');
  };

  return (
    <TasksActionBarWrapper>
      <SearchBarWrapper>
        <SearchBar2024
          clearFunction={clearFunction}
          placeholder="Search existing tasks"
          searchFunction={searchFunction}
          searchUpdateDelayTime={0}
        />
      </SearchBarWrapper>
      <ActionBarSection>
        <ActionBarItem>
          {getAppContextValue('tasksActionBarShowCompletedTasks') ? (
            <SpanWithLinkStyle onClick={() => setAppContextValue('tasksActionBarShowCompletedTasks', false)}>
              Hide completed tasks
            </SpanWithLinkStyle>
          ) : (
            <SpanWithLinkStyle onClick={() => setAppContextValue('tasksActionBarShowCompletedTasks', true)}>
              Show completed tasks
            </SpanWithLinkStyle>
          )}
        </ActionBarItem>
      </ActionBarSection>
      <ActionBarSection>
        {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
          <ActionBarItem>
            <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
              Add team member
            </SpanWithLinkStyle>
          </ActionBarItem>
        )}
      </ActionBarSection>
    </TasksActionBarWrapper>
  );
};

const TasksActionBarWrapper = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

export default TasksActionBar;
