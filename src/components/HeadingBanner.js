import React from 'react';
import './HeadingBanner.css';
import { Link } from 'react-router-dom';

const HeadingBanner = ({ title, backButtonPath }) => {
  return ( 
  <div className="heading-banner">
    <Link to={backButtonPath}>
      <button className='back-button'>{'<'}</button>
    </Link>
    <a href="https://github.com/joshuahallam127" target="_blank" rel="noopener noreferrer">
      <img src="/trading-simulator/github-icon.jpg" alt="github" className="github-icon"/>
    </a>
    <h1>{title}</h1>
  </div>
  )
}

export default HeadingBanner;