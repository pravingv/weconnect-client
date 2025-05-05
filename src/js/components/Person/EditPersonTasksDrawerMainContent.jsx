import React from 'react';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import TaskListForPersonManager from '../Task/TaskListForPersonManager';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';


const EditPersonTasksDrawerMainContent = () => {
  renderLog('EditPersonTasksDrawerMainContent');
  const { getAppContextValue } = useConnectAppContext();
  const personId = getAppContextValue('profileDrawerPersonId');

  return (
    <EditPersonTasksDrawerMainContentWrapper>
      <TaskListForPersonManager personId={personId} />
    </EditPersonTasksDrawerMainContentWrapper>
  );
};

const EditPersonTasksDrawerMainContentWrapper = styled('div')`
`;

export default EditPersonTasksDrawerMainContent;
