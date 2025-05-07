import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { captureTeamListRetrieveData } from '../../models/TeamModel';


const ViewTeamsForPerson = ({ personId }) => {
  renderLog('ViewTeamsForPerson');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, setAppContextValue } = useConnectAppContext();
  const { allPeopleTeamIdLists, allTeamsCache } = apiDataCache;
  const dispatch = useConnectDispatch();
  const navigate = useNavigate();

  const [teamList, setTeamList] = useState([]);

  const goToTeamHome = (teamId) => {
    setAppContextValue('headerProfileDrawerOpen', false);
    setAppContextValue('profileDrawerPerson', null);
    setAppContextValue('profileDrawerPersonId', null);
    setTimeout(() => navigate(`/team-home/${teamId}`), 50);
  };

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    // console.log('teamListRetrieveResults in Team useEffect captureTeamListRetrieveData');
    if (teamListRetrieveResults) {
      captureTeamListRetrieveData(teamListRetrieveResults, apiDataCache, dispatch);
    }
  }, [teamListRetrieveResults, allTeamsCache]);

  useEffect(() => {
    if (allTeamsCache && allPeopleTeamIdLists && personId) {
      const personTeamIds = allPeopleTeamIdLists[personId] || [];
      const filteredTeams = Object.values(allTeamsCache).filter((team) => personTeamIds.includes(team.teamId));
      setTeamList(filteredTeams);
    }
  }, [allPeopleTeamIdLists, allTeamsCache, personId]);

  return (
    <ViewTeamsForPersonWrapper>
      <TeamOptions>
        {teamList.map((team) => (
          <OneTeam key={`team-${team.teamId}`}>
            <div>{team.teamName}</div>
            <div>
              <Link
                to={`/team-home/${team.teamId}`}
                onClick={(event) => { event.stopPropagation(); goToTeamHome(team.teamId); }}
              >
                Go to team home
              </Link>
            </div>
          </OneTeam>
        ))}
      </TeamOptions>
    </ViewTeamsForPersonWrapper>
  );
};
ViewTeamsForPerson.propTypes = {
  personId: PropTypes.number,
};

const OneTeam = styled('div')`
  margin-bottom: 24px;
`;

const ViewTeamsForPersonWrapper = styled('div')`
`;

const TeamOptions = styled('div')`
`;

export default ViewTeamsForPerson;
