import React, { useState } from 'react';
import { renderLog } from '../../common/utils/logging';
import EditPersonDrawerMainContent from '../Person/EditPersonDrawerMainContent';
import DrawerTemplateA from './DrawerTemplateA';

// TODO Deprecate this drawer soon 2025-Mar-16
const EditPersonDrawer = () => {
  renderLog('EditPersonDrawer');

  const [headerTitleJsx] = useState(<></>);
  const [headerFixedJsx] = useState(<></>);

  return (
    <DrawerTemplateA
      drawerId="editPersonDrawer"
      drawerOpenGlobalVariableName="editPersonDrawerOpen"
      mainContentJsx={<EditPersonDrawerMainContent />}
      headerTitleJsx={headerTitleJsx}
      headerFixedJsx={headerFixedJsx}
    />
  );
};

export default EditPersonDrawer;
