import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { viewerCanSeeOrDo } from '../../models/AuthModel';
import { EditStyled } from '../Style/iconStyles';


const TeamHeader = ({ showHeaderLabels, showIcons, team }) => {
  renderLog('TeamHeader');
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { viewerAccessRights } = apiDataCache;

  let teamLocal = team;
  if (!teamLocal || !teamLocal.teamName) {
    teamLocal = getAppContextValue('teamForAddTeamDrawer');
  }

  const editTeamClick = () => {
    // console.log('editTeamClick: ', teamLocal);
    setAppContextValue('addTeamDrawerOpen', true);
    setAppContextValue('AddTeamDrawerLabel', 'Edit Team Name');
    setAppContextValue('teamForAddTeamDrawer', teamLocal);
  };

  // console.log('TeamHeader teamLocal.teamName ', teamLocal.teamName);
  return (
    <OneTeamHeader>
      {/* Width (below) of this TeamHeaderCell comes from the combined widths of the first x columns in TeamMemberList */}
      <TeamHeaderCell $cellwidth={showHeaderLabels ? 215 : 500} $largefont $titlecell>
        {teamLocal && (
          <Link to={`/team-home/${teamLocal.id}`}>
            {teamLocal.teamName}
          </Link>
        )}
      </TeamHeaderCell>
      <TeamHeaderCell $cellwidth={showHeaderLabels ? 300 : 15}>
        {showHeaderLabels ? 'Location' : ''}
      </TeamHeaderCell>
      <TeamHeaderCell $cellwidth={225}>
        {showHeaderLabels ? 'Title / Volunteering Love' : ''}
      </TeamHeaderCell>
      {/* Edit icon */}
      {showIcons && (
        <>
          {viewerCanSeeOrDo('canEditTeamAnyTeam', viewerAccessRights) && (
            <TeamHeaderCell $cellwidth={20} onClick={editTeamClick}>
              <EditStyled />
            </TeamHeaderCell>
          )}
        </>
      )}
      {/* Delete icon - Moved to TeamHome */}
      {showIcons && (
        <></>
      )}
    </OneTeamHeader>
  );
};
TeamHeader.propTypes = {
  showHeaderLabels: PropTypes.bool,
  team: PropTypes.object,
  showIcons: PropTypes.bool,
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
});

const OneTeamHeader = styled('div')`
  align-items: center;
  display: flex;
  justify-content: flex-start;
  margin-top: 10px;
`;

const TeamHeaderCell = styled.div`
  align-content: center;
  border-bottom: ${(props) => (props?.$titleCell ? ';' : '1px solid #ccc;')}
  font-size: ${(props) => (props?.$largefont ? '1.1em;' : '.8em;')};
  font-weight: ${(props) => (props?.$titleCell ? ';' : '550;')}
  height: 22px;
  max-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  min-width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  width: ${(props) => (props.$cellwidth ? `${props.$cellwidth}px;` : ';')};
  overflow: hidden;
  white-space: nowrap;
`;

export default withStyles(styles)(TeamHeader);
