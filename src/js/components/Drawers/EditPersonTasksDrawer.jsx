import React from 'react';
import { renderLog } from '../../common/utils/logging';
import EditPersonTasksDrawerMainContent from '../Person/EditPersonTasksDrawerMainContent';
import DrawerTemplateA from './DrawerTemplateA';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { getFullNamePreferredPerson, useGetPersonById } from '../../models/PersonModel';

const EditPersonTasksDrawer = () => {
  renderLog('EditPersonTasksDrawer');
  const { getAppContextValue } = useConnectAppContext();
  const personId = getAppContextValue('editPersonTasksPersonId');
  const person = useGetPersonById(personId);

  return (
    <DrawerTemplateA
      drawerId="editPersonTasksDrawer"
      drawerOpenGlobalVariableName="editPersonTasksDrawerOpen"
      mainContentJsx={<EditPersonTasksDrawerMainContent />}
      headerFixedJsx={<></>}
      headerTitleJsx={<>{getFullNamePreferredPerson(person)}</>}
    />
  );
};

export default EditPersonTasksDrawer;
