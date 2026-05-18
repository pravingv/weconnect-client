import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskListForPersonManager from '../Task/TaskListForPersonManager';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import ChangeLogList from '../Task/ChangeLogList';


const EditPersonTasksDrawerMainContent = () => {
  renderLog('EditPersonTasksDrawerMainContent');
  const { getAppContextValue } = useConnectAppContext();
  const personId = getAppContextValue('profileDrawerPersonId');

  return (
    <EditPersonTasksDrawerMainContentWrapper>
      <TaskListForPersonManager personId={personId} />
      <ChangeLogList personId={personId} />
    </EditPersonTasksDrawerMainContentWrapper>
  );
};

const EditPersonTasksDrawerMainContentWrapper = styled('div')`
`;

export default EditPersonTasksDrawerMainContent;
