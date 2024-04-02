import React, { useState, useEffect } from 'react';
import './HomePage.css';
import NextPageButton from './NextPageButton';
import axios from 'axios';

const HomePage = () => {
  const [apiReady, setApiReady] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(30);

  // check if the api is ready every 5 seconds
  useEffect(() => {
    if (!apiReady) {
      // function to check api status
      const checkApi = () => {
        axios.get(process.env.REACT_APP_API_URL)
        .then(response => setApiReady(true))
        .catch(error => null);
      }

      // check api on start up
      checkApi();

      // query the api every 5 seconds to see if it's ready
      const interval = setInterval(checkApi, 5000);

      return () => clearInterval(interval);
    }
  }, [apiReady]);

  useEffect(() => {
    if (!apiReady) {
      // reduce timer every second
      const reduceTimeRemaining = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(reduceTimeRemaining);
    }
  }, [apiReady]);

  return (
    <div className='home-page' style={{backgroundImage: `url('/trading-simulator/frontpage-background.jpg')`, height: '100vh'}}>
      <h3>Welcome To</h3>
      <h1>The Trading Simulator</h1>
      <h2>Learn to Earn!</h2>
      {!apiReady && (
        <div style={{textAlign: 'center'}}>
          {timeRemaining >= 0 ? 
          <>
            <h5>API backend is starting up</h5>
            <h6>Estimated time remaining: {timeRemaining}s</h6> 
          </>
          :
          <h6 style={{maxWidth: '50vw'}}>Sorry! The server should be ready shortly! I am using a free tier for my backend hosting which sometimes doesn't boot up! Check out the demo video on my portfolio page!</h6>}
        </div>
      )}
      {apiReady && <NextPageButton buttonPath='/trading-simulator/Setup' buttonText='Get Started ->' />}
    </div>
  );
}
export default HomePage;