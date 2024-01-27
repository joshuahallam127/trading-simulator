import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  console.log('process.env.PUBLIC_URL: ', process.env.PUBLIC_URL);
  return (
    <div className='home-page'>
      <div className='text-container'>
        <h3>Welcome To</h3>
        <h1>The Trading Simulator</h1>
        <h2>Learn to Earn!</h2>
        <Link to="/trading-simulator/SelectStock">
          <button>Get Started {'->'}</button>
        </Link>
        <img src="/trading-simulator/github-icon.jpg" alt="github-icon" />
      </div>
    </div>
  );
}

export default HomePage;