import { Modal, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import PropTypes from 'prop-types';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import validator from 'validator';
import { renderLog } from '../../common/utils/logging';
import { useConnectAppContext } from '../../contexts/ConnectAppContext';
import { useLogoutMutation, usePasswordSaveMutation, usePersonRetrieveByEmailMutation } from '../../react-query/mutations';
import weConnectQueryFn, { METHOD } from '../../react-query/WeConnectQuery';
import { ErrorMessage } from '../Style/sharedStyles';
import VerifySecretCodeModal from '../VerifySecretCodeModal';

const ResetYourPassword = ({ openDialog, closeDialog }) => {
  renderLog('ResetYourPassword');
  const { mutate: mutateRetrievePersonByEmail } = usePersonRetrieveByEmailMutation();
  const { mutate: mutatePasswordSave } = usePasswordSaveMutation();
  const { mutate: mutateLogout } = useLogoutMutation();
  const { getAppContextValue, setAppContextValue } = useConnectAppContext();
  // console.log('ResetYourPassword ', getAppContextData());

  const [open, setOpen] = React.useState(openDialog);
  const [displayEmailAddress, setDisplayEmailAddress] = useState(true);
  const [warningLine, setWarningLine] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [personId, setPersonId] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword1, setShowPassword1] = useState(false);

  const emailRef = useRef('');
  const emailPersonalRef = useRef('');
  const emailOfficialRef = useRef('');
  const password1Ref = useRef('');
  const password2Ref = useRef('');
  const authPersonRef = useRef(undefined);

  useEffect(() => {
    setOpen(openDialog);
  }, [openDialog]);

  const secretCodeVerified = getAppContextValue('secretCodeVerifiedForReset') || false;
  useEffect(() => {
    if (secretCodeVerified === true) {
      console.log('received new secretCodeVerifiedForReset', secretCodeVerified);
      setDisplayEmailAddress(false);
      emailPersonalRef.current = authPersonRef.current?.emailPersonal || '';
      emailOfficialRef.current = authPersonRef.current?.emailOfficial || '';
      emailRef.current = '';
      password1Ref.current = '';
      password2Ref.current = '';
    }
  }, [secretCodeVerified]);

  const auth = getAppContextValue('authenticatedPerson');
  useEffect(() => {
    const authP = getAppContextValue('authenticatedPerson');
    authPersonRef.current = authP;
    if (authP && open) {
      setPersonId(authP.id);
      weConnectQueryFn('send-email-code', { personId: authP.id }, METHOD.POST)
        .then((data) => {
          console.log('send-email-code', data);
          if (data?.personFound === true) {
            setAppContextValue('openVerifySecretCodeModalDialog', true);
          } else {
            setAppContextValue('openVerifySecretCodeModalDialog', false);
            setDisplayEmailAddress(true);
            setWarningLine('There is no staff member with this email address.');
          }
        });
    }
    // eslint would have us add getAppContextValue and setAppContextValue, which causes and endless loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);


  const handleClose = () => {
    setOpen(false);
    closeDialog(false);
  };

  const changePassword = async () => {
    const pass1 = password1Ref.current.value;
    const pass2 = password2Ref.current.value;
    const person = authPersonRef.current;
    let id;
    if (person?.id) {
      id = person.id;
    } else {
      id = personId;
    }

    if (pass1 !== pass2) {
      setErrorMessage('Your password entries do not match.');
    } else {
      setErrorMessage('');
      await mutatePasswordSave({ personId: id, password: pass1 });
      setAppContextValue('isAuthenticated', true);
      if (person && person.id) {
        person.personId = person.id;    // Initialize legacy (redundant) 'personId' field, which is not in the database
      }
      setAppContextValue('authenticatedPerson', person);
      setAppContextValue('resetPassword', pass1);
      handleClose();
    }
  };

  const sendEmail = async () => {
    const email = emailRef.current.value;
    setAppContextValue('resetEmail', email);
    if (!validator.isEmail(email)) {
      setWarningLine('Please enter a valid email address.');
      return;
    }
    setWarningLine('');
    // setAppContextValue('openVerifySecretCodeModalDialog', true);
    // Logout so that the current sessionID will not be reused when resetting password for a potentially different staff member
    await mutateLogout();
    // This retrieve will set the 'authenticatedPerson' app context value, and bring back a new sessionID (without touching the cookie)
    console.log('mutateRetrievePersonByEmail: retrieving person by email:', email);
    await mutateRetrievePersonByEmail({ email });
    const ret = getAppContextValue('authenticatedPerson');
    console.log('mutateRetrievePersonByEmail', ret);
    // TODO: If person is not found by this email, show a warning message asking the user to enter a different email
    // setWarningLine('Email not found. Please enter different email address.');
  };

  function getEmailMarkup () {
    return (
      <span>
        {emailPersonalRef.current.length && emailOfficialRef.current.length && (
          <>
            For both emails:<span style={{ paddingRight: 20 }} /><b>{emailPersonalRef.current}</b> and <b>{emailOfficialRef.current}</b>
          </>
        )}
        {emailPersonalRef.current.length  && emailOfficialRef.current.length === 0 && (
          <>
            Email:<span style={{ paddingRight: 20 }} /><b>{emailPersonalRef.current}</b>
          </>
        )}
        {emailPersonalRef.current.length === 0 && emailOfficialRef.current.length && (
          <>
            Email:<span style={{ paddingRight: 20 }} /><b>{emailOfficialRef.current}</b>
          </>
        )}
      </span>
    );
  }

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowPassword1 = () => setShowPassword1((show) => !show);

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <>
      <Modal
        open={open}
        // onClose={handleClose}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle sx={{ width: '400px' }}>Reset your Password</DialogTitle>
          <div id="warningLine" style={{ color: 'red', padding: '10px 0 0 30px', paddingBottom: '20px' }}>{warningLine}</div>
          <DialogContent>
            <DialogContentText sx={{ marginBottom: '15px' }}>
              {displayEmailAddress ? 'Please enter your email address.' : 'Please enter your new password.'}
            </DialogContentText>
            <ErrorMessage>{errorMessage}</ErrorMessage>
            { displayEmailAddress ? (
              <TextField
                autoFocus
                fullWidth
                id="email"
                inputRef={emailRef}
                label="Email Address"
                margin="dense"
                name="email"
                required
                type="email"
                variant="outlined"
              />
            ) : (
              <>
                {/* EmailDiv clues in Google "Update password?" dialog to display this email, it probably could be css hidden */}
                <EmailDiv id="username">{getEmailMarkup()}</EmailDiv>
                <TextField
                  autoFocus
                  fullWidth
                  id="field1"
                  inputRef={password1Ref}
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  margin="dense"
                  name="password1"
                  required
                  variant="outlined"
                  // sx={{ '-webkit-text-security': 'disc' }}
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
                <TextField
                  fullWidth
                  id="field2"
                  inputRef={password2Ref}
                  label="Verify Password"
                  type={showPassword1 ? 'text' : 'password'}
                  margin="dense"
                  name="password2"
                  required
                  variant="outlined"
                  // sx={{ '-webkit-text-security': 'disc' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword1}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword1 ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
            <Button sx={{ float: 'right' }} onClick={displayEmailAddress ? sendEmail : changePassword}>
              {displayEmailAddress ? 'Send reset email' : 'Save your new password'}
            </Button>
          </DialogContent>
        </Dialog>
      </Modal>
      <VerifySecretCodeModal person={authPersonRef.current}  />
    </>
  );
};
ResetYourPassword.propTypes = {
  openDialog: PropTypes.bool,
  closeDialog: PropTypes.func,
};

const EmailDiv  = styled('div')`
  padding: 0 0 20px 0;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  letter-spacing: 0.00938em;
  color: rgba(0, 0, 0, 0.6);
`;


export default ResetYourPassword;
