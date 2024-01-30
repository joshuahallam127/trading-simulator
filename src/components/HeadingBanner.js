import React from 'react';
import './HeadingBanner.css';
import { Link } from 'react-router-dom';

const HeadingBanner = ({ title, backButtonPath }) => {
  return ( 
  <div className="heading-banner" style={{backgroundImage:`url('/trading-simulator/frontpage-background.jpg')`}}>
    <div className='back-button-container'>
      <Link to={backButtonPath}>
        <button className='back-button'>{'<'}</button>
      </Link>
    </div>
    <div className='title'>
      <h1>{title}</h1>
    </div>
    <div className='links'>
      <a href="https://github.com/joshuahallam127" target="_blank" rel="noopener noreferrer">
        <img className='icon' src="/trading-simulator/github-icon.png" alt="Github"/>
      </a>
      <a href="https://www.linkedin.com/in/joshua-hallam-b4516b258/" target="_blank" rel="noopener noreferrer">
        <img className='icon' src="/trading-simulator/linkedin-icon.png" alt="LinkedIn"/>
      </a>
    </div>
  </div>
  )
}

export default HeadingBanner;