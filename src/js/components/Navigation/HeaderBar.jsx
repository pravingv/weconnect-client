import { Button, Tab, Tabs } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';
import standardBoxShadow from '../../common/components/Style/standardBoxShadow';
import { hasIPhoneNotch } from '../../common/utils/cordovaUtils';
import { normalizedHrefPage } from '../../common/utils/hrefUtils';
import { authLog, renderLog, routingLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { clearSignedInGlobals } from '../../contexts/contextFunctions';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { useLogoutMutation } from '../../react-query/mutations';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { displayTopMenuShadow } from '../../utils/applicationUtils';
import { TopOfPageHeader, TopRowOneLeftContainer, TopRowOneMiddleContainer, TopRowOneRightContainer, TopRowTwoLeftContainer } from '../Style/pageLayoutStyles';
import HeaderBarLogo from './HeaderBarLogo';


// eslint-disable-next-line no-unused-vars
const HeaderBar = ({ hideTabs }) => {
  renderLog('HeaderBar');
  const navigate = useNavigate();
  const { apiDataCache, getAppContextValue, setAppContextValue, getAppContextData } = useConnectAppContext();
  const { mutate: mutateLogout } = useLogoutMutation();

  const [scrolledDown] = useState(false);
  const [tabsValue, setTabsValue] = useState('1');
  const [showTabs, setShowTabs] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [viewerAccessRights, setViewerAccessRights] = useState(apiDataCache.viewerAccessRights);

  const isAuth = getAppContextValue('isAuthenticated');
  useEffect(() => {
    if (isAuth !== null) {
      authLog('HeaderBar isAuthenticated changed =', isAuth);
      setViewerAccessRights(apiDataCache.viewerAccessRights);
      setIsAuthenticated(isAuth);
    }
  }, [isAuth]);

  useEffect(() => {
    // console.log('HeaderBar detected apiDataCache change', apiDataCache.viewerAccessRights, isAuth);
    const isAuth2 = getAppContextValue('isAuthenticated');
    if (Object.keys(apiDataCache.viewerAccessRights).length > 0 || !isAuth2) {
      setViewerAccessRights(apiDataCache.viewerAccessRights);
    }
  }, [apiDataCache]);

  const logoutApi = async () => {
    // I don't think we want to make the weConnectQueryFn call here since we are about to call mutateLogout
    const data = await weConnectQueryFn('logout', {}, METHOD.POST);
    // console.log(`/logout response in HeaderBar -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
    clearSignedInGlobals(setAppContextValue, getAppContextData);
    navigate('/login');
    mutateLogout();
  };

  const initializeTabValue = () => {
    // console.log('initializeTabValue normalizedHrefPage():', normalizedHrefPage());
    switch (normalizedHrefPage()) {
      case 'tasks':
        setTabsValue('1');
        // console.log('initializeTabValue  setTabsValue: 1');
        break;
      case 'team-home':
      case 'teams':
        setTabsValue('2');
        // console.log('initializeTabValue  setTabsValue: 2');
        break;
      case 'questionnaire':
      case 'system-settings':
      case 'task-group':
        setTabsValue('3');
        // console.log('initializeTabValue  setTabsValue: 3');
        break;
      default:
        setTabsValue('1');
        // console.log('initializeTabValue  setTabsValue default: 1');
        break;
    }
  };

  const authP = getAppContextValue('authenticatedPerson');
  useEffect(() => {
    // Track new user logging in, possibly after a reset password, and display the resulting appropriate tabs
    // console.log('useEffect  authenticatedPerson changed');
    setViewerAccessRights(apiDataCache.viewerAccessRights);
    initializeTabValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authP]);

  const handleTabChange = (event, newValue) => {
    // setTabsValue(newValue);
    if (newValue) {
      switch (newValue) {
        case '1':
          navigate('/tasks');
          break;
        case '2':
          navigate('/teams');
          break;
        case '3':
          navigate('/system-settings');
          break;
        default:
          navigate('/tasks');
          break;
      }
      initializeTabValue();
    }
  };

  const handleTabChangeClick = (newValue) => {
    // console.log(`handleTabChangeClick newValue: ${newValue}`);
    // setTabsValue(newValue);
    if (newValue) {
      switch (newValue) {
        case '1':
          navigate('/tasks');
          break;
        case '2':
          navigate('/teams');
          break;
        case '3':
          navigate('/system-settings');
          break;
        default:
          navigate('/tasks');
          break;
      }
    }
  };

  useEffect(() => {
    setShowTabs(!hideTabs);
  }, [hideTabs]);

  useEffect(() => {
    initializeTabValue();
  }, []);

  // useNavigate() called from anywhere, will update the ReactRouter, and will call initializeTabValue()
  const loc = useLocation();
  React.useEffect(() => {
    routingLog('HeaderBar useLocation detected a url change to: ', loc.pathname);
    setViewerAccessRights(apiDataCache.viewerAccessRights);
    initializeTabValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loc]);

  // console.log('HeaderBar viewerCanSeeOrDo(canViewSystemSettings, viewerAccessRights): ', viewerCanSeeOrDo('canViewSystemSettings', viewerAccessRights));

  const editProfileClick = () => {
    setAppContextValue('editProfileDrawerOpen', true);
  };
  return (
    <HeaderBarWrapper
      $hasNotch={hasIPhoneNotch()}
      $scrolledDown={scrolledDown}
      $hasSubmenu={displayTopMenuShadow()}
    >
      <TopOfPageHeader>
        <TopRowOneLeftContainer>
          <HeaderBarLogo linkOff={!showTabs} />
        </TopRowOneLeftContainer>
        <TopRowOneMiddleContainer>
          {showTabs && (
            <Tabs
              value={tabsValue}
              onChange={handleTabChange}
              aria-label="Tabs selector"
            >
              <Tab value="1" label="Dashboard" onClick={() => handleTabChangeClick('1')} />
              <Tab value="2" label="Teams" onClick={() => handleTabChangeClick('2')} />
              {viewerCanSeeOrDo('canViewSystemSettings', viewerAccessRights) && (
                <Tab value="3" label="Settings" onClick={() => handleTabChangeClick('3')} />
              )}
            </Tabs>
          )}
        </TopRowOneMiddleContainer>
        <TopRowOneRightContainer className="u-cursor--pointer">
          <Button
            onClick={() => editProfileClick()}
          >
            Edit Profile
          </Button>
          <Button
            variant="outlined"
            sx={{ border: 'none' }}
            id="signInButton"
            onClick={() => (isAuthenticated ? logoutApi() : navigate('/login'))}
          >
            {isAuthenticated ? 'Sign Out' : 'Sign In'}
          </Button>
        </TopRowOneRightContainer>
        <TopRowTwoLeftContainer>
         &nbsp;
        </TopRowTwoLeftContainer>
      </TopOfPageHeader>
    </HeaderBarWrapper>
  );
};
HeaderBar.propTypes = {
  hideTabs: PropTypes.bool,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  addTeamButtonRoot: {
    width: 120,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  navButtonOutlined: {
    height: 32,
    borderRadius: 32,
    color: 'white',
    backgroundColor: 'yellow',
    border: '1px solid white',
    marginBottom: '1em',
    fontWeight: '300',
    width: '47%',
    fontSize: 12,
    padding: '5px 0',
    marginTop: 8,
  },
  navClose: {
    position: 'fixed',
    right: 16,
    cursor: 'pointer',
  },
});

const HeaderBarWrapper = styled('div', {
  shouldForwardProp: (prop) => !['hasNotch', 'scrolledDown', 'hasSubmenu'].includes(prop),
})(({ hasNotch, scrolledDown, hasSubmenu }) => (`
  margin-top: ${hasNotch ? '9%' : ''};
  box-shadow: ${(!scrolledDown || !hasSubmenu)  ? '' : standardBoxShadow('wide')};
  border-bottom: ${(!scrolledDown || !hasSubmenu) ? '' : '1px solid #aaa'};
`));


export default withStyles(styles)(HeaderBar);
