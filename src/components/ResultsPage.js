import React from 'react';
import './ResultsPage.css';
import HeadingBanner from './HeadingBanner';
import { useParams } from 'react-router-dom';

const Results = () => {
  // get results from params
  const { resultsArray } = useParams();
  const { startingBalance, endingBalance, profit } = resultsArray;

  return (
    <>
      <HeadingBanner title='Results' backButtonPath='/trading-simulator/SelectStock' />
      <div className='results-body'>
        <h1>Starting Balance: {startingBalance}</h1>
        <h1>Ending Balance: {endingBalance}</h1>
        <h1>Profit: {profit}</h1>
      </div>
    </>
  );
}

export default Results;