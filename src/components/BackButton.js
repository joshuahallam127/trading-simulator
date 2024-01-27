import React from 'react';
import { Link } from 'react-router-dom';
import './BackButton.css';

const BackButton = ({ pagePath }) => (
  <Link to={pagePath}>
    <button className='back-button'>{'<'}</button>
  </Link>
);

export default BackButton;