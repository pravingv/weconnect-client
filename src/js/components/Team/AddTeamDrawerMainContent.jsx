import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import styled from 'styled-components';
import SearchBar2024 from '../../common/components/Search/SearchBar2024';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { SearchBarWrapper } from '../Style/sharedStyles';
import AddTeamForm from './AddTeamForm';


// eslint-disable-next-line no-unused-vars
const AddTeamDrawerMainContent = ({ classes }) => {  //  classes, teamId
  renderLog('AddTeamDrawerMainContent');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache } = useConnectAppContext();
  const { allTeamsCache } = apiDataCache;

  const [allTeamsList] = useState(Object.values(allTeamsCache));
  const [teamSearchResultsList, setTeamSearchResultsList] = useState([]);

  const clearFunction = () => {
    setTeamSearchResultsList([]);
  };

  const searchFunction = (incomingSearchText) => {
    // console.log('AddTeamDrawerMainContent searchFunction incomingSearchText: ', incomingSearchText);
    const isSearching = (incomingSearchText && incomingSearchText.length > 0);
    if (isSearching) {
      const isMatch = (team) => {
        if (team) {
          if (team.teamName && team.teamName.toLowerCase().includes(incomingSearchText.toLowerCase())) return true;
          if (team.description && team.description.toLowerCase().includes(incomingSearchText.toLowerCase())) return true;
        }
        return false;
      };
      const matchingTeams = allTeamsList ? allTeamsList.filter((team) => isMatch(team)) : [];
      if (matchingTeams && matchingTeams.length > 0) {
        setTeamSearchResultsList(matchingTeams);
      } else {
        setTeamSearchResultsList([]);
      }
    } else {
      setTeamSearchResultsList([]);
    }
  };

  return (
    <AddTeamDrawerMainContentWrapper>
      <SearchBarWrapper>
        <SearchBar2024
          placeholder="Search existing teams"
          searchFunction={searchFunction}
          clearFunction={clearFunction}
          searchUpdateDelayTime={250}
        />
      </SearchBarWrapper>
      {teamSearchResultsList.length > 0 && (
        <>
          {teamSearchResultsList.map((team) => (
            <TeamItem key={`teamResult-${team.id}`}>
              {team.teamName}
            </TeamItem>
          ))}
        </>
      )}
      <AddTeamWrapper>
        <AddTeamForm />
      </AddTeamWrapper>
    </AddTeamDrawerMainContentWrapper>
  );
};
AddTeamDrawerMainContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = () => ({
});

const AddTeamDrawerMainContentWrapper = styled('div')`
`;

const AddTeamWrapper = styled('div')`
  margin-top: 32px;
`;


const TeamItem = styled('div')`
`;

export default withStyles(styles)(AddTeamDrawerMainContent);
