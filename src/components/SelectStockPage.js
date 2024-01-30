import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './SelectStockPage.css';
import HeadingBanner from './HeadingBanner';
import NextPageButton from './NextPageButton';
import AsyncSelect from 'react-select/async';
import { createFilter } from 'react-select';

const DataTable = ({ ticker }) => {
  
  // get the column headers for the table for all months we could possibly have
  const getColumnHeaders = () => {
    const allColumns = [];
    for (let date = new Date('2023-01-01'); date <= new Date(); date.setMonth(date.getMonth() + 1)) {
      const formattedDate = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
      allColumns.push(formattedDate);
    }
    return allColumns;
  }
  const columns = getColumnHeaders();
  
  // get the column headers for the months we actually have
  const [dataColumns, setDataColumns] = useState([]);
  const getDataColumns = (result) => {
    const dataColumns = [];
    for (let date = new Date(result[0]); date < new Date(result[1]); date.setMonth(date.getMonth() + 1)) {
      const formattedDate = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
      dataColumns.push(formattedDate);
    }
    return dataColumns;
  }
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/get_months_data?ticker=${ticker}`)
      .then(response => response.data)
      .then(result => getDataColumns(result))
      .then(dataColumns => setDataColumns(dataColumns))
      .catch(error => console.error('Error getting months data: ', error));
  }, [ticker]);

  // array defining if there is a checkbox for that month, and if so whether it is checked
  // each element of the form (is there a checkbox, is it checked)
  const [checkboxes, setCheckboxes] = useState(columns.map(() => [false, false]));
  useEffect(() => {
    setCheckboxes(columns.map((column) => dataColumns.includes(column) ? [false, false] : [true, false]));
  }, [dataColumns])

  // calculate the cost of downloading the data
  const [cost, setCost] = useState(1);
  useEffect(() => {
    let cost = checkboxes.filter((checkbox) => checkbox[1]).length;
    // if there is at least one no checkbox, we must add 1
    if (checkboxes.filter((checkbox) => !checkbox[0]).length > 0) {
      cost++;
    }
    setCost(cost);
  }, [checkboxes])

  // handle the checkbox being clicked
  const handleCheckboxClick = (index) => {
    const newCheckboxes = [...checkboxes];

    if (!newCheckboxes[index][1]) {
      // tick all previous boxes
      for (let i = index; i >= 0; i--) {
        if (!newCheckboxes[i][0] || newCheckboxes[i][1]) break;
        newCheckboxes[i][1] = true;
      }
    } else {
      // untick all boxes afterwards
      for (let i = index; i < newCheckboxes.length; i++) {
        if (!newCheckboxes[i][1]) break;
        newCheckboxes[i][1] = false;
      }
    }
    setCheckboxes(newCheckboxes);
  }

  // get callsRemaining make sure it only computes once
  const [callsRemaining, setCallsRemaining] = useState(25);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/get_remaining_calls`)
      .then(response => setCallsRemaining(response.data))
      .catch(error => console.error('Error getting remaining api calls: ', error));
  }, []);

  // const handleDownloadClick = () => {
  //   // get the start and end months that the user wants to download
  //   let [startMonth, endMonth] = [-1, -1];
  //   for (let i = 0; i < checkboxes.length; i++) {
  //     if (checkboxes[i][1]) {
  //       if (startMonth === -1) {
  //         startMonth = i;
  //       }
  //       if (endMonth === -1) {
  //         endMonth = i;
  //       }
  //     }
  //   }

  //   if (startMonth === -1 || endMonth === -1) {
  //     console.log(startMonth, endMonth)
  //     alert('At least one box must be ticked before downloading!');
  //     return;
  //   }
  //   if (startMonth !== 0) {
  //     startMonth--;
  //   }
  //   // send request to download the data
  //   const fetchData = async () => {
  //     const result = await downloadData(ticker, columns[startMonth], columns[endMonth], cost);
  //     setTaskId(result.data.task_id);
  //     console.log(result);
  //     console.log(result.data.task_id);
  //   }
  //   fetchData();
  // }

  return (
    <div>
      <h2>Data For {ticker}</h2>
      <p>Current cost to download data: {cost}</p>
      <p>Calls remaining: {callsRemaining}</p>
      <table>
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {columns.map((_, index) => (
              <td key={index}>{checkboxes[index][0] ? 
                (
                <>
                  <input 
                    type='checkbox' 
                    checked={checkboxes[index][1]} 
                    onChange={() => handleCheckboxClick(index)}
                  />
                  {'❌'}         
                </>
                ) : '✔️'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className='download-buttons'>
        <button onClick={() => setCheckboxes(checkboxes.map(checkbox => checkbox[0] ? [true, true] : [false, false]))}>Tick all</button>
        <button>Download Data</button>
      </div>
    </div>
  )
}

const SelectTicker = ({ setTicker }) => {
  const [allTickers, setAllTickers] = useState([]);
  useEffect(() => {
    fetch('all_tickers.txt')
      .then(response => response.text())
      .then(text => text.split('\n'))
      .then(tickers => setAllTickers(tickers))
      .catch(error => console.error('Error fetching file: ', error));
  }, []);

  const getFilteredOptions = (inputValue, callback) => {
    console.log(inputValue);
    callback(allTickers.filter((ticker) => ticker.toLowerCase().includes(inputValue.toLowerCase()))
      .map((ticker) => ({value: ticker, label: ticker})));
  }

  return (
    <div className='async-select-container'>
      <AsyncSelect 
        loadOptions={getFilteredOptions}
        onChange={(selectedOption) => setTicker(selectedOption.value)}
        placeholder="Enter ticker symbol..."
        filterOption={createFilter({ ignoreAccents: false })}
      />
    </div>
  )
}

const TickerOptions = ({ setTicker }) => {
  const [tickerOptions, setTickerOptions] = useState([]);

  // get ticker options inside useEffect with empty dependency array so it only runs once.
  useEffect(() => {
    axios({method: 'get', url: `${process.env.REACT_APP_API_URL}/list_ticker_options`, withCredentials:false, headers: { 'Content-Type': 'application/x-www-form-urlencoded'}})
    // axios.get(`${process.env.REACT_APP_API_URL}/list_ticker_options`)
      .then(response => setTickerOptions(response.data))
      .catch(error => console.error('Error getting ticker options: ', error));
  }, []);

  return (
    <>
      <div className='both-options'>
        <div className='loaded-options'>
          <h1>Select From Loaded Datasets</h1>
          <div className='buttons'>
            {tickerOptions.map((tickerOption, index) => (
              <button key={index} onClick={(e) => setTicker(e.target.innerText)}>{tickerOption}</button>
            ))}
          </div>
        </div>
        <div className='new-options'>
          <h1>Download New Stock Data</h1>
          <SelectTicker setTicker={setTicker} />
        </div>
      </div>
    </>
  )
}

const SelectStock = () => {
  const [ticker, setTicker] = useState('TSLA');
  
  return (
    <>
      <HeadingBanner title='STOCK SELECTION' backButtonPath='/trading-simulator' />
      <div className='select-stock-body'>
        <TickerOptions setTicker={setTicker} />
        <DataTable ticker={ticker} />
        <NextPageButton buttonPath={`/trading-simulator/Simulator/${ticker}`} buttonText='Start Simulator ->' />
      </div>
    </>
  );
}


export default SelectStock;