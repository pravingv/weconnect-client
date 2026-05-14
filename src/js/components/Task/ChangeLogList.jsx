import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { renderLog } from '../../common/utils/logging';
import { useProfileChangeLogRetrieveMutation } from '../../react-query/mutations';

const ChangeLogList = ({ personId }) => {
  renderLog('ChangeLogList');

  const [logs, setLogs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const { mutate: getLogs, isPending, error } = useProfileChangeLogRetrieveMutation();

  useEffect(() => {
    if (personId) {
      getLogs({ personId }, {
        onSuccess: (data) => {
          if (data && data.changeLogList) {
            setLogs(data.changeLogList);
            setCurrentPage(1);
          }
        },
      });
    }
  }, [personId, getLogs]);

  const totalPages = Math.ceil(logs.length / rowsPerPage);

  const currentRows = useMemo(() => {
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    return logs.slice(indexOfFirstRow, indexOfLastRow);
  }, [logs, currentPage]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (isPending) return <StatusWrapper>Loading history...</StatusWrapper>;
  if (error) return <StatusWrapper style={{ color: 'red' }}>Error loading logs.</StatusWrapper>;

  return (
    <Container>
      <Title>Change Log</Title>
      <LogTable>
        <thead>
          <tr>
            <th>Action & Detail</th>
            <th>Target Person</th>
            <th>Team</th>
            <th>Who Made Change</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((log) => (
              <tr key={`log-row-${log.id}`}>
                <td className="description">
                  <strong>{log.changeDescription.split(':')[0]}</strong>:
                  {log.changeDescription.split(':').slice(1).join(':')}
                </td>
                <td className="target">
                  <span className="name">{log.targetPersonName || 'Self'}</span>
                </td>
                <td className="team">
                  <span className="name">{log.teamName ? log.teamName : 'Not Applicable'}</span>
                </td>
                <td className="who">
                  <span className="name">{log.changedByPersonName}</span>
                  <span className="date">{log.dateCreatedFormatted}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="empty">No activity recorded yet.</td>
            </tr>
          )}
        </tbody>
      </LogTable>

      {logs.length > rowsPerPage && (
        <PaginationWrapper>
          <NavButton onClick={handlePrevious} disabled={currentPage === 1}>
            &laquo; Previous
          </NavButton>
          <PageIndicator>
            Page <b>{currentPage}</b> of {totalPages}
          </PageIndicator>
          <NavButton onClick={handleNext} disabled={currentPage === totalPages}>
            Next &raquo;
          </NavButton>
        </PaginationWrapper>
      )}
    </Container>
  );
};

ChangeLogList.propTypes = {
  personId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]).isRequired,
};

const Container = styled.div` margin-top: 25px; border-top: 1px solid #ccc; padding-top: 15px; `;
const Title = styled.h3` font-size: 1.1rem; margin-bottom: 12px; font-weight: 600; `;

const LogTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.85rem;
  th { text-align: left; padding: 10px 8px; border-bottom: 2px solid #eee; background: #fafafa; color: #666; font-weight: 600; }
  td { padding: 12px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  .description { color: #333; line-height: 1.4; }
  .target { color: #555; font-weight: 500; width: 120px; }
  .name { display: block; font-weight: 600; color: #222; }
  .date { display: block; font-size: 0.75rem; color: #888; margin-top: 4px; }
  .empty { text-align: center; padding: 30px; color: #999; }
`;

const PaginationWrapper = styled.div` display: flex; justify-content: center; align-items: center; margin-top: 20px; gap: 15px; `;
const NavButton = styled.button`
  padding: 6px 14px; font-size: 0.8rem; cursor: pointer; background: white; border: 1px solid #dcdcdc; border-radius: 4px;
  &:disabled { cursor: not-allowed; color: #bbb; border-color: #eee; }
  &:hover:not(:disabled) { background-color: #f8f9fa; border-color: #bbb; }
`;

const PageIndicator = styled.span` font-size: 0.85rem; color: #666; `;
const StatusWrapper = styled.div` padding: 20px; font-size: 0.9rem; color: #666; text-align: center; `;

export default ChangeLogList;
