import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { renderLog } from '../common/utils/logging';
import { makeRequestParamsDictionary } from '../react-query/makeRequestParams';
import { usePersonSaveMutation } from '../react-query/mutations';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';

const ReactQuerySaveReadTest = (personId) => {
  renderLog('ReactQuerySaveReadTest');
  const { mutate } = usePersonSaveMutation();
  const [personFromAPI, setPersonFromAPI] = useState(undefined);
  const [personSentToMutation, setPersonSentToMutation] = useState(undefined);
  const [misses, setMisses] = useState(0);
  const [matches, setMatches] = useState(0);
  const [loop, setLoop] = useState(-1);
  const [startTest, setStartTest] = useState(false);
  const [testButtonEnabled, setTestButtonEnabled] = useState(true);

  const updatePersonViaMutation = (person) => {
    const personMutable = structuredClone(person);
    if (!personMutable.firstNamePreferred || personMutable.firstNamePreferred === 'NaN') {
      personMutable.firstNamePreferred = '0';
    }
    personMutable.firstNamePreferred = (parseInt(person?.firstNamePreferred) + 1).toString();
    setPersonSentToMutation(structuredClone(personMutable));  // Save off the sent value
    mutate(makeRequestParamsDictionary({ personId: personMutable.id }, { firstNamePreferred: personMutable.firstNamePreferred }));
  };

  const personListRetrieveResults = useFetchData(['person-list-retrieve'], {}, METHOD.GET);
  const { data: dataP, isSuccess: isSuccessP } = personListRetrieveResults;
  useEffect(() => {
    // console.log('useFetchData person-list-retrieve in Teams useEffect:', personListRetrieveResults);
    if (dataP && isSuccessP && startTest) {
      const personListFromAPI = Object.values(dataP.personList);
      const personFromAPITemp = personListFromAPI.find((per) => per.personId === parseInt(personId.personId));
      setPersonFromAPI(structuredClone(personFromAPITemp));
      // Do the compare
      if (personFromAPITemp && personSentToMutation) {
        const response = personFromAPITemp.firstNamePreferred;
        const mutationValue = personSentToMutation.firstNamePreferred;
        // console.log('sent: ', personSentToMutation);
        // console.log('received: ', personFromAPITemp);
        if (response !== mutationValue) {
          console.log('ERROR: mutation vs response mismatch person from API: ', personFromAPITemp.firstNamePreferred, ', person sent to mutation: ', personSentToMutation.firstNamePerferred);
          setMisses(misses + 1);
        } else {
          setMatches(matches + 1);
        }
      }
      setLoop(loop + 1);
      if (personFromAPITemp && loop < 499) {
        updatePersonViaMutation(personFromAPITemp);
      } else if (personFromAPITemp && loop >= 499) {
        setTestButtonEnabled(false);
      }
    }
  }, [dataP, isSuccessP]);

  const onClickTest = () => {
    setStartTest(true);
    mutate(makeRequestParamsDictionary({ personId: 1 }, { firstNamePreferred: 0 }));
  };

  return (
    <div style={{ margin: 80, padding: 20, backgroundColor: 'rgb(233,239,248, 0.5)' }}>
      <Button
        color="primary"
        variant="contained"
        onClick={onClickTest}
        disabled={!testButtonEnabled}
      >
        Do 500 Mutations and compare the received results
      </Button>
      {startTest ? (
        <table style={{ paddingTop: 20 }}>
          <tbody>
            <tr>
              <td style={{ paddingRight: 20, fontWeight: 700 }}>Mutating firstNamePreferred of person #{personId.personId}</td>
            </tr>
            <tr>
              <td style={{ paddingRight: 20 }}>updated person sent to mutation:</td>
              <td>{personSentToMutation?.firstName}</td>
              <td>{personSentToMutation?.firstNamePreferred}</td>
              <td>{personSentToMutation?.lastName}</td>
            </tr>
            <tr>
              <td>person received from API:</td>
              <td>{personFromAPI?.firstName}</td>
              <td>{personFromAPI?.firstNamePreferred}</td>
              <td>{personFromAPI?.lastName}</td>
            </tr>
            <tr>
              <td>loop:</td>
              <td>{loop}</td>
            </tr>
            <tr>
              <td>matches:</td>
              <td>{matches}</td>
            </tr>
            <tr>
              <td>errors:</td>
              <td>{misses}</td>
            </tr>
          </tbody>
        </table>
      ) : (' ')}
    </div>
  );
};
export default ReactQuerySaveReadTest;
