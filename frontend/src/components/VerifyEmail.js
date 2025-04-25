import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const token = window.location.pathname.split('/verify/')[1];

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/auth/verify/${token}`)
      .then(() => {
        alert('Email verified! Please login.');
        navigate('/login');
      })
      .catch(() => alert('Verification failed'));
  }, [token, navigate]);

  return <div className="container mx-auto p-4">Verifying...</div>;
};

export default VerifyEmail;