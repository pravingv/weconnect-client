import { Button } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router';
import styled from 'styled-components';
import convertToInteger from '../common/utils/convertToInteger';
import { renderLog } from '../common/utils/logging';
import { ActionBarItem, ActionBarSection } from '../components/Style/actionBarStyles';
import { SpanWithLinkStyle } from '../components/Style/linkStyles';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import TeamHeader from '../components/Team/TeamHeader';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../models/AuthModel';
import { captureTeamListRetrieveData, useGetTeamById } from '../models/TeamModel';
import { useRemoveTeamMutation } from '../react-query/mutations';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';


const TeamHome = ({ classes }) => {
  renderLog('TeamHome');
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { allTeamsCache, viewerAccessRights } = apiDataCache;
  const dispatch = useConnectDispatch();
  const { mutate: removeTeamMutation } = useRemoveTeamMutation();

  const params  = useParams();
  const [hideInactive, setHideInactive] = useState(true);
  const [team, setTeam] = useState(useGetTeamById(convertToInteger(params.teamId)));
  const [teamId, setTeamId] = useState(convertToInteger(params.teamId));

  // const updateTeam = (tList) => {
  //   const oneTeam = tList.find((person) => person.teamId === parseInt(teamId));
  //   setTeam(oneTeam);
  // };

  // const isAddPersonDrawerOpen = document.getElementById('addPersonDrawer');

  // Steve question: is this even used?
  // Dale answer: I moved this 'person-list-retrieve' call to TeamMemberList to be next to where the data is used, although
  // it might be better to leave common API calls here on the page level, TBD.
  // const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  // useEffect(() => {
  //   if (personListRetrieveResults) {
  //     capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
  //   }
  // }, [personListRetrieveResults, allPeopleCache, dispatch]);

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (teamListRetrieveResults) {
      captureTeamListRetrieveData(teamListRetrieveResults, apiDataCache, dispatch);
    }
  }, [teamListRetrieveResults, allTeamsCache, apiDataCache, dispatch]);

  useEffect(() => {
    // console.log('TeamHome teamId: ', teamId, ', allTeamsCache:', allTeamsCache);
    if (allTeamsCache && teamId && allTeamsCache[teamId]) {
      setTeam(allTeamsCache[teamId]);
    }
  }, [allTeamsCache, teamId]);

  useEffect(() => {
    if (params.teamId && params.teamId !== teamId) {
      setTeamId(convertToInteger(params.teamId));
    }
  }, [params, teamId]);

  const addMeetingClick = () => {
    console.log('TeamHome addMeetingClick, teamId:', teamId);
    setAppContextValue('editMeetingDrawerOpen', true);
    setAppContextValue('editMeetingDrawerLabel', 'Add Meeting');
    setAppContextValue('editMeetingDrawerTeamId', teamId);
  };

  const addTeamMemberClick = () => {
    // console.log('TeamHome addTeamMemberClick, teamId:', teamId);
    setAppContextValue('addPersonDrawerOpen', true);
    setAppContextValue('AddPersonDrawerLabel', 'Add Team Member');
    setAppContextValue('addPersonDrawerTeam', team);
  };

  const hideInactiveClick = () => {
    setHideInactive(!hideInactive);
  };

  const removeTeamClick = () => {
    // console.log('removeTeamMutation team: ', teamLocal.id);
    removeTeamMutation({ teamId });
  };

  return (
    <div>
      <Helmet>
        <title>
          Team Home -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
        {/* TODO 1/12/25: The following line might be reloading the app, consider using navigate() */}
        {/* <link rel="canonical" href={`${webAppConfig.WECONNECT_URL_FOR_SEO}/team-home`} /> */}
      </Helmet>
      <PageContentContainer>
        <TeamsActionBarWrapperSpacer />
        <h1>{team ? team.teamName : 'none'}</h1>
        <div>
          Team Home for
          {' '}
          {team ? team.teamName : 'none'}
          {' '}
          -
          {' '}
          <Link to="/teams">team list</Link>
        </div>
        <TeamHomeActionBarWrapper>
          <ActionBarSection>
            {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
              <ActionBarItem>
                <SpanWithLinkStyle onClick={() => addTeamMemberClick()}>
                  Add team member
                </SpanWithLinkStyle>
              </ActionBarItem>
            )}
            <ActionBarItem>
              <SpanWithLinkStyle onClick={() => hideInactiveClick()}>
                {hideInactive ? 'Show inactive team members' : 'Hide inactive team members'}
              </SpanWithLinkStyle>
            </ActionBarItem>
          </ActionBarSection>
        </TeamHomeActionBarWrapper>
        {(teamId && team) && (
          <>
            <TeamHeader
              team={team}
              showAllTeamMembersFromParent
              // showAllTeamMembers={(teamMemberList && teamMemberList.length > 0)}
              showIcons
            />
          </>
        )}
        {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
          <div>
            <Button
              classes={{ root: classes.addTeamMemberButtonRoot }}
              color="primary"
              variant="outlined"
              onClick={addTeamMemberClick}
              sx={{ marginTop: '30px' }}
            >
              Add Team Member
            </Button>
          </div>
        )}
        {viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights) && (
          <div>
            <Button
              classes={{ root: classes.addTeamMemberButtonRoot }}
              color="primary"
              variant="outlined"
              onClick={addMeetingClick}
              sx={{ marginTop: '30px' }}
            >
              Add Meeting
            </Button>
          </div>
        )}
        {viewerCanSeeOrDo(['canRemoveTeam'], viewerAccessRights) && (
          <div>
            <Button
              classes={{ root: classes.deleteTeamButtonRoot }}
              color="primary"
              variant="outlined"
              onClick={removeTeamClick}
              sx={{ marginTop: '30px' }}
            >
              Delete Team
            </Button>
          </div>
        )}
      </PageContentContainer>
    </div>
  );
};
TeamHome.propTypes = {
  classes: PropTypes.object.isRequired,
  // params: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  addTeamMemberButtonRoot: {
    width: 180,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  deleteTeamButtonRoot: {
    width: 180,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

// const TeamMember = styled('div')`
// `;

const TeamHomeActionBarWrapper = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-top: 40px;  // Temporary hack
`;

const TeamsActionBarWrapperSpacer = styled('div')`
  margin-top: 60px;
`;

export default withStyles(styles)(TeamHome);
