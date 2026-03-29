import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet-async';
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

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
  font-size: 16px;

  &:last-child {
    border-bottom: none;
  }
`;

const StatLabel = styled.span`
  color: #555;
  font-weight: 500;
`;

const StatValue = styled.span`
  color: #2196f3;
  font-weight: 600;
  font-size: 18px;
`;

export default function ReportsPage () {
  const { apiDataCache } = useConnectAppContext();
  const { allTeamsCache = {}, allTeamMembersCache = {}, allPeopleCache = {} } = apiDataCache;
  const dispatch = useConnectDispatch();

  const [statsState, setStatsState] = useState({
    onBothTeams: 0,
    onlyOnC3: 0,
    onlyOnC4: 0,
    notOnEither: 0,
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
    const c3Team = teams.find((team) => team.isC3Nonprofit === true);
    const c4Team = teams.find((team) => team.isC4Nonprofit === true);

    const c3TeamId = c3Team?.teamId;
    const c4TeamId = c4Team?.teamId;

    const c3Members = new Set(
      (allTeamMembersCache[c3TeamId] || [])
        .map((member) => member.personId)
        .filter((id) => id !== undefined && id !== null),
    );

    const c4Members = new Set(
      (allTeamMembersCache[c4TeamId] || [])
        .map((member) => member.personId)
        .filter((id) => id !== undefined && id !== null),
    );

    let onBothTeamsCount = 0;
    let onlyOnC3Count = 0;
    let onlyOnC4Count = 0;
    let notOnEitherCount = 0;

    Object.values(allPeopleCache).forEach((person) => {
      if (person.personId !== undefined && person.personId !== null) {
        const onC3 = c3Members.has(person.personId);
        const onC4 = c4Members.has(person.personId);

        if (onC3 && onC4) {
          onBothTeamsCount++;
        } else if (onC3) {
          onlyOnC3Count++;
        } else if (onC4) {
          onlyOnC4Count++;
        } else {
          notOnEitherCount++;
        }
      }
    });

    setStatsState({
      onBothTeams: onBothTeamsCount,
      onlyOnC3: onlyOnC3Count,
      onlyOnC4: onlyOnC4Count,
      notOnEither: notOnEitherCount,
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
          <StatRow>
            <StatLabel>on c3 & c4 team</StatLabel>
            <StatValue>{statsState.onBothTeams}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>only on c3 team</StatLabel>
            <StatValue>{statsState.onlyOnC3}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>only on c4 team</StatLabel>
            <StatValue>{statsState.onlyOnC4}</StatValue>
          </StatRow>
          <StatRow>
            <StatLabel>not on c3 or c4 team</StatLabel>
            <StatValue>{statsState.notOnEither}</StatValue>
          </StatRow>
        </ReportSection>
      </div>
    </>
  );
}
