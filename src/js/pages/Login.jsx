import { Button, TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { withStyles } from '@mui/styles';
import { useQueryClient } from '@tanstack/react-query';
import PropTypes from 'prop-types';
import React, { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router';
import styled from 'styled-components';
import validator from 'validator';
import { authLog, reactQueryLog, renderLog } from '../common/utils/logging';
import compileDate from '../compileDate';
import ResetYourPassword from '../components/Login/ResetYourPassword';
import { PageContentContainer } from '../components/Style/pageLayoutStyles';
import VerifySecretCodeModal from '../components/VerifySecretCodeModal';
import webAppConfig from '../config';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { clearSignedInGlobals } from '../contexts/contextFunctions';
import { captureAccessRightsData, viewerCanSeeOrDo } from '../models/AuthModel';
import { getFullNamePreferredPerson } from '../models/PersonModel';
import { useLogoutMutation } from '../react-query/mutations';
import weConnectQueryFn, { METHOD, useFetchData } from '../react-query/WeConnectQuery';


const Login = ({ classes }) => {
  renderLog('Login');
  const { apiDataCache, apiDataCache: { viewerAccessRights }, getAppContextValue, setAppContextValue, getAppContextData } = useConnectAppContext();
  const dispatch = useConnectDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [isForSomeOneElse, setIsForSomeOneElse] = useState(false);
  const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
  const [showCreateStuff, setShowCreateStuff] = useState(false);
  const [successLine, setSuccessLine] = useState('');
  const [warningLine, setWarningLine] = useState('');
  const [loginCount, setLoginCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

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
        if (loginAttempted) {  // if we navigate to here directly, not as a result of a loginAPI
          setTimeout(() => {
            navigate('/tasks');
            setAppContextValue('navigatedFromLogin', true);
          }, 2000);
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
      if (data.person && data.person.id) {
        data.person.personId = data.person.id;    // Initialize legacy (redundant) 'personId' field, which is not in the database
      }
      setAppContextValue('authenticatedPerson', data.person);
      queryClient.invalidateQueries('get-auth');
      if (data.emailVerified) {
        passwordFldRef.current = '';   // Blank the email field after signing in
        setWarningLine('');
        setAppContextValue('secretCodeVerified', true);
        setAppContextValue('openVerifySecretCodeModalDialog', false);
        setAppContextValue('secretCodeVerified', false);
        setAppContextValue('secretCodeVerifiedForReset', false);
        setAppContextValue('resetPassword', '');
        setAppContextValue('isAuthenticated', true);
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
      setWarningLine(data?.error?.msg || 'Unable to connect to the weconnect-server.');
      setSuccessLine('');
    }
  };

  const clearOnCreate = () => {
    // console.log('clearOnCreate -------------- 1 ------------ ', openResetPasswordDialog);
    if (!openResetPasswordDialog) {
      // console.log('clearOnCreate -------------- 2 ------------ ', openResetPasswordDialog);
      setAppContextValue('resetEmail', '');
      setAppContextValue('resetPassword', '');
      setAppContextValue('openVerifySecretCodeModalDialog', false);
      setAppContextValue('secretCodeVerified', false);
      setAppContextValue('secretCodeVerifiedForReset', false);
      setOpenResetPasswordDialog(false);
      setShowCreateStuff(false);
      const per = authPerson.current ? authPerson.current : getAppContextValue('authenticatedPerson');
      setWarningLine('');
      const name = getFullNamePreferredPerson(per);
      setSuccessLine(name.length ? `${name}, you are signed in!` : 'You are signed in!');
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
    // console.log(`/logout response -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
    if (data?.authenticated) {
      setWarningLine(data?.errors?.msg);
      setSuccessLine('');
    } else {
      setWarningLine('');
      setSuccessLine('You are signed out');
      mutateLogout();
    }
  };

  const verifyYourEmail = async (personId) => {
    // console.log('verifyYourEmail ----------------');
    if (!personId || personId < 1) {
      console.error('Invalid personId found in verifyYourEmail');
    }
    const data = await weConnectQueryFn('send-email-code', { personId }, METHOD.POST);
    reactQueryLog(`/send-email-code response: data: ${JSON.stringify(data)}`);
  };

  const signupApi = async (firstName, lastName, location, emailPersonal, emailOfficial, password, confirmPassword) => {
    const params = { firstName, lastName, location, emailPersonal, emailOfficial, password, confirmPassword };
    const data = await weConnectQueryFn('signup', params, METHOD.POST);

    try {
      reactQueryLog(`/signup response -- status: '${'status'}',  data: ${JSON.stringify(data)}`);
      let errStr = '';
      for (let i = 0; i < data.errors.length; i++) {
        errStr += data.errors[i]?.msg;
      }
      setWarningLine(errStr);
      if (data.personCreated) {
        setSuccessLine(`user # ${data.personId} created`);
        setSuccessLine(`user # ${data.personId} created`);
        authPerson.current = data.person;
        if (isForSomeOneElse) {
          setShowCreateStuff(false);
          setSuccessLine(`A person record was created for ${firstName} ${lastName} (they will have to verify their email on their first login)`);
        } else {
          verifyYourEmail(data.personId).then(() => {
            setSuccessLine('A verification email has been sent to your address');
            setAppContextValue('openVerifySecretCodeModalDialog', true);
          });
        }
      }
    } catch (e) {
      console.error('signup error', e);
    }
  };

  const removeSessionCookie = ()  => {
    const urlObject = new URL(webAppConfig.STAFF_API_SERVER_ROOT_URL);
    const updatedCookie = `WeConnectSession=; Max-Age=0; path=/; domain=${urlObject.hostname}`;
    document.cookie = updatedCookie;
    console.log('Login removeSessionCookie, cookie that was removed: ', updatedCookie);
  };

  const signOutButtonPressed = async () => {
    if (passwordFldRef.current) {
      passwordFldRef.current = '';   // Blank the email field after signing out
    }
    clearSignedInGlobals(setAppContextValue, getAppContextData);
    setOpenResetPasswordDialog(false);
    // console.log('signOutButtonPressed in Login before logoutApiInLogin()');
    await logoutApiInLogin().then(() => removeSessionCookie());
  };

  const loginPressed = async () => {
    const email =  (emailPersonalFldRef.current.value)?.trim();
    const password = (passwordFldRef.current.value)?.trim();

    if (email?.length === 0 || password?.length === 0) {
      // console.log('too short');
      setWarningLine('Enter a valid username and password');
    } else {
      setWarningLine('');
      await signOutButtonPressed();
      loginApi(email, password).then();
    }
  };

  const closeResetYourPassword = () => {
    clearSignedInGlobals(setAppContextValue, getAppContextData);
    setOpenResetPasswordDialog(false);
    // console.log('closeResetYourPassword in Login before logoutApiInLogin()');
    logoutApiInLogin().then(() => removeSessionCookie());
  };

  const createPressed = () => {
    if (!showCreateStuff) {
      setShowCreateStuff(true);
      setWarningLine('');
      setSuccessLine(isForSomeOneElse ? 'Creating an account for someone else' : '');
    } else {
      setWarningLine('');
      let errStr = '';
      const firstName =  firstNameFldRef?.current?.value;
      const lastName =  lastNameFldRef.current.value;
      const location =  locationFldRef.current.value;
      const emailPersonal =  emailPersonalFldRef.current.value;
      const emailOfficial =  emailOfficialFldRef.current.value;
      // const zipCode =  zipFldRef.current.value;
      // const stateCode =  stateFldRef.current.value;
      const password = passwordFldRef.current.value;
      const confirmPassword = confirmPasswordFldRef.current.value;
      if (!validator.isEmail(emailPersonal) && !validator.isEmail(emailOfficial)) errStr += 'Please enter a valid personal email address. ';
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
    setIsForSomeOneElse(true);
    createPressed();
  };

  const resetYourPasswordClicked = () => {
    console.log('resetYourPasswordClicked', openResetPasswordDialog);
    setOpenResetPasswordDialog(true);
    setAppContextValue('openVerifySecretCodeModalDialog', true);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  // console.log(getAppContextData());
  const isAdmin = viewerCanSeeOrDo(['canAddTeamMemberAnyTeam'], viewerAccessRights);
  // const isAuthSafe = getAppContextValue('isAuthenticated') || false;
  let isAuthenticated = false;
  let authenticatedPerson = {};
  if (dataAuth) {
    ({ isAuthenticated, person: authenticatedPerson } = dataAuth);
  }
  const displayVerify =
    !isForSomeOneElse &&
    authPerson.current &&
    Object.keys(authPerson.current).length > 0 &&
    getAppContextValue('secretCodeVerified') !== true &&
    (getAppContextValue('openVerifySecretCodeModalDialog') || false);

  // console.log('login before return render, getAppContextData()', getAppContextData());
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
              {(isAuthenticated && authenticatedPerson) ? (
                <span>
                  Signed In
                </span>
              ) : (
                <span>
                  Sign In
                </span>
              )}
            </span>
          </h1>
        </div>
        { (!(isAuthenticated && authenticatedPerson)) ? (
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
                         type={showPassword ? 'text' : 'password'}
                         autoComplete="current-password"
                         inputRef={passwordFldRef}
                         // defaultValue="12345678"
                         sx={{ display: 'block', paddingBottom: '15px' }}
                         InputProps={{
                           endAdornment: (
                             <InputAdornment position="end">
                               <IconButton
                                 aria-label="toggle password visibility"
                                 onClick={handleClickShowPassword}
                                 onMouseDown={handleMouseDownPassword}
                                 edge="end"
                               >
                                 {showPassword ? <VisibilityOff /> : <Visibility />}
                               </IconButton>
                             </InputAdornment>
                           ),
                         }}
              />
              <TextField id="confirmPassword"
                         label="Confirm Password"
                         variant="outlined"
                         type={showPassword ? 'text' : 'password'}
                         inputRef={confirmPasswordFldRef}
                         // defaultValue="12345678"
                         sx={{ padding: '0 0 15px 10px', display: showCreateStuff ? 'block' : 'none'  }}
                         InputProps={{
                           endAdornment: (
                             <InputAdornment position="end">
                               <IconButton
                                 aria-label="toggle password visibility"
                                 onClick={handleClickShowPassword}
                                 onMouseDown={handleMouseDownPassword}
                                 edge="end"
                               >
                                 {showPassword ? <VisibilityOff /> : <Visibility />}
                               </IconButton>
                             </InputAdornment>
                           ),
                         }}
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
                Sign in
              </Button>
              <Button
                classes={{ root: classes.loginButtonRoot }}
                color="primary"
                onClick={resetYourPasswordClicked}
                sx={showCreateStuff ? { display: 'none' } : { margin: '0 0 15px 20px !important', width: '200px !important' }}
              >
                Reset your password
              </Button>
            </span>
            <div style={{ paddingTop: '35px' }} />
            {/* 2025-10-10 We don't want to let people create accounts right now
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
            */}
          </div>
        ) : (
          <div style={{ marginLeft: '80px' }}>
            {isAdmin && (
              <Button
                classes={{ root: classes.buttonDesktop }}
                color="primary"
                variant="contained"
                onClick={createForSomeoneElsePressed}
              >
                Admin Feature: Create Account for Someone Else
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
          </div>
        )}
        <div style={{ marginLeft: '80px' }}>
          {displayVerify && <VerifySecretCodeModal person={authPerson.current} />}
          <ResetYourPassword openDialog={openResetPasswordDialog} closeDialog={closeResetYourPassword} />
          <DateDisplay>
            <div>Compile Date:</div>
            <div style={{ paddingLeft: 10 }}>{compileDate}</div>
          </DateDisplay>
        </div>
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
