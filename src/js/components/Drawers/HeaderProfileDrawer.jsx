import { Button } from '@mui/material';
import { AccountCircle, CalendarMonth, ManageAccounts, Menu, Quiz, TaskAlt } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import DrawerTemplateHeaderProfile from './DrawerTemplateHeaderProfile';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { clearSignedInGlobals } from '../../contexts/contextFunctions';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { getFullNamePreferredPerson, useGetPersonById } from '../../models/PersonModel';
import EditPersonDrawerMainContent from '../Person/EditPersonDrawerMainContent';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { useLogoutMutation } from '../../react-query/mutations';
import EditPersonTasksDrawerMainContent from '../Person/EditPersonTasksDrawerMainContent';
import ViewQuestionnairesForPerson from '../Questionnaire/ViewQuestionnairesForPerson';
import VisibleProfile from '../Person/VisibleProfile';
import EditPersonAwayForm from '../Person/EditPersonAwayForm';

const HeaderProfileDrawer = () => {
  const { apiDataCache, getAppContextData, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  const [headerFixedJsx] = useState(<></>);
  const [displayProfileOption, setDisplayProfileOption] = useState('nameAndPhoto');
  const [displayProfileComponent, setDisplayProfileComponent] = useState();
  const [headerProfileSectionSetFromAppContext, setHeaderProfileSectionSetFromAppContext] = useState(false);
  const [showLinksToProfilePages, setShowLinksToProfilePages] = useState(true);
  const [viewerIsThisAuthenticatedPerson, setViewerIsThisAuthenticatedPerson] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const { mutate: mutateLogout } = useLogoutMutation();
  const navigate = useNavigate();
  const personViewedInDrawer = useGetPersonById(getAppContextValue('profileDrawerPersonId'));
  const personViewedInDrawerFullName = getFullNamePreferredPerson(personViewedInDrawer);
  const authenticatedPerson = getAppContextValue('authenticatedPerson');

  // checks window width for responsiveness
  useEffect(() => {
    const handleWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleWindowWidth);
    return () => window.removeEventListener('resize', handleWindowWidth);
  }, []);

  useEffect(() => {
    setViewerIsThisAuthenticatedPerson(authenticatedPerson && getAppContextValue('profileDrawerPersonId') === authenticatedPerson.personId);
  }, [getAppContextValue, authenticatedPerson]);

  const profileNavOptions = [
    { icon: <AccountCircle />, linkName: 'visibleProfile', linkTextJsx: <>Visible Profile</> },
  ];

  if (viewerIsThisAuthenticatedPerson || viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights)) {
    profileNavOptions.push(
      { icon: <ManageAccounts />, linkName: 'nameAndPhoto', linkTextJsx: <>Edit Info</> },
      { icon: <CalendarMonth />, linkName: 'personAvailability', linkTextJsx: <>Availability</> },
      { icon: <TaskAlt />, linkName: 'personTasks', linkTextJsx: <>Onboarding Tasks</> },
      { icon: <Quiz />, linkName: 'personQuestionnaires', linkTextJsx: <>Questionnaires</> },
    );
  }

  // useEffect to handle which component to display from nav
  useEffect(() => {
    let component = <></>;
    switch (displayProfileOption) {
      case 'nameAndPhoto':
        component = (
          <>
            <ProfileComponentTitle>Edit Info</ProfileComponentTitle>
            <EditPersonDrawerMainContent />
          </>
        );
        break;
      case 'personAvailability':
        component = (
          <>
            <ProfileComponentTitle>Availability</ProfileComponentTitle>
            {personViewedInDrawer && (
              <EditPersonAwayForm personId={personViewedInDrawer.personId} />
            )}
          </>
        );
        break;
      case 'personQuestionnaires':
        component = (
          <>
            <ProfileComponentTitle>Questionnaires</ProfileComponentTitle>
            {personViewedInDrawer && (
              <ViewQuestionnairesForPerson personId={personViewedInDrawer.personId} />
            )}
          </>
        );
        break;
      case 'personTasks':
        component = (
          <>
            <ProfileComponentTitle>Onboarding Tasks</ProfileComponentTitle>
            <EditPersonTasksDrawerMainContent />
          </>
        );
        break;
      case 'securityAndSignIn':
        component = (
          <>
            <ProfileComponentTitle>Security & Sign In</ProfileComponentTitle>
          </>
        );
        break;
      case 'visibleProfile':
        component = (
          <>
            <ProfileComponentTitle>Visible Profile</ProfileComponentTitle>
            {personViewedInDrawer && (
              <VisibleProfile personId={personViewedInDrawer.personId} />
            )}
          </>
        );
        break;
      default:
        // console.log('In HeaderProfileDrawer useEffect default case');
        if (displayProfileOption !== 'nameAndPhoto') {
          setDisplayProfileOption('nameAndPhoto');
        }
    }
    setDisplayProfileComponent(component);
  }, [displayProfileOption]);

  useEffect(() => {
    // console.log('HeaderProfileDrawer useEffect getAppContextValue(\'headerProfileSection\'):', getAppContextValue('headerProfileSection'), ', headerProfileSectionSetFromAppContext:', headerProfileSectionSetFromAppContext);
    if (getAppContextValue('headerProfileSection') && getAppContextValue('headerProfileSection') !== headerProfileSectionSetFromAppContext) {
      setHeaderProfileSectionSetFromAppContext(getAppContextValue('headerProfileSection'));
      setDisplayProfileOption(getAppContextValue('headerProfileSection'));
      setShowLinksToProfilePages(false);
    }
  }, [getAppContextValue]);

  const onCloseDrawer = () => {
    // console.log('HeaderProfileDrawer onCloseDrawer');
    setAppContextValue('headerProfileSection', 'nameAndPhoto');
    setHeaderProfileSectionSetFromAppContext('unset');
    setShowLinksToProfilePages(true);
  };

  const onNavLinkClick = (linkName) => {
    setDisplayProfileOption(linkName);
    setShowLinksToProfilePages(false);
  };

  const signOutApi = async () => {
    // I don't think we want to make the weConnectQueryFn call here since we are about to call mutateLogout
    const data = await weConnectQueryFn('logout', {}, METHOD.POST);
    console.log('signOutApi in HeaderBar data: ', data);
    // console.log(`/logout response in HeaderBar -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
    clearSignedInGlobals(setAppContextValue, getAppContextData);
    navigate('/login');
    mutateLogout();
    setAppContextValue('headerProfileDrawerOpen', false);
  };

  const linksToProfilePages = profileNavOptions.map((option) => (
    <NavLinkContainer
      selected={displayProfileOption === option.linkName}
      onClick={() => onNavLinkClick(option.linkName)}
      key={option.linkName}
    >
      {option.icon}
      <NavLink>
        {option.linkTextJsx}
      </NavLink>
    </NavLinkContainer>
  ));

  const SignOutJsx = (
    <div>
      <Button
        variant="outlined"
        sx={{ border: 'none' }}
        id="signOutButton"
        onClick={() => signOutApi()}
      >
        Sign Out
      </Button>
    </div>
  );

  const headerTitleJSX = (
    <>
      {!showLinksToProfilePages && (
        <MenuIconWrapper onClick={() => setShowLinksToProfilePages(true)}>
          <Menu />
        </MenuIconWrapper>
      )}
      {viewerIsThisAuthenticatedPerson ? (
        <YourAccountWrapper>
          <AccountCircleStyled />
          <p>Your account</p>
        </YourAccountWrapper>
      ) : (
        <YourAccountWrapper>
          <p>{personViewedInDrawerFullName}</p>
        </YourAccountWrapper>
      )}
    </>
  );

  // main content logic for mobile or desktop
  const mainContentJsx = (
    <EditProfileDrawerWrapper>
      {windowWidth < 768 ? (
        <>
          {showLinksToProfilePages ? (
            <NavLinksContainer>
              {linksToProfilePages}
              {SignOutJsx}
            </NavLinksContainer>
          ) : (
            <>
              <LinkComponentContainer>{displayProfileComponent}</LinkComponentContainer>
            </>
          )}
        </>
      ) : (
        <>
          <NavLinksContainer>
            {linksToProfilePages}
            {SignOutJsx}
          </NavLinksContainer>
          <div>
            <LinkComponentContainer>{displayProfileComponent}</LinkComponentContainer>
          </div>
        </>
      )}
    </EditProfileDrawerWrapper>
  );

  return (
    <DrawerTemplateHeaderProfile
      drawerId="headerProfileDrawer"
      drawerOpenGlobalVariableName="headerProfileDrawerOpen"
      headerTitleJsx={headerTitleJSX}
      headerFixedJsx={headerFixedJsx}
      mainContentJsx={mainContentJsx}
      onDrawerClose={onCloseDrawer}
    />
  );
};

const AccountCircleStyled = styled(AccountCircle)`
  margin-right: 8px;
`;

const MenuIconWrapper = styled.button`
  display: none;

  @media (max-width: 768px) {
    align-items: center;
    border: none;
    color: ${DesignTokenColors.whiteUI};
    background: transparent;
    display: flex;
    border-right: 1px solid ${DesignTokenColors.whiteUI};
    justify-content: center;
    margin-right: 16px;
    padding: 4px 16px 4px 4px;
  }
`;

const YourAccountWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-around;
  width: 100%;
`;

const EditProfileDrawerWrapper = styled.div`
  display: flex;
  gap: 32px;
  margin-top: 80px;
`;

const NavLinksContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: -16px;
`;

const LinkComponentContainer = styled.div`
  width: 100%;
`;

const NavLinkContainer = styled.div`
  align-items: center;
  background: ${(props) => (props.selected ? `${DesignTokenColors.primary50}` : 'transparent')};
  border-left: ${(props) => (props.selected ? `4px solid ${DesignTokenColors.primary600}` : '4px solid transparent')};
  border-radius: 0 20px 20px 0;
  color: ${(props) => (props.selected ? `${DesignTokenColors.primary600}` : `${DesignTokenColors.neutralUI600}`)};
  cursor: pointer;
  display: flex;
  height: 40px;
  padding-left: 16px;
  width: 210px;

  @media (max-width: 768px) {
    background: transparent;
    border-left: none;
    color: ${DesignTokenColors.neutralUI600};
  }
`;

const NavLink = styled.p`
  margin-left: 16px;
`;

const ProfileComponentTitle = styled('div')`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 16px;
`;

export default HeaderProfileDrawer;
