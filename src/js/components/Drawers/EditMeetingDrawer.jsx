import React from 'react';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import EditMeetingDrawerMainContent from '../Meeting/EditMeetingDrawerMainContent';
import DrawerTemplateA from './DrawerTemplateA';


const EditMeetingDrawer = () => {
  renderLog('EditMeetingDrawer');
  const { getAppContextValue } = useConnectAppContext();

  return (
    <DrawerTemplateA
      drawerId="editMeetingDrawer"
      drawerOpenGlobalVariableName="editMeetingDrawerOpen"
      headerFixedJsx={<></>}
      headerTitleJsx={<>{getAppContextValue('editMeetingDrawerLabel')}</>}
      mainContentJsx={<EditMeetingDrawerMainContent />}
    />
  );
};
EditMeetingDrawer.propTypes = {
};

export default EditMeetingDrawer;
