import { Button, TextField } from '@mui/material';
import { withStyles } from '@mui/styles';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import styled from 'styled-components';
import validator from 'validator';
import { authLog, renderLog } from '../common/utils/logging';
import compileDate from '../compileDate';
import ResetYourPassword from '../components/Login/ResetYourPassword';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import VerifySecretCodeModal from '../components/VerifySecretCodeModal';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { clearSignedInGlobals } from '../contexts/contextFunctions';
import { captureAccessRightsData } from '../models/AuthModel';
import { getFullNamePreferredPerson } from '../models/PersonModel';
import { useLogoutMutation } from '../react-query/mutations';
import weConnectQueryFn, { METHOD, useFetchData } from '../react-query/WeConnectQuery';


const Login = ({ classes }) => {
  renderLog('Login');
  const { apiDataCache, getAppContextValue, setAppContextValue, getAppContextData } = useConnectAppContext();
  const dispatch = useConnectDispatch();
  const { mutate: mutateLogout } = useLogoutMutation();

  const firstNameFldRef = useRef('');
  const lastNameFldRef = useRef('');
  const emailPersonalFldRef = useRef('');
  const emailOfficialFldRef = useRef('');
  const locationFldRef = useRef('');
  // const zipFldRef = useRef('');
  // const stateFldRef = useRef('');
  const passwordFldRef = useRef('');
  const confirmPasswordFldRef = useRef('');
  const authPerson = useRef(undefined);

  const [loginAttempted, setLoginAttempted] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [showCreateStuff, setShowCreateStuff] = useState(false);
  const [successLine, setSuccessLine] = useState('');
  const [warningLine, setWarningLine] = useState('');
  const [loginCount, setLoginCount] = useState(0);

  const { data: dataAuth, isSuccess: isSuccessAuth, isFetching: isFetchingAuth } = useFetchData(['get-auth'], {}, METHOD.POST);
  useEffect(() => {
    if (isSuccessAuth) {
      authLog('useFetchData get-auth in Login dataAuth:', dataAuth, isSuccessAuth, isFetchingAuth);

      const { isAuthenticated, person: authenticatedPerson, emailVerified: emailVerifiedFromAPI, personId } = dataAuth;
      authPerson.current = authenticatedPerson;
      if (authenticatedPerson) {
        setAppContextValue('isAuthenticated', isAuthenticated);
      }
      captureAccessRightsData(dataAuth, isSuccessAuth, apiDataCache, dispatch);
      if (!emailVerifiedFromAPI && personId > 0) {
        setWarningLine('');
        setSuccessLine('A verification email has been sent to your address');
        setAppContextValue('openVerifySecretCodeModalDialog', true);
      } else if (isAuthenticated && authenticatedPerson) {
        setSuccessLine(`Signed in as ${getFullNamePreferredPerson(authenticatedPerson)}`);
        setAppContextValue('loggedInPersonIsAdmin', dataAuth.loggedInPersonIsAdmin);
        if (loginAttempted) {  // if we navigate to here directly, not as a result of a loginAPI
          // setTimeout(() => {
          //   navigate('/tasks');
          setAppContextValue('navigatedFromLogin', true);
          // }, 2000);
        }
      } else if (!getAppContextValue('openVerifySecretCodeModalDialog')) {
        // console.log('======== appContextData in Login: Please sign in');
        setSuccessLine('Please sign in');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataAuth, isSuccessAuth]);

  const isAuth = getAppContextValue('isAuthenticated');
  useEffect(() => {
    // rerender if logged out from HeaderBar
    setLoginCount(loginCount + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuth]);

  const loginApi = async (email, password) => {
    if (!validator.isEmail(email)) {
      setWarningLine('Please enter a valid email address.');
      return;
    } else if (validator.isEmpty(password)) {
      setWarningLine('Password cannot be blank.');
      return;
    } else {
      setSuccessLine('');
      setSuccessLine('');
    }

    setLoginAttempted(true);  // so we know when to timeout to /tasks
    const data = await weConnectQueryFn('login', { email, password }, METHOD.POST);
    // console.log(`/login response -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
    // console.log('appContextData in Login after /login response: ', getAppContextData());
    if (data?.personId > 0) {
      setAppContextValue('isAuthenticated', data.emailVerified);
      setAppContextValue('authenticatedPerson', data.person);
      if (data.emailVerified) {
        setWarningLine('');
        passwordFldRef.current = '';   // Blank the email field after signing in
        setSuccessLine(`${getFullNamePreferredPerson(data.person)}, you are signed in!`);
        // setTimeout(() => {
        //   navigate('/tasks');
        // }, 4000);
      } else {
        authPerson.current = {      // just enough data for VerifySecretCodeModal
          personId: data.personId,
          personEmail: email.trim(),
        };
        setAppContextValue('openVerifySecretCodeModalDialog', true);
        setSuccessLine('A verification email has been sent to your address');
      }
    } else {
      setWarningLine(data?.error?.msg || 'error message with bad data');
      setSuccessLine('');
    }
  };

  const clearOnCreate = () => {
    console.log('clearOnCreate -------------- 1 ------------ ', openResetPasswordDialog);
    if (!openResetPasswordDialog) {
      console.log('clearOnCreate -------------- 2 ------------ ', openResetPasswordDialog);
      setAppContextValue('resetEmail', '');
      setAppContextValue('resetPassword', '');
      setAppContextValue('openVerifySecretCodeModalDialog', false);
      setAppContextValue('secretCodeVerified', false);
      setAppContextValue('secretCodeVerifiedForReset', false);
      setShowCreateStuff(false);
      const per = authPerson.current ? authPerson.current : getAppContextValue('authenticatedPerson');
      setSuccessLine(`${getFullNamePreferredPerson(per)}, you are signed in!`);
      passwordFldRef.current = '';   // Blank the email field after signing in
    }
  };

  const secretCodeVerified = getAppContextValue('secretCodeVerified');
  const resetPassword = getAppContextValue('resetPassword') || '';
  useEffect(() => {
    if (secretCodeVerified === true) {
      loginApi(emailPersonalFldRef.current.value, passwordFldRef.current.value).then(() => {
        clearOnCreate();
      });
    } else if (resetPassword && resetPassword.length) {
      loginApi(getAppContextValue('resetEmail'), getAppContextValue('resetPassword')).then(() => {
        clearOnCreate();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secretCodeVerified, resetPassword]);

  const logoutApiInLogin = async () => {
    const data = await weConnectQueryFn('logout', { credentials: 'same-origin' }, METHOD.POST);
    console.log(`/logout response -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
    if (data.authenticated) {
      setWarningLine(data?.errors?.msg);
      setSuccessLine('');
    } else {
      setWarningLine('');
      setSuccessLine('You are signed out');
      mutateLogout();
    }
  };

  const verifyYourEmail = async (personId) => {
    console.log('verifyYourEmail ----------------');
    if (!personId || personId < 1) {
      console.error('Invalid personId found in verifyYourEmail');
    }
    console.error('TESTING personId found in verifyYourEmail');
    const data = await weConnectQueryFn('send-email-code', { personId }, METHOD.POST);
    console.log(`/send-email-code response: data: ${JSON.stringify(data)}`);
  };

  const signupApi = async (firstName, lastName, location, emailPersonal, emailOfficial, password, confirmPassword) => {
    const params = { firstName, lastName, location, emailPersonal, emailOfficial, password, confirmPassword };
    const data = await weConnectQueryFn('signup', params, METHOD.POST);

    try {
      console.log(`/signup response -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
      let errStr = '';
      for (let i = 0; i < data.errors.length; i++) {
        errStr += data.errors[i]?.msg;
      }
      setWarningLine(errStr);
      if (data.personCreated) {
        setSuccessLine(`user # ${data.personId} created`);
        setSuccessLine(`user # ${data.personId} created`);
        authPerson.current = data.person;
        verifyYourEmail(data.personId).then(() => {
          setSuccessLine('A verification email has been sent to your address');
          console.log('verifyYourEmail in signupApi then clause , openVerifySecretCodeModalDialog true');
          setAppContextValue('openVerifySecretCodeModalDialog', true);
        });
      }
    } catch (e) {
      console.log('signup error', e);
    }
  };

  const loginPressed = () => {
    const email =  (emailPersonalFldRef.current.value).trim();
    const password = (passwordFldRef.current.value).trim();

    if (email.length === 0 || password.length === 0) {
      console.log('too short');
      setWarningLine('Enter a valid username and password');
    } else {
      setWarningLine('');
      loginApi(email, password).then();
    }
  };

  const removeSessionCookie = ()  => {
    const urlObject = new URL(webAppConfig.STAFF_API_SERVER_ROOT_URL);
    const updatedCookie = `WeConnectSession=; Max-Age=0; path=/; domain=${urlObject.hostname}`;
    document.cookie = updatedCookie;
    console.log('Login removeSessionCookie, cookie that was removed: ', updatedCookie);
  };

  const closeResetYourPassword = () => {
    clearSignedInGlobals(setAppContextValue, getAppContextData);
    console.log('closeResetYourPassword in Login before logutApiInLogin()');
    logoutApiInLogin().then(() => removeSessionCookie());
  };

  const signOutButtonPressed = () => {
    clearSignedInGlobals(setAppContextValue, getAppContextData);
    setOpenResetPasswordDialog(false);
    console.log('signOutButtonPressed in Login before logutApiInLogin()');
    logoutApiInLogin().then(() => removeSessionCookie());
  };

  const createPressed = () => {
    if (!showCreateStuff) {
      setShowCreateStuff(true);
      setWarningLine('');
      setSuccessLine('');
    } else {
      setWarningLine('');
      let errStr = '';
      const firstName =  firstNameFldRef.current.value;
      const lastName =  lastNameFldRef.current.value;
      const location =  locationFldRef.current.value;
      const emailPersonal =  emailPersonalFldRef.current.value;
      const emailOfficial =  emailOfficialFldRef.current.value;
      // const zipCode =  zipFldRef.current.value;
      // const stateCode =  stateFldRef.current.value;
      const password = passwordFldRef.current.value;
      const confirmPassword = confirmPasswordFldRef.current.value;
      if (!validator.isEmail(emailPersonal)) errStr += 'Please enter a valid personal email address. ';
      if (emailOfficial.length > 0 && !validator.isEmail(emailOfficial)) errStr += 'Please enter a valid secondary email address. ';
      if (!validator.isLength(password, { min: 8 })) errStr += 'Password must be at least 8 characters long. ';
      if (validator.escape(password) !== validator.escape(confirmPassword)) errStr += 'Passwords do not match. ';
      if (!validator.isLength(firstName, { min: 2 })) errStr += 'First names are required. ';
      if (!validator.isLength(lastName, { min: 2 })) errStr += 'Last names are required. ';

      if (errStr.length) {
        setWarningLine(errStr);
      } else {
        signupApi(firstName, lastName, location, emailPersonal, emailOfficial, password, confirmPassword);
      }
    }
  };

  const createForSomeoneElsePressed = () => {
    console.log('NOT YET IMPLEMENTED');
  };

  // console.log(getAppContextData());
  const isAdmin = getAppContextValue('loggedInPersonIsAdmin') || false;
  const isAuthSafe = getAppContextValue('isAuthenticated') || false;
  const displayVerify =
    authPerson.current &&
    Object.keys(authPerson.current).length > 0 &&
    getAppContextValue('secretCodeVerified') !== true &&
    (getAppContextValue('openVerifySecretCodeModalDialog') || false);

  return (
    <div>
      <Helmet>
        <title>
          Login -
          {' '}
          {webAppConfig.NAME_FOR_BROWSER_TAB_TITLE}
        </title>
      </Helmet>
      <PageContentContainer>
        <div style={{ marginLeft: '40px' }}>
          <h1 style={{ display: 'inline-block' }}>
            <span style={{ float: 'left', height: '100%' }}>
              <img
                alt="we vote logo"
                width="96px"
                src="../../img/global/svg-icons/we-vote-icon-square-color-dark.svg"
              />
            </span>
            <span style={{ float: 'right', height: '100%', padding: '31px 0 40px 0' }}>
              Sign in
            </span>
          </h1>
        </div>
        <div style={{ marginLeft: '80px' }}>
          <div id="warningLine" style={{ color: 'red', paddingTop: '10px', paddingBottom: '20px' }}>{warningLine}</div>
          <div id="successLine" style={{ color: 'green', paddingTop: '10px', paddingBottom: '20px' }}>{successLine}</div>
          <span style={{ display: 'flex' }}>
            <TextField id="FirstName"
                       label="First Name"
                       helperText={showCreateStuff ? 'Required' : ''}
                       variant="outlined"
                       inputRef={firstNameFldRef}
                       sx={{ paddingBottom: '15px',
                         paddingRight: '10px',
                         display: showCreateStuff ? 'block' : 'none'  }}
            />
            <TextField id="LastName"
                       label="Last Name"
                       helperText={showCreateStuff ? 'Required' : ''}
                       variant="outlined"
                       inputRef={lastNameFldRef}
                       sx={{ paddingBottom: '15px',
                         display: showCreateStuff ? 'block' : 'none'  }}
            />
          </span>
          <TextField id="email"
                     label={showCreateStuff ? 'Your personal email' : 'Your email address'}
                     helperText={showCreateStuff ? 'Required' : ''}
                     variant="outlined"
                     inputRef={emailPersonalFldRef}
                     sx={{ display: 'block', paddingBottom: '15px' }}
          />
          <TextField id="secondEmail"
                     label="Second Email"
                     helperText="Optional, possibly your wevote.us email"
                     variant="outlined"
                     inputRef={emailOfficialFldRef}
                     sx={{ paddingBottom: '15px',
                       display: showCreateStuff ? 'block' : 'none' }}
          />
          <TextField id="location"
                     label="Location"
                     variant="outlined"
                     inputRef={locationFldRef}
                     helperText="City, State (2 chars)"
                     sx={{ paddingBottom: '15px',
                       display: showCreateStuff ? 'block' : 'none'  }}
          />
          <span style={{ display: 'flex' }}>
            <TextField id="password"
                       label="Password"
                       variant="outlined"
                       inputRef={passwordFldRef}
                       // defaultValue="12345678"
                       sx={{ display: 'block', paddingBottom: '15px' }}
            />
            <TextField id="confirmPassword"
                       label="Confirm Password"
                       variant="outlined"
                       inputRef={confirmPasswordFldRef}
                       // defaultValue="12345678"
                       sx={{ padding: '0 0 15px 10px', display: showCreateStuff ? 'block' : 'none'  }}
            />
          </span>
          <span style={{ display: 'flex' }}>
            <Button
              classes={{ root: classes.loginButtonRoot }}
              color="primary"
              variant="contained"
              onClick={showCreateStuff ? createPressed : loginPressed}
              sx={{ marginBottom: '15px', display: showCreateStuff ? 'none' : 'flex'  }}
            >
              Sign In
            </Button>
            <Button
              classes={{ root: classes.loginButtonRoot }}
              color="primary"
              onClick={() => setOpenResetPasswordDialog(true)}
              sx={showCreateStuff ? { display: 'none' } : { margin: '0 0 15px 20px !important', width: '200px !important' }}
            >
              Reset your password
            </Button>
          </span>
          <div style={{ paddingTop: '35px' }} />
          {!isAuthSafe && (
            <Button
              classes={{ root: classes.buttonDesktop }}
              color="primary"
              variant="contained"
              onClick={createPressed}
            >
              {showCreateStuff ? 'Save New Account' : 'Create Account'}
            </Button>
          )}
          {isAdmin && (
            <Button
              classes={{ root: classes.buttonDesktop }}
              color="primary"
              variant="contained"
              onClick={createForSomeoneElsePressed}
            >
              Create Account for Someone Else
            </Button>
          )}
          <div style={{ paddingTop: '35px' }} />
          <div style={{ paddingTop: '35px' }} />
          <Button
            classes={{ root: classes.buttonDesktop }}
            color="primary"
            variant="contained"
            onClick={signOutButtonPressed}
            sx={showCreateStuff ? { display: 'none' } : {}}
          >
            Sign Out
          </Button>
          <DateDisplay>
            <div>Compile Date:</div>
            <div style={{ paddingLeft: 10 }}>{compileDate}</div>
          </DateDisplay>
        </div>
        {displayVerify && <VerifySecretCodeModal person={authPerson.current} />}
        <ResetYourPassword openDialog={openResetPasswordDialog} closeDialog={closeResetYourPassword} />
        {/* This following test can be deleted or converted to an automated test */}
        {/* <ReactQuerySaveReadTest personId="1" /> */}
      </PageContentContainer>
    </div>
  );
};
Login.propTypes = {
  classes: PropTypes.object.isRequired,
};

const styles = (theme) => ({
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  loginButtonRoot: {
    width: 100,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
});

const DateDisplay = styled('div')`
  padding: 50px 0 50px 0;
`;

export default withStyles(styles)(Login);
