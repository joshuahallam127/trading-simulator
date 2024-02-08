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
        .catch(error => console.log('error'));
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
        console.log('here');
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(reduceTimeRemaining);
    }
  }, []);

  return (
    <div className='home-page' style={{backgroundImage: `url('/trading-simulator/frontpage-background.jpg')`, height: '100vh'}}>
      <h3>Welcome To</h3>
      <h1>The Trading Simulator</h1>
      <h2>Learn to Earn!</h2>
      {!apiReady && (
        <div>
          <h3>API backend is starting up</h3>
          {timeRemaining >= 0 ? 
          <h4>Estimated time remaining: {timeRemaining}s</h4> 
          :
          <h4>The server will be ready shortly</h4>}
        </div>
      )}
      {apiReady && <NextPageButton buttonPath='/trading-simulator/Setup' buttonText='Get Started ->' />}
    </div>
  );
}
export default HomePage;