import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { Button, Tab, Tabs } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import standardBoxShadow from '../../common/components/Style/standardBoxShadow';
import { hasIPhoneNotch } from '../../common/utils/cordovaUtils';
import { normalizedHrefPage } from '../../common/utils/hrefUtils';
import { authLog, renderLog, routingLog } from '../../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';
import { captureQuestionnaireListRetrieveData } from '../../models/QuestionnaireModel';
import { captureTaskGroupListRetrieveData, captureTaskStatusListRetrieveData } from '../../models/TaskModel';
import { captureTeamListRetrieveData } from '../../models/TeamModel';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { displayTopMenuShadow } from '../../utils/applicationUtils';
import { TopOfPageHeader, TopRowOneLeftContainer, TopRowOneMiddleContainer, TopRowOneRightContainer, TopRowTwoLeftContainer } from '../Style/pageLayoutStyles';
import HeaderBarLogo from './HeaderBarLogo';
import TasksActionBar from './TasksActionBar';
import TeamsActionBar from './TeamsActionBar';

/* eslint-disable react-hooks/exhaustive-deps */

const HEADER_TAB_DASHBOARD = 1;
const HEADER_TAB_TEAMS = 2;
const HEADER_TAB_TASKS = 3;
const HEADER_TAB_SETTINGS = 4;


const HeaderBar = ({ hideTabs }) => {
  renderLog('HeaderBar');
  const navigate = useNavigate();
  const { allPeopleCache, allQuestionnairesCache, apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const dispatch = useConnectDispatch();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [scrolledDown] = useState(false);
  const [showTabs, setShowTabs] = useState(true);
  const [tabsValue, setTabsValue] = useState(HEADER_TAB_DASHBOARD);
  const [viewerAccessRights, setViewerAccessRights] = useState(apiDataCache.viewerAccessRights);
  const [personIdsList, setPersonIdsList] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [shouldExecutePersonListRetrieve, setShouldExecutePersonListRetrieve] = useState(false);
  const [shouldExecuteTeamListRetrieve, setShouldExecuteTeamListRetrieve] = useState(false);
  const [shouldExecuteTaskListRetrieve, setShouldExecuteTaskListRetrieve] = useState(false);
  const [shouldExecuteTaskGroupListRetrieve, setShouldExecuteTaskGroupListRetrieve] = useState(false);
  const [shouldExecuteQuestionnaireListRetrieve, setShouldExecuteQuestionnaireListRetrieve] = useState(false);
  const [displayResetButton, setDisplayResetButton] = useState(false);

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
        setDisplayResetButton(false);
        break;
      case 'tasks':
        setTabsValue(HEADER_TAB_TASKS);
        setDisplayResetButton(true);
        break;
      case 'team-home':
      case 'teams':
        setTabsValue(HEADER_TAB_TEAMS);
        setDisplayResetButton(true);
        break;
      case 'questionnaire':
        // Yuck, no tab position makes sense here
        setDisplayResetButton(true);
        break;
      case 'system-settings':
        setTabsValue(HEADER_TAB_SETTINGS);
        setDisplayResetButton(true);
        break;
      case 'task-group':
        if (viewerCanSeeOrDo(['canViewSystemSettings'], viewerAccessRights)) {
          setTabsValue(HEADER_TAB_SETTINGS);
          setDisplayResetButton(true);
        }
        break;
      default:
        setDisplayResetButton(false);
        setTabsValue(HEADER_TAB_DASHBOARD);
        break;
    }
  };

  const goodAllPeopleCache =  allPeopleCache !== undefined;
  let allCachedPeopleList = [];
  if (goodAllPeopleCache) {
    allCachedPeopleList = Object.values(allPeopleCache);
    setPersonIdsList(allCachedPeopleList.map((person) => person.personId));
  }

  const taskStatusListRetrieveResults = useFetchData(['task-status-list-retrieve'], { personIdList: personIdsList }, METHOD.GET, shouldExecuteTaskListRetrieve && goodAllPeopleCache);
  useEffect(() => {
    if (taskStatusListRetrieveResults) {
      captureTaskStatusListRetrieveData(taskStatusListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personIdsList, taskStatusListRetrieveResults]);

  const questionnaireListRetrieveResults = useFetchData(['questionnaire-list-retrieve'], {}, METHOD.GET, shouldExecuteQuestionnaireListRetrieve);
  useEffect(() => {
    if (questionnaireListRetrieveResults) {
      captureQuestionnaireListRetrieveData(questionnaireListRetrieveResults, apiDataCache, dispatch);
      setShouldExecuteQuestionnaireListRetrieve(false);
    }
  }, [questionnaireListRetrieveResults, allQuestionnairesCache, apiDataCache, dispatch]);

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET, shouldExecuteTeamListRetrieve);
  useEffect(() => {
    if (teamListRetrieveResults) {
      captureTeamListRetrieveData(teamListRetrieveResults, apiDataCache, dispatch);
      setShouldExecuteTeamListRetrieve(false);
    }
  }, [teamListRetrieveResults]);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET, shouldExecutePersonListRetrieve);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
      setShouldExecutePersonListRetrieve(false);
    }
  }, [personListRetrieveResults, allPeopleCache, dispatch]);

  const taskGroupListRetrieveResults = useFetchData(['task-group-list-retrieve'], {}, METHOD.GET, shouldExecuteTaskGroupListRetrieve);
  useEffect(() => {
    if (taskGroupListRetrieveResults) {
      captureTaskGroupListRetrieveData(taskGroupListRetrieveResults, apiDataCache, dispatch);
      setShouldExecuteTaskGroupListRetrieve(false);
    }
  }, [apiDataCache, dispatch, taskGroupListRetrieveResults]);


  const doTheRefresh = () => {
    switch (normalizedHrefPage()) {
      case 'tasks':
        setShouldExecuteTaskListRetrieve(true);
        break;
      case 'team-home':
      case 'teams':
        setShouldExecuteTeamListRetrieve(true);
        break;
      case 'questionnaire':
        setShouldExecuteQuestionnaireListRetrieve(true);
        break;
      case 'system-settings':
        setShouldExecutePersonListRetrieve(true);
        break;
      case 'task-group':
        if (viewerCanSeeOrDo(['canViewSystemSettings'], viewerAccessRights)) {
          setShouldExecuteTaskGroupListRetrieve(true);
        }
        break;
      default:
        break;
    }
  };

  const authenticatedPerson = getAppContextValue('authenticatedPerson');
  useEffect(() => {
    setViewerAccessRights(apiDataCache.viewerAccessRights);
    initializeTabValue();
  }, [authenticatedPerson]);

  const initializeSeconds = () => {
    switch (normalizedHrefPage()) {
      case 'tasks':
        setSeconds(30);     // task-status-list-retrieve 30 seconds (.5 minutes)
        return 30;
      case 'team-home':
      case 'teams':
        setSeconds(60);     // team-list-retrieve 60 seconds (1 minute)
        return 60;
      case 'questionnaire':
        setSeconds(120);    // questionnaire-responses-list-retrieve  120 seconds (2 minutes)
        return 120;
      case 'system-settings':
        setSeconds(120);    // person-list-retrieve 120 seconds (2 minutes)
        return 120;
      case 'task-group':
        if (viewerCanSeeOrDo(['canViewSystemSettings'], viewerAccessRights)) {
          setSeconds(120);     // task-status-list-retrieve 30 seconds (.5 minutes)
          return 120;
        }
        return 0;
      default:
        return 0;
    }
  };

  useEffect(() => {
    initializeSeconds();

    const interval = setInterval(() => {
      setSeconds((prevSecs) => {
        // console.log('seconds', prevSecs);
        if (prevSecs === 1) {
          const retSecs = initializeSeconds();
          doTheRefresh();
          return retSecs;
        } else {
          return prevSecs - 1;
        }
      });
    }, 1000); // Update every 1 second

    return () => clearInterval(interval); // Cleanup function
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount

  const handleTabChange = (event, newValue) => {
    // setTabsValue(newValue);
    console.log('----------', newValue);
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
    setAppContextValue('profileDrawerPerson', authenticatedPerson);
    setAppContextValue('profileDrawerPersonId', authenticatedPerson.id);
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
              <Tab value={HEADER_TAB_DASHBOARD} label="Dashboard" component={Link} to="/dashboard" />
              <Tab value={HEADER_TAB_TEAMS} label="Teams" component={Link} to="/teams" />
              <Tab value={HEADER_TAB_TASKS} label="Tasks" component={Link} to="/tasks" />
              {viewerCanSeeOrDo(['canViewSystemSettings'], viewerAccessRights) && (
                <Tab value={HEADER_TAB_SETTINGS} label="Settings" component={Link} to="/system-settings" />
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
          {displayResetButton && (
            <Button
              variant="outlined"
              size="small"
              sx={{ fontSize: '13px', fontWeight: 'unset', height: '30px', margin: '13px 0 0 8px', minWidth: '110px' }}
              id="refreshButton"
              onClick={() => setSeconds(1)}
            >
              {`Refresh in ${seconds}`}
            </Button>
          )}
        </TopRowOneRightContainer>
        <TopRowTwoLeftContainer>
          {(normalizedHrefPage() === 'teams') ? (
            <TeamsActionBar />
          ) : (
            <>
              {(normalizedHrefPage() === 'tasks') && (
                <TasksActionBar />
              )}
            </>
          )}
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
