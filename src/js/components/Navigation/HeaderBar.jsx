import { Button, Tab, Tabs } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
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
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { displayTopMenuShadow } from '../../utils/applicationUtils';
import { TopOfPageHeader, TopRowOneLeftContainer, TopRowOneMiddleContainer, TopRowOneRightContainer, TopRowTwoLeftContainer } from '../Style/pageLayoutStyles';
import HeaderBarLogo from './HeaderBarLogo';

const HEADER_TAB_DASHBOARD = 1;
const HEADER_TAB_TASKS = 2;
const HEADER_TAB_TEAMS = 3;
const HEADER_TAB_SETTINGS = 4;

const HeaderBar = ({ hideTabs }) => {
  renderLog('HeaderBar');
  const navigate = useNavigate();
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();

  const [scrolledDown] = useState(false);
  const [tabsValue, setTabsValue] = useState(HEADER_TAB_DASHBOARD);
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

  const initializeTabValue = () => {
    // console.log('initializeTabValue normalizedHrefPage():', normalizedHrefPage());
    switch (normalizedHrefPage()) {
      case 'dashboard':
        setTabsValue(HEADER_TAB_DASHBOARD);
        break;
      case 'tasks':
        setTabsValue(HEADER_TAB_TASKS);
        break;
      case 'team-home':
      case 'teams':
        setTabsValue(HEADER_TAB_TEAMS);
        break;
      case 'questionnaire':
      case 'system-settings':
      case 'task-group':
        if (viewerCanSeeOrDo('canViewSystemSettings', viewerAccessRights)) {
          setTabsValue(HEADER_TAB_SETTINGS);
        }
        break;
      default:
        setTabsValue(HEADER_TAB_DASHBOARD);
        break;
    }
  };

  const authenticatedPerson = getAppContextValue('authenticatedPerson');
  useEffect(() => {
    // Track new user logging in, possibly after a reset password, and display the resulting appropriate tabs
    // console.log('useEffect  authenticatedPerson changed');
    setViewerAccessRights(apiDataCache.viewerAccessRights);
    initializeTabValue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedPerson]);

  const handleTabChange = (event, newValue) => {
    // setTabsValue(newValue);
    if (newValue) {
      switch (newValue) {
        case HEADER_TAB_DASHBOARD:
          navigate('/dashboard');
          break;
        case HEADER_TAB_TASKS:
          navigate('/tasks');
          break;
        case HEADER_TAB_TEAMS:
          navigate('/teams');
          break;
        case HEADER_TAB_SETTINGS:
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
        case HEADER_TAB_DASHBOARD:
          navigate('/dashboard');
          break;
        case HEADER_TAB_TASKS:
          navigate('/tasks');
          break;
        case HEADER_TAB_TEAMS:
          navigate('/teams');
          break;
        case HEADER_TAB_SETTINGS:
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

  const headerProfileClick = () => {
    setAppContextValue('headerProfileDrawerOpen', true);
    setAppContextValue('headerProfileSection', 'nameAndPhoto');
    setAppContextValue('personDrawersPerson', authenticatedPerson);
    setAppContextValue('personDrawersPersonId', authenticatedPerson.personId);
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
              <Tab value={HEADER_TAB_DASHBOARD} label="Dashboard" onClick={() => handleTabChangeClick(HEADER_TAB_DASHBOARD)} />
              <Tab value={HEADER_TAB_TASKS} label="Tasks" onClick={() => handleTabChangeClick(HEADER_TAB_TASKS)} />
              <Tab value={HEADER_TAB_TEAMS} label="Teams" onClick={() => handleTabChangeClick(HEADER_TAB_TEAMS)} />
              {viewerCanSeeOrDo('canViewSystemSettings', viewerAccessRights) && (
                <Tab value={HEADER_TAB_SETTINGS} label="Settings" onClick={() => handleTabChangeClick(HEADER_TAB_SETTINGS)} />
              )}
            </Tabs>
          )}
        </TopRowOneMiddleContainer>
        <TopRowOneRightContainer className="u-cursor--pointer">
          <Button
            variant="outlined"
            sx={{ border: 'none' }}
            id="signInButton"
            onClick={() => (isAuthenticated ? headerProfileClick() : navigate('/login'))}
          >
            {isAuthenticated ? <AccountCircleIcon /> : 'Sign In'}
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
