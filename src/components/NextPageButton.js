import React from 'react';
import { Link } from 'react-router-dom';
import './NextPageButton.css';

const NextPageButton = ({ buttonPath, buttonText }) => (
  <div className='next-page-button'>
    <Link to={buttonPath}>
      <button>{buttonText}</button>
    </Link>
  </div>
);

export default NextPageButton;