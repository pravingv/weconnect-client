import React from 'react';
// import styled from 'styled-components';
import { withStyles } from '@mui/styles';
import DrawerTemplateA from './DrawerTemplateA';
import { renderLog } from '../../common/utils/logging';
import PersonProfileDrawerMainContent from '../Person/PersonProfileDrawerMainContent';


// TODO Deprecate this drawer soon 2025-Mar-16
const PersonProfileDrawer = () => {
  renderLog('PersonProfileDrawer');  // Set LOG_RENDER_EVENTS to log all renders

  return (
    <DrawerTemplateA
      drawerId="personProfileDrawer"
      drawerOpenGlobalVariableName="personProfileDrawerOpen"
      headerTitleJsx={<></>}
      headerFixedJsx={<></>}
      mainContentJsx={<PersonProfileDrawerMainContent />}
      // onDrawerClose={() => {}}
    />
  );
};

const styles = () => ({
});

// const PersonProfileDrawerWrapper = styled('div')`
// `;

export default withStyles(styles)(PersonProfileDrawer);
