import React from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';

const Login = () => {
  console.log(window.google);
  window.google?.accounts.id.disableAutoSelect();

  const navigate = useNavigate();
  console.log("client id",process.env.REACT_APP_GOOGLE_CLIENT_ID);

  // Google login success handler
  const handleGoogleSuccess = async (credentialResponse) => {
    console.log('Google success triggered')
    const token = credentialResponse.credential;
    console.log("token",token)
    // Send token to your backend for verification
    const googleResponse = await fetch('http://localhost:3001/api/users/google-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include', 
      body: JSON.stringify({ token })
    });

    const data = await googleResponse.json();
    if (data.success) {
      document.cookie = `token=${data.token}; path=/`;
      console.log('Google login successful:', data);
      navigate('/option');
    } else {
      alert('Google login failed.');
    }
  };

  const handleGoogleFailure = (error) => {
    console.error('Google login failed:', error);
    alert('Google login failed. Please try again.');
  };
  

  return (
    <div className="login-page">
      <div className="video-container-login">
        <video autoPlay muted loop className="background-video-login">
          <source src="videos/signup.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      <div className="container-login">
      <h3>Hello! </h3>
        <h3>Login with Google Here:</h3>
        <GoogleOAuthProvider clientId={process.env.REACT_APP_API_URL}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleFailure}
            useOneTap={false}
            prompt="select_account"
          />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default Login;


