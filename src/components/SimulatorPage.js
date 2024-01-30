import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import HeadingBanner from './HeadingBanner';
import './SimulatorPage.css';
import NextPageButton from './NextPageButton';

const StockChart = ({data, onIntervalChange, title, idx, setIdx }) => {
  // data to show on the chart
  const [closeData, setCloseData] = useState([]);
  const [intervalStep, setIntervalStep] = useState(1);

  // labels to show on the chart, don't need date for intraday and don't need time for daily
  const labels = title === 'Daily' ? data.map(entry => entry[0].split(' ')[0]) : data.map(entry => entry[0].split(' ')[1]);
  
  // update the data on the chart when the data prop changes
  useEffect(() => {
    setCloseData(data.map((entry, index) => (index < idx ? entry[1] : null)));
  }, [data, idx]);

  // chart data in the format needed by chart.js
  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'Stock Price',
        data: closeData,
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
        fill: false,
        animation: {
          duration: 0
        }
      }
    ],
  };

  // go back or forward in the chart by one interval
  const goBackInterval = () => {
    idx < intervalStep ? setIdx(0) : setIdx(idx - intervalStep);
    onIntervalChange('back', title);
  }
  const goForwardInterval = () => {
    idx + intervalStep >= data.length ? setIdx(data.length - 1) : setIdx(idx + intervalStep);
    onIntervalChange('forward', title);
  }

  const changeIntervalStep = (e) => {
    setIntervalStep(e.target.valueAsNumber);
  }

  // return the chart with two buttons below
  return (
    <div className='stock-chart'>
      <h4>{title}</h4>
      <Line data={chartData} />
      <button onClick={goBackInterval}>prev</button>
      <button onClick={goForwardInterval}>next</button>
      {title === 'Intraday' && (
        <>
          <label htmlFor='interval-increment'>Interval increment: </label>
          <input 
            type='number' 
            id='interval-increment-number' 
            min='1'
            max='390'
            step='1'
            value={intervalStep}
            onChange={changeIntervalStep} 
          />
          <input 
            type='range' 
            id='interval-increment-slider'
            min='1'
            max='390'
            step='1'
            value={intervalStep}
            onChange={changeIntervalStep}
          />
        </>
      )}
    </div>
  );
}

const StockCharts = ({datasets, setSharePrice}) => {
  const MINS_IN_DAY = 390
  const [day, setDay] = useState(0);
  const [min, setMin] = useState(0);

  // update share price when the day or minute changes
  useEffect(() => {
    if (datasets['1min'][day * MINS_IN_DAY + min - 1]) {
      setSharePrice(datasets['1min'][day * MINS_IN_DAY + min - 1][1])
    }
  }, [setSharePrice, datasets, day, min])

  return (
    <div className='stock-charts'>
      <StockChart 
        data={datasets['1day']} 
        onIntervalChange={() => setMin(0)} 
        title={'Daily'}
        idx={day}
        setIdx={setDay}
      />
      <StockChart
        data={datasets['1min'].slice(day * MINS_IN_DAY, (day+1) * MINS_IN_DAY)} 
        onIntervalChange={() => null} 
        title={'Intraday'}
        idx={min}
        setIdx={setMin}
      />
    </div>
  )
}


const BuyStock = ({ sharePrice }) => {
  // to be able to enter number of shares to buy or dollar amount to buy
  const [numShares, setNumShares] = useState(1);
  const [amount, setAmount] = useState(sharePrice);
  const [balance, setBalance] = useState(1000);
  const [shareCount, setShareCount] = useState(0);

  // update stuff when other stuff changes
  useEffect(() => setAmount(numShares * sharePrice), [sharePrice, numShares]);
  useEffect(() => setNumShares(amount / sharePrice), [amount]);
  
  // buy the stock and keep track of the balance and shares owned
  const handleBuyClick = () => {
    if (balance < amount) {
      alert('Not enough money to buy that many shares');
      return;
    }
    setBalance(balance - amount);
    setShareCount(shareCount + numShares);
  }
  const handleSellClick = () => {
    if (numShares > shareCount) {
      alert('Not enough shares to sell desired amount');
      return;
    }
    setBalance(balance + amount);
    setShareCount(shareCount - numShares);
  }

  return (
    <div>
      <h3>Balance: {balance}</h3>
      <h3>Share Count: {shareCount}</h3>
      <div>
        <label htmlFor='sharesInput'>Enter number of shares to buy/sell: </label>
        <input 
          type='number' 
          id='sharesInput' 
          value={numShares} 
          onChange={(e) => setNumShares(parseFloat(e.target.value) || 0)} />
      </div>
      <div>
        <label htmlFor='amountInput'>Enter dollar amount to buy/sell: </label>
        <input 
          type='number' 
          id='amountInput' 
          value={amount}
          onChange={(e) => setAmount(parseFloat(e.target.value) || 0)} />
      </div>
      <button onClick={handleBuyClick}>Buy</button>
      <button onClick={handleSellClick}>Sell</button>
    </div>
  )
}

const Simulator = () => {
  // get ticker from url parameter
  const { ticker } = useParams();
  
  // get data from backend make sure only runs once and update share price
  const [sharePrice, setSharePrice] = useState(10);
  const [datasets, setDatasets] = useState({'1day': [], '1min': []});
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/get_data?ticker=${ticker}`)
    .then(response => {
      setDatasets(response.data);
      return response.data['1day'][0][1];
    })
    .then(sharePrice => setSharePrice(sharePrice))
    .catch(error => console.error('Error loading data: ', error));
  }, []);

  // store results for when user clicks next page
  const [results, setResults] = useState({startingBalance: 1000, endingBalance: 1000, profit: 0});
  

  return (
    <>
      <HeadingBanner title={'TRADING SIMULATOR'} backButtonPath={'/trading-simulator/SelectStock'} />
      <div className='simulator-body'>
        <h3>Trading: {ticker}</h3>
        <h3>Current share price: {sharePrice}</h3>
        <BuyStock sharePrice={sharePrice}/>
        <StockCharts datasets={datasets} setSharePrice={setSharePrice}/>
        <NextPageButton buttonPath={`/trading-simulator/Results/${ticker}`} buttonText='See Results ->' />
      </div>
    </>
  )
}

export default Simulator;