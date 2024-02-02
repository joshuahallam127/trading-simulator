import React from 'react';
import './HomePage.css';
import NextPageButton from './NextPageButton';

const HomePage = () => (
    <div className='home-page' style={{backgroundImage: `url('/trading-simulator/frontpage-background.jpg')`, height: '100vh'}}>
      <h3>Welcome To</h3>
      <h1>The Trading Simulator</h1>
      <h2>Learn to Earn!</h2>
      <NextPageButton buttonPath='/trading-simulator/Setup' buttonText='Get Started ->' />
    </div>
);
export default HomePage;