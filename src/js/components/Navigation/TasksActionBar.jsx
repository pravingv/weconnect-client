import { PersonAddAltOutlined } from '@mui/icons-material';
import React from 'react';
import styled from 'styled-components';
import SearchBar2024 from '../../common/components/Search/SearchBar2024';
import { renderLog } from '../../common/utils/logging';
import { ActionBarItem, ActionBarSection, SearchBarWrapper } from '../Style/actionBarStyles';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';


const TasksActionBar = () => {
  renderLog('TasksActionBar');
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
      {getAppContextValue('tasksActionBarShowTasksByTask') ? (
        <></>
      ) : (
        <ActionBarSection>
          {getAppContextValue('tasksActionBarHideAllTasks') === true ? (
            <ActionBarItem>
              <SpanWithLinkStyle
                onClick={() => {
                  setAppContextValue('tasksActionBarHideAllTasks', undefined);
                  setTimeout(() => {
                    setAppContextValue('tasksActionBarHideAllTasks', false);
                  }, 100);
                }}
              >
                Show tasks
              </SpanWithLinkStyle>
            </ActionBarItem>
          ) : (
            <ActionBarItem>
              <SpanWithLinkStyle
                onClick={() => {
                  setAppContextValue('tasksActionBarHideAllTasks', undefined);
                  setTimeout(() => {
                    setAppContextValue('tasksActionBarHideAllTasks', true);
                  }, 100);
                }}
              >
                Hide tasks
              </SpanWithLinkStyle>
            </ActionBarItem>
          )}
        </ActionBarSection>
      )}
      {((getAppContextValue('tasksActionBarShowTasksByTask') === true) || (getAppContextValue('tasksActionBarHideAllTasks') !== true)) && (
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
      )}
      {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
        <ActionBarSection>
          <ActionBarItem>
            <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
              <PersonAddAltOutlinedStyled />
            </SpanWithLinkStyle>
          </ActionBarItem>
        </ActionBarSection>
      )}
      <ActionBarSection $borderRightOff>
        <ActionBarItem>
          {getAppContextValue('tasksActionBarShowTasksByTask') ? (
            <SpanWithLinkStyle onClick={() => setAppContextValue('tasksActionBarShowTasksByTask', false)}>
              By person
            </SpanWithLinkStyle>
          ) : (
            <SpanWithLinkStyle onClick={() => setAppContextValue('tasksActionBarShowTasksByTask', true)}>
              By task
            </SpanWithLinkStyle>
          )}
        </ActionBarItem>
      </ActionBarSection>
    </TasksActionBarWrapper>
  );
};

const PersonAddAltOutlinedStyled = styled(PersonAddAltOutlined)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-right: 2px;
  width: 18px;
  height: 18px;
`;

const TasksActionBarWrapper = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
`;

export default TasksActionBar;
