import React from 'react';
import { renderLog } from '../../common/utils/logging';
import AddPersonDrawer from './AddPersonDrawer';
import AddTeamDrawer from './AddTeamDrawer';
import EditMeetingDrawer from './EditMeetingDrawer';
// import EditPersonDrawer from './EditPersonDrawer';
// import EditPersonTasksDrawer from './EditPersonTasksDrawer';
import EditQuestionDrawer from './EditQuestionDrawer';
import EditQuestionnaireDrawer from './EditQuestionnaireDrawer';
import EditTaskDefinitionDrawer from './EditTaskDefinitionDrawer';
import EditTaskGroupDrawer from './EditTaskGroupDrawer';
import HeaderProfileDrawer from './HeaderProfileDrawer';
// import PersonProfileDrawer from './PersonProfileDrawer';


const Drawers = () => {
  renderLog('Drawers');

  return (
    <>
      {/* <PersonProfileDrawer /> */}
      <AddPersonDrawer />
      <AddTeamDrawer />
      <EditMeetingDrawer />
      {/* <EditPersonDrawer /> */}
      {/* <EditPersonTasksDrawer /> */}
      <EditQuestionDrawer />
      <EditQuestionnaireDrawer />
      <EditTaskDefinitionDrawer />
      <EditTaskGroupDrawer />
      <HeaderProfileDrawer />
    </>
  );
};

export default Drawers;
