import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import { authLog } from '../common/utils/logging';
import { useConnectAppContext, useConnectDispatch } from '../contexts/ConnectAppContext';
import { METHOD, useFetchData } from '../react-query/WeConnectQuery';
import { captureAccessRightsData } from '../models/AuthModel';

const PrivateRoute = () => {
  const location = useLocation();
  const { apiDataCache, getAppContextValue } = useConnectAppContext();
  const dispatch = useConnectDispatch();

  const [isAuthenticated, setIsAuthenticated] = useState(null);

  const { data: dataAuth, isSuccess: isSuccessAuth } = useFetchData(['get-auth'], {}, METHOD.POST);
  useEffect(() => {
    if (isSuccessAuth) {
      authLog('useFetchData in PrivateRoute useEffect dataAuth good:', dataAuth, isSuccessAuth);
      setIsAuthenticated(dataAuth.isAuthenticated);
      captureAccessRightsData(dataAuth, isSuccessAuth, apiDataCache, dispatch);
    }
  }, [dataAuth, isSuccessAuth]);

  const isAuth = getAppContextValue('isAuthenticated');

  authLog('========= PrivateRoute =========== isAuthenticated: ', isAuthenticated);

  if (isAuthenticated || isAuth || isAuthenticated !== false) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default PrivateRoute;
