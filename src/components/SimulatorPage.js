import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Chart from 'chart.js/auto';
import moment from 'moment';
import { Line } from 'react-chartjs-2';
import HeadingBanner from './HeadingBanner';
import './SimulatorPage.css';
import MoonLoader from 'react-spinners/MoonLoader';

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

  // go forward in the chart
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
      <h2>{title}</h2>
      <Line data={chartData} />
      <button onClick={goForwardInterval}>next</button>
      <label htmlFor='interval-increment-number'>Interval increment: </label>
      <input 
        type='number' 
        id='interval-increment-number' 
        min='1'
        max='390'
        step='1'
        value={intervalStep}
        onChange={changeIntervalStep}
        placeholder={1}
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
    <>
      <div className='title'>
          <h1>CHARTS</h1>
      </div>
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
          title={'Minute'}
          idx={min}
          setIdx={setMin}
        />
      </div>
    </>
  )
}

const twoDP = (num) => {
  if (!num) return String(num);
  if (num % 1 !== 0) {
    return num.toFixed(2);
  }
  return num;
}

const fourDP = (num) => {
  if (!num) return String(num);
  if (num % 1 !== 0) {
    return num.toFixed(4);
  }
  return num;
}

const StatsBuySell = ({ ticker, sharePrice }) => {
  const startingBalance = 10000;
  const [balance, setBalance] = useState(startingBalance);
  const [sharesOwned, setSharesOwned] = useState(0);
  const [amount, setAmount] = useState(sharePrice);
  const [sharesToTrade, setSharesToTrade] = useState(1);

  // to be able to enter number of shares to buy or dollar amount to buy

  // update stuff when other stuff changes
  useEffect(() => setAmount(sharesToTrade * sharePrice), [sharePrice, sharesToTrade]);

  // buy the stock and keep track of the balance and shares owned
  const handleBuyClick = () => {
    if (!amount || !sharesToTrade) {
      alert('Please enter a valid amount or number of shares');
      return;
    }
    if (balance < amount) {
      alert('Not enough money to buy that many shares');
      return;
    }
    setBalance(balance - amount);
    setSharesOwned(sharesOwned + sharesToTrade);
  }
  const handleSellClick = () => {
    if (sharesToTrade > sharesOwned) {
      alert('Not enough shares to sell desired amount');
      return;
    }
    setBalance(balance + amount);
    setSharesOwned(sharesOwned - sharesToTrade);
  }

  const handleNumSharesChange = (e) => {
    if (e.target.value < 0) return;
    setSharesToTrade(e.target.valueAsNumber);
  }
  const handleAmountChange = (e) => {
    if (e.target.value < 0) return;
    setAmount(e.target.valueAsNumber);
    setSharesToTrade(e.target.valueAsNumber / sharePrice);
  }

  return (
    <div className='stats-and-buy-sell'>
      <div className='container'>
        <div className='title'>
          <h1>STATS</h1>
        </div>
        <h2>Trading: {ticker}</h2>
        <h2>Current Price: ${sharePrice}</h2>
        <h2>Balance: ${twoDP(balance)}</h2>
        <h2>Shares Owned: {sharesOwned}</h2>
      </div>
      <div className='container'>
        <div className='title'>
          <h1>BUY/SELL</h1>
        </div>
        <div className='input-container'>
          <label htmlFor='sharesInput'>
            <h2>Enter number of shares to buy/sell: </h2>
          </label>
          <input 
            type='number' 
            id='sharesInput' 
            min='0'
            value={fourDP(sharesToTrade)} 
            onChange={handleNumSharesChange}
          />
        </div>
        <div className='input-container'>
          <label htmlFor='amountInput'>
            <h2>Enter dollar amount to buy/sell: </h2>
          </label>
          <input 
            type='number' 
            id='amountInput'
            min='0' 
            value={twoDP(amount)}
            onChange={handleAmountChange}
          />
        </div>
        <div className='buy-sell-buttons'>
          <button style={{backgroundColor: 'green'}} onClick={handleBuyClick}>Buy</button>
          <button style={{backgroundColor: 'red'}} onClick={handleSellClick}>Sell</button>
        </div>
      </div>
    </div>
  )
}


const Simulator = () => {
  // get ticker from url parameter
  const { ticker, startMonth, endMonth } = useParams();
  
  // get data from backend make sure only runs once and update share price
  const [sharePrice, setSharePrice] = useState(10);
  const [datasets, setDatasets] = useState({'1day': [], '1min': []});
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/get_data?ticker=${ticker}&startMonth=${startMonth}&endMonth=${endMonth}`)
    .then(response => {
      setDatasets(response.data);
      setSharePrice(response.data['1day'][0][1]);
    })
    .catch(error => alert('Error getting data from backend, please try again later'));
  }, []);

  return (
    <>
      {datasets['1day'].length === 0 ?
      <div className='loading-background'>
        <MoonLoader size='300px'/>
      </div>
      :
      <>
        <HeadingBanner title={'TRADING SIMULATOR'} backButtonPath={'/trading-simulator/Setup'} />
        <div className='simulator-body'>
          <StatsBuySell ticker={ticker} sharePrice={sharePrice} />
          <StockCharts datasets={datasets} setSharePrice={setSharePrice}/>
        </div>
      </>
      }
    </>
  )
}

export default Simulator;