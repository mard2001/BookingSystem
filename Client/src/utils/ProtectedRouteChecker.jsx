import React from 'react'
import { Navigate } from 'react-router-dom';
import { getStoredUser } from './LocalVariables';
import { getDecryptedRole } from './Crypto';
import { ALLOWED_ROLES } from '../constants/contants';

export default function ProtectedRouteChecker({children, allowedRoles}){
  const user = getStoredUser();
  const role = getDecryptedRole();

  // not logged in
  if (!user) return <Navigate to="/unauthorized" replace />;

  // logged in but not admin
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return children;
}
