import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';
import { METHOD, useFetchData } from '../../react-query/WeConnectQuery';
import { useConnectAppContext, useConnectDispatch } from '../../contexts/ConnectAppContext';
import { captureTeamListRetrieveData } from '../../models/TeamModel';
import capturePersonListRetrieveData from '../../models/capturePersonListRetrieveData';

const ReportTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  color: #333;
`;

const ReportSection = styled.div`
  margin-bottom: 32px;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #2196f3;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

/* Accordion UI - collapsible container for grouped lists */

const AccordionContainer = styled.div`
  margin-top: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
`;

const AccordionHeader = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  background: #f1f6ff;
  &:hover {
    background: #e7f0ff;
  }
`;

const AccordionBody = styled.div`
  padding: 12px;
  border-top: 1px solid #ddd;
  max-height: 300px;
  overflow-y: auto;
`;

/* Accordion component - reusable collapsible section for each category */

function Accordion ({ title, count, children }) {
  const [open, setOpen] = React.useState(false);

  return (
    <AccordionContainer>
      <AccordionHeader
        onClick={() => {
          if (count > 0) {
            setOpen(!open);
          }
        }}
      >
        <span>{title}</span>
        <span>
          {count} {count > 0 && (open ? '▲' : '▼')}
        </span>
      </AccordionHeader>

      {open && count > 0 && (
        <AccordionBody>
          {children}
        </AccordionBody>
      )}
    </AccordionContainer>
  );
}

Accordion.propTypes = {
  title: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  children: PropTypes.node,
};

export default function ReportsPage () {
  const { apiDataCache } = useConnectAppContext();
  const { allTeamsCache = {}, allTeamMembersCache = {}, allPeopleCache = {} } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [statsState, setStatsState] = useState({
    onBothTeams: [],
    onlyOnC3: [],
    onlyOnC4: [],
    notOnEither: [],
  });

  const teamListRetrieveResults = useFetchData(['team-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (teamListRetrieveResults) {
      captureTeamListRetrieveData(teamListRetrieveResults, apiDataCache, dispatch);
    }
  }, [teamListRetrieveResults, apiDataCache, dispatch]);

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  useEffect(() => {
    if (personListRetrieveResults) {
      capturePersonListRetrieveData(personListRetrieveResults, apiDataCache, dispatch);
    }
  }, [personListRetrieveResults, apiDataCache, dispatch]);

  useEffect(() => {
    // Calculate statistics based on team membership and nonprofit status
    const teams = Object.values(allTeamsCache);
    const c3Teams = teams.filter((team) => team.isC3Nonprofit === true);
    const c4Teams = teams.filter((team) => team.isC4Nonprofit === true);
    // Get all c3 teamIds
    const c3TeamIds = c3Teams
      .map((team) => team.teamId)
      .filter((id) => id !== undefined && id !== null);

    // Collect all members across all c3 teams
    const c3Members = new Set(
      c3TeamIds.flatMap((teamId) => (
        (allTeamMembersCache[teamId] ?? [])
          .map((member) => member.personId)
          .filter((id) => id !== undefined && id !== null)
      )),
    );

    // Get all c4 teamIds
    const c4TeamIds = c4Teams
      .map((team) => team.teamId)
      .filter((id) => id !== undefined && id !== null);

    // Collect all members across all c4 teams
    const c4Members = new Set(
      c4TeamIds.flatMap((teamId) => (
        (allTeamMembersCache[teamId] ?? [])
          .map((member) => member.personId)
          .filter((id) => id !== undefined && id !== null)
      )),
    );

    const onBoth = [];
    const onlyC3 = [];
    const onlyC4 = [];
    const notEither = [];

    Object.values(allPeopleCache).forEach((person) => {
      // Check if the person is active and not resigned
      if (person.personId !== undefined && person.personId !== null && person.statusActive !== false && !person.statusResigned) {
        const onC3 = c3Members.has(person.personId);
        const onC4 = c4Members.has(person.personId);

        const id = person.personId;

        if (onC3 && onC4) {
          onBoth.push(id);
        } else if (onC3) {
          onlyC3.push(id);
        } else if (onC4) {
          onlyC4.push(id);
        } else {
          notEither.push(id);
        }
      }
    });

    setStatsState({
      onBothTeams: onBoth,
      onlyOnC3: onlyC3,
      onlyOnC4: onlyC4,
      notOnEither: notEither,

    });
  }, [allTeamsCache, allTeamMembersCache, allPeopleCache]);

  return (
    <>
      <Helmet>
        <title>Reports - WeConnect Admin</title>
      </Helmet>
      <div style={{ maxWidth: '1500px', margin: '0 auto', padding: '24px', paddingTop: '80px' }}>
        <ReportTitle>System Reports</ReportTitle>

        <ReportSection>
          <SectionTitle>Active Individuals by Team Membership</SectionTitle>

          <Accordion
            title="on c3 & c4 team"
            count={statsState.onBothTeams.length}
          >
            {statsState.onBothTeams.map((id) => {
              const person = allPeopleCache[id];
              return (
                <div key={id}>
                  {person.firstName} {person.lastName}
                </div>
              );
            })}
          </Accordion>

          <Accordion
            title="only on c3 team"
            count={statsState.onlyOnC3.length}
          >
            {statsState.onlyOnC3.map((id) => {
              const person = allPeopleCache[id];
              return (
                <div key={id}>
                  {person.firstName} {person.lastName}
                </div>
              );
            })}
          </Accordion>

          <Accordion
            title="only on c4 team"
            count={statsState.onlyOnC4.length}
          >
            {statsState.onlyOnC4.map((id) => {
              const person = allPeopleCache[id];
              return (
                <div key={id}>
                  {person.firstName} {person.lastName}
                </div>
              );
            })}
          </Accordion>

          <Accordion
            title="not on c3 or c4 team"
            count={statsState.notOnEither.length}
          >
            {statsState.notOnEither.map((id) => {
              const person = allPeopleCache[id];
              return (
                <div key={id}>
                  {person.firstName} {person.lastName}
                </div>
              );
            })}
          </Accordion>
        </ReportSection>
      </div>
    </>
  );
}
