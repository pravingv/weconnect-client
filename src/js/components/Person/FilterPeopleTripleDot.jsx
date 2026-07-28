import { VisibilityOutlined } from '@mui/icons-material';
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import Popover from '@mui/material/Popover';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import DesignTokenColors from '../../common/components/Style/DesignTokenColors';
import { renderLog } from '../../common/utils/logging';
import { SpanWithLinkStyle } from '../Style/linkStyles';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { isInOfferProcess } from '../../controllers/PersonController';
import { viewerCanSeeOrDo } from '../../models/AuthModel';


const FilterPeopleTripleDot = ({ classes }) => { // teamId
  renderLog('FilterPeopleTripleDot');  // Set LOG_RENDER_EVENTS to log all renders
  const { apiDataCache, getAppContextValue, setAppContextValue } = useConnectAppContext();
  const { allPeopleCache, viewerAccessRights } = apiDataCache;

  const [anchorEl, setAnchorEl] = useState(null);
  const [viewerIsOnHrTeam, setViewerIsOnHrTeam] = useState(false);

  const counts = useMemo(() => {
    const people = allPeopleCache ? Object.values(allPeopleCache) : [];
    const activePeople = people.filter((p) => p.statusActive === true);
    return {
      inOfferProcess: activePeople.filter((p) => isInOfferProcess(p)).length,
      onLeave: people.filter((p) => p.statusOnLeave === true).length,
      resigned: people.filter((p) => p.statusResigned === true).length,
      availableForSpecialProjects: people.filter((p) => p.statusAvailableForSpecialProjects === true).length,
      teamLeads: activePeople.filter((p) => p.isTeamLead === true).length,
      hiringManagers: activePeople.filter((p) => p.isHiringManager === true).length,
      interns: people.filter((p) => p.isIntern === true).length,
    };
  }, [allPeopleCache]);

  useEffect(() => {
    setViewerIsOnHrTeam(viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights));
  }, [viewerAccessRights]);

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const onDotButtonClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const uncheckAllExactMatchOptions = () => {
    setAppContextValue('isInternPeopleFilter', false);
    setAppContextValue('isHiringManagerPeopleFilter', false);
    setAppContextValue('isTeamLeadPeopleFilter', false);
    setAppContextValue('statusAvailableForSpecialProjectsPeopleFilter', false);
    setAppContextValue('statusOnLeavePeopleFilter', false);
    setAppContextValue('statusResignedPeopleFilter', false);
    setAppContextValue('statusInOfferProcessPeopleFilter', false);
  };

  useEffect(() => {
    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === null || getAppContextValue('peopleFilterExactMatchVsLogicalOr') === undefined) {
      setAppContextValue('peopleFilterExactMatchVsLogicalOr', 'LOGICAL_OR');
    }
    if (getAppContextValue('statusInOfferProcessPeopleFilter') === null || getAppContextValue('statusInOfferProcessPeopleFilter') === undefined) {
      setAppContextValue('statusInOfferProcessPeopleFilter', true);
    }
  }, []);

  // const canEditPerson = viewerCanSeeOrDo(['canEditPersonAnyone'], viewerAccessRights) || viewerCanSeeOrDoForThisTeam('canEditPersonThisTeam', teamId, viewerTeamAccessRights);
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;
  return (
    <FilterPeopleTripleDotWrapper>
      <TripleDotButton type="button" aria-label="source" onClick={onDotButtonClick}>
        <TripleDotButtonContents>
          <VisibilityOutlinedStyled />
          <div>
            <SpanWithLinkStyle>
              Show
            </SpanWithLinkStyle>
          </div>
        </TripleDotButtonContents>
      </TripleDotButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <PopoverWrapper>
          <FormControl>
            <FormLabel id="includeOrOnlyId">SHOW</FormLabel>
            <RadioGroup
              aria-labelledby="includeOrOnlyId"
              value={getAppContextValue('peopleFilterExactMatchVsLogicalOr')}
              name="includeOrOnly"
              onChange={(event) => {
                setAppContextValue('peopleFilterExactMatchVsLogicalOr', event.target.value);
                if (event.target.value === 'LOGICAL_OR') {
                  // Uncheck options only offered for "EXACT_MATCH" options
                  setAppContextValue('isHiringManagerPeopleFilter', false);
                  setAppContextValue('isInternPeopleFilter', false);
                  setAppContextValue('isTeamLeadPeopleFilter', false);
                }
              }}
              row
              sx={{ paddingBottom: '20px' }}
            >
              <FormControlLabel
                control={<Radio />}
                key="includeKey"
                label="Include"
                value="LOGICAL_OR"
              />
              <FormControlLabel
                control={<Radio />}
                key="onlyKey"
                label="Only"
                value="EXACT_MATCH"
              />
            </RadioGroup>
          </FormControl>
          <FormControl classes={{ root: classes.formControl }}>
            <CheckboxLabel
              classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('statusInOfferProcessPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="statusInOfferProcessPeopleFilterId"
                  name="statusInOfferProcessPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' && event.target.checked) {
                      uncheckAllExactMatchOptions();
                    }
                    setAppContextValue('statusInOfferProcessPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`In Offer Process (${webAppConfig.ORGANIZATION_NAME})`}
              label={`In Offer Process (${counts.inOfferProcess})`}
            />
            <CheckboxLabel
              classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('statusOnLeavePeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="statusOnLeavePeopleFilterId"
                  name="statusOnLeavePeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' && event.target.checked) {
                      uncheckAllExactMatchOptions();
                    }
                    setAppContextValue('statusOnLeavePeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`On Leave (${webAppConfig.ORGANIZATION_NAME})`}
              label={`On Leave (${counts.onLeave})`}
            />
            <CheckboxLabel
              classes={viewerIsOnHrTeam ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('statusResignedPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="statusResignedPeopleFilterId"
                  name="statusResignedPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' && event.target.checked) {
                      uncheckAllExactMatchOptions();
                    }
                    setAppContextValue('statusResignedPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`Resigned (${webAppConfig.ORGANIZATION_NAME})`}
              label={`Resigned (${counts.resigned})`}
            />
            <CheckboxLabel
              classes={getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('statusAvailableForSpecialProjectsPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="statusAvailableForSpecialProjectsPeopleFilterId"
                  name="statusAvailableForSpecialProjectsPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' && event.target.checked) {
                      uncheckAllExactMatchOptions();
                    }
                    setAppContextValue('statusAvailableForSpecialProjectsPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`Resigned (${webAppConfig.ORGANIZATION_NAME})`}
              label={`Available for Special Projects (${counts.availableForSpecialProjects})`}
            />
            <CheckboxLabel
              classes={getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('isTeamLeadPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="isTeamLeadPeopleFilterId"
                  name="isTeamLeadPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' && event.target.checked) {
                      uncheckAllExactMatchOptions();
                    }
                    setAppContextValue('isTeamLeadPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`Team Leads (${webAppConfig.ORGANIZATION_NAME})`}
              label={`Team Leads (${counts.teamLeads})`}
            />
            <CheckboxLabel
              classes={getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('isHiringManagerPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="isHiringManagerPeopleFilterId"
                  name="isHiringManagerPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' && event.target.checked) {
                      uncheckAllExactMatchOptions();
                    }
                    setAppContextValue('isHiringManagerPeopleFilter', event.target.checked);
                  }}
                />
              )}
              // label={`Team Leads (${webAppConfig.ORGANIZATION_NAME})`}
              label={`Hiring Managers (${counts.hiringManagers})`}
            />
            <CheckboxLabel
              classes={getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' ? { label: classes.checkboxLabel } : { root: classes.hideThisField }}
              control={(
                <Checkbox
                  checked={getAppContextValue('isInternPeopleFilter') || false}
                  className={classes.checkboxRoot}
                  color="primary"
                  id="isInternPeopleFilterId"
                  name="isInternPeopleFilter"
                  onChange={(event) => {
                    if (getAppContextValue('peopleFilterExactMatchVsLogicalOr') === 'EXACT_MATCH' && event.target.checked) {
                      uncheckAllExactMatchOptions();
                    }
                    setAppContextValue('isInternPeopleFilter', event.target.checked);
                  }}
                />
              )}
              label={`Interns (${counts.interns})`}
            />
          </FormControl>
        </PopoverWrapper>
      </Popover>
    </FilterPeopleTripleDotWrapper>
  );
};
FilterPeopleTripleDot.propTypes = {
  classes: PropTypes.object.isRequired,
  // teamId: PropTypes.number,
};

const styles = () => ({
  checkboxLabel: {
    marginTop: 2,
  },
  checkboxRoot: {
    paddingTop: 0,
    paddingLeft: '9px',
    paddingBottom: 0,
  },
  formControl: {
    width: '100%',
  },
  hideThisField: {
    position: 'absolute',
    left: '-9999px',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  },
});

const CheckboxLabel = styled(FormControlLabel)`
  margin-bottom: 0 !important;
`;

const FilterPeopleTripleDotWrapper = styled('div')`
`;

const PopoverWrapper = styled('div')`
  padding: 5px;
`;

const TripleDotButton = styled('button')`
  background: transparent;
  border: 0;
  margin-right: -3px;
  margin-top: 4px;
  padding-right: 0;
`;

const TripleDotButtonContents = styled('div')`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const VisibilityOutlinedStyled = styled(VisibilityOutlined)`
  color: ${DesignTokenColors.primary500};
  cursor: pointer;
  margin-right: 2px;
  width: 16px;
  height: 16px;
`;

export default withStyles(styles)(FilterPeopleTripleDot);
