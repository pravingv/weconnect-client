import React from 'react';
import { renderLog } from '../../common/utils/logging';
import AddPersonDrawer from './AddPersonDrawer';
import AddTeamDrawer from './AddTeamDrawer';
import EditMeetingDrawer from './EditMeetingDrawer';
import EditPersonDrawer from './EditPersonDrawer';
import EditQuestionDrawer from './EditQuestionDrawer';
import EditQuestionnaireDrawer from './EditQuestionnaireDrawer';
import EditTaskDefinitionDrawer from './EditTaskDefinitionDrawer';
import EditTaskGroupDrawer from './EditTaskGroupDrawer';
import PersonProfileDrawer from './PersonProfileDrawer';


const Drawers = () => {
  renderLog('Drawers');

  return (
    <>
      <PersonProfileDrawer />
      <AddPersonDrawer />
      <AddTeamDrawer />
      <EditMeetingDrawer />
      <EditPersonDrawer />
      <EditQuestionDrawer />
      <EditQuestionnaireDrawer />
      <EditTaskDefinitionDrawer />
      <EditTaskGroupDrawer />
    </>
  );
};

export default Drawers;
