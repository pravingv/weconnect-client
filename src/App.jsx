import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { DateTime } from 'luxon';
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router';
import styled from 'styled-components';
import muiTheme from './js/common/components/Style/muiTheme';
import { normalizedHref } from './js/common/utils/hrefUtils';
import initializejQuery from './js/common/utils/initializejQuery';
import { renderLog } from './js/common/utils/logging';
import Drawers from './js/components/Drawers/Drawers';
import PrivateRoute from './js/components/PrivateRoute';
import TasksDataRetrieve from './js/components/Task/TasksDataRetrieve';
import webAppConfig from './js/config';
import ConnectAppContext from './js/contexts/ConnectAppContext';
import Login from './js/pages/Login';


// Root URL pages

const AnswerQuestions = React.lazy(() => import(/* webpackChunkName: 'AnswerQuestions' */ './js/pages/AnswerQuestions'));
const FAQ = React.lazy(() => import(/* webpackChunkName: 'FAQ' */ './js/pages/FAQ'));
// const Footer = React.lazy(() => import(/* webpackChunkName: 'Footer' */ './js/components/Navigation/Footer'));
const Header = React.lazy(() => import(/* webpackChunkName: 'Header' */ './js/components/Navigation/Header'));
const PageNotFound = React.lazy(() => import(/* webpackChunkName: 'PageNotFound' */ './js/pages/PageNotFound'));
const QuestionnaireAnswers = React.lazy(() => import(/* webpackChunkName: 'QuestionnaireAnswers' */ './js/pages/QuestionnaireAnswers'));
const QuestionnaireQuestionList = React.lazy(() => import(/* webpackChunkName: 'QuestionnaireQuestionList' */ './js/pages/SystemSettings/Questionnaire'));
const SystemSettings = React.lazy(() => import(/* webpackChunkName: 'SystemSettings' */ './js/pages/SystemSettings/SystemSettings'));
const TeamHome = React.lazy(() => import(/* webpackChunkName: 'TeamHome' */ './js/pages/TeamHome'));
const TaskGroup = React.lazy(() => import(/* webpackChunkName: 'TaskGroup' */ './js/pages/SystemSettings/TaskGroup'));
const Tasks = React.lazy(() => import(/* webpackChunkName: 'Tasks' */ './js/pages/Tasks'));
// const TeamMembers = React.lazy(() => import(/* webpackChunkName: 'TeamMembers' */ './js/pages/TeamHome'));
const Teams = React.lazy(() => import(/* webpackChunkName: 'Teams' */ './js/pages/Teams'));


function App () {
  renderLog('App');
  const [hideHeader, setHideHeader] = useState(false);
  const [showDevtools] = useState(webAppConfig.ENABLE_REACT_QUERY_TOOLS !== undefined ? webAppConfig.ENABLE_REACT_QUERY_TOOLS : true);


  // Inject this once for the app, then it is the default for all ReactQuery queries
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // networkMode: 'always', // <-- This is not a solution, it just covers up some problem in our code, while disabling the biggest benefit of ReactQueries. Send queries to the server even if the cache has the data
        refetchOnWindowFocus: false,
        refetchOnMount: true,
        staleTime: 1000 * 60 * 5, // 5 minutes
      },
    },
  });

  useEffect(() => {
    console.log('--------- App.jsx loading ---------');
    initializejQuery(() => {
      console.log('--------- jQuery has been initialized, indicates that a new session has been created ---------');
    });
    return () => {
      // Anything in here is fired on component unmount, equiv to componentDidUnmount()
    };
  }, []);

  const setShowHeaderFooter = (showHeaderFooter) => {
    console.log('--------- setShowHeaderFooter: ', showHeaderFooter);
    setHideHeader(!showHeaderFooter);
  };

  DateTime.now().setZone('system');           // Initialize Luxon, to the local computer's time zone

  return (
    <>
      <StyledEngineProvider injectFirst>
        <QueryClientProvider client={queryClient}>
          <ConnectAppContext>
            <ThemeProvider theme={muiTheme}>
              <BrowserRouter>
                <WeVoteBody>
                  <Header hideHeader={hideHeader} params={{ }} pathname={normalizedHref()} />
                  <Drawers />
                  <Routes>
                    <Route path="/answers/:questionnaireId/:personId" element={<QuestionnaireAnswers />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/q/:questionnaireId/:personId" element={<AnswerQuestions setShowHeaderFooter={setShowHeaderFooter} />} />
                    <Route path="/q/:questionnaireId" element={<AnswerQuestions setShowHeaderFooter={setShowHeaderFooter} />} />
                    <Route element={<PrivateRoute />}>
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/questionnaire/:questionnaireId" element={<QuestionnaireQuestionList />} />
                      <Route path="/system-settings" element={<SystemSettings />} />
                      <Route path="/tasks" element={<Tasks />} />
                      <Route path="/task-group/:taskGroupId" element={<TaskGroup />} />
                      <Route path="/teams" element={<Teams />} />
                      <Route path="/team-home/:teamId" element={<TeamHome />} />
                      <Route path="/" element={<Teams />} />
                    </Route>
                    <Route path="*" element={<PageNotFound />} />
                  </Routes>
                  <TasksDataRetrieve />
                  {/* <Footer /> has problems */}
                  {showDevtools && (
                    <ReactQueryDevtools />
                  )}
                </WeVoteBody>
              </BrowserRouter>
            </ThemeProvider>
          </ConnectAppContext>
        </QueryClientProvider>
      </StyledEngineProvider>
    </>
  );
}

const WeVoteBody = styled('div')`
  // In WebApp, we rely on many of these from the body from main.css, including:
  background-color: #fff; // rgb(235, 236, 238); // #fafafa;
  color: #000;
  font-family: "Poppins", "Helvetica Neue Light", "Helvetica Neue", "Helvetica", "Arial", sans-serif;
  line-height: 1.4;
  margin: 0 auto;

  display: block;
  position: relative;
  z-index: 0;
  // this debug technique works!  ${() => console.log('-----------------------------')}
`;

export default App;
