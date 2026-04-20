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
            <th>Change Log</th>
            <th>Who Made Change</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.length > 0 ? (
            currentRows.map((log) => (
              <tr key={`log-row-${log.id}`}>
                <td className="description">{log.changeDescription}</td>
                <td className="who">
                  <span className="name">{log.changedByPersonName}</span>
                  <span className="date">{log.dateCreatedFormatted}</span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" className="empty">No activity recorded yet.</td>
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
const Title = styled.h3` font-size: 1.1rem; margin-bottom: 10px; `;
const LogTable = styled.table`
  width: 100%; border-collapse: collapse; font-size: 0.85rem;
  th { text-align: left; padding: 8px; border-bottom: 2px solid #eee; background: #fafafa; }
  td { padding: 10px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  .name { display: block; font-weight: bold; }
  .date { display: block; font-size: 0.75rem; color: #777; margin-top: 3px; }
  .empty { text-align: center; padding: 20px; color: #999; }
`;
const PaginationWrapper = styled.div` display: flex; justify-content: center; align-items: center; margin-top: 15px; gap: 20px; `;
const NavButton = styled.button`
  padding: 5px 12px; font-size: 0.8rem; cursor: pointer; background: white; border: 1px solid #ddd; border-radius: 4px;
  &:disabled { cursor: not-allowed; color: #ccc; }
  &:hover:not(:disabled) { background-color: #f5f5f5; }
`;
const PageIndicator = styled.span` font-size: 0.85rem; color: #555; `;
const StatusWrapper = styled.div` padding: 15px; font-size: 0.9rem; `;

export default ChangeLogList;
