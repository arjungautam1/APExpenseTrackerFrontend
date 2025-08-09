import { Navigate } from 'react-router-dom';
import { RegisterForm } from '../components/Auth/RegisterForm';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <RegisterForm />;
}