import React, { useState, useEffect, useRef, forwardRef } from 'react';
import './Setup.css';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import { createFilter } from 'react-select';
import { Link } from 'react-router-dom';
import MoonLoader from 'react-spinners/MoonLoader';
import { Navigate } from 'react-router-dom';

const DataTable = ({ monthsHeadersAll, monthsHeadersHave, loadingMonths }) => {
  // array defining if there is a checkbox for that month, and if so whether it is checked
  // each element of the form (is there a checkbox, is it checked)
  const [checkboxes, setCheckboxes] = useState(monthsHeadersAll.map(() => [false, false]));
  useEffect(() => {
    setCheckboxes(monthsHeadersAll.map((column) => monthsHeadersHave.includes(column) ? [false, false] : [true, false]));
  }, [monthsHeadersHave, monthsHeadersAll])
    
  // calculate the cost of downloading the data
  const [cost, setCost] = useState(1);

  // handle the checkbox being clicked
  const handleCheckboxClick = (index) => {
    // update the checkboxes appropriately
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

    // update the cost appropriately
    let cost = checkboxes.filter((checkbox) => checkbox[1]).length;
    // if there is at least one no checkbox, we must add 1
    if (checkboxes.filter((checkbox) => !checkbox[0]).length > 0) {
      cost++;
    }
    setCost(cost);
  }

  // get callsRemaining make sure it only computes once
  const [callsRemaining, setCallsRemaining] = useState(25);
  const apiCalled = useRef(false);
  useEffect(() => {
    if (apiCalled.current) return;
    apiCalled.current = true;
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
  //     const result = await downloadData(ticker, monthsHeadersAll[startMonth], monthsHeadersAll[endMonth], cost);
  //     setTaskId(result.data.task_id);
  //     console.log(result);
  //     console.log(result.data.task_id);
  //   }
  //   fetchData();
  // }

  const MyTable = () => {
    if (loadingMonths) {
      return (
        <div style={{margin:'50px', display: 'flex', justifyContent: 'center' }}>
          <MoonLoader size={150} color={'#8892b0'} loading={loadingMonths} />
        </div>
      )
    } else {
      return (
        <div>
          <div className='my-table'>
            {monthsHeadersAll.map((column, index) => (
              <div key={index} className='my-box'>
                <h5>{column.split(' ')[0]}</h5>
                <h5>{column.split(' ')[1]}</h5>
                <p>{checkboxes[index][0] ? 
                  (
                  <>
                    <input 
                      type='checkbox' 
                      checked={checkboxes[index][1]} 
                      onChange={() => handleCheckboxClick(index)}
                    />
                    {'❌'}         
                  </>
                  ) : '✔️'}</p>
              </div>
            ))}
          </div>
          <div className='download-buttons'>
            <button onClick={() => setCheckboxes(checkboxes.map(checkbox => checkbox[0] ? [true, true] : [false, false]))}>Tick all</button>
            <button>Download Data</button>
          </div>
        </div>
      )
    }
  }

  return (
    <div>
      <p>Current cost to download data: {cost}</p>
      <p>Calls remaining: {callsRemaining}</p>
      <MyTable />
    </div>
  )
}

const HeadingBanner = () => (
  <div className='heading-banner-new'>
    <img className='icon-new' src='/trading-simulator/trading-logo.jpg'/>
    <div>
      <a href="https://github.com/joshuahallam127" target="_blank" rel="noopener noreferrer">
        <img className='icon-new' src="/trading-simulator/github-icon.png" alt="Github"/>
      </a>
      <a href="https://www.linkedin.com/in/joshua-hallam-b4516b258/" target="_blank" rel="noopener noreferrer">
        <img className='icon-new' src="/trading-simulator/linkedin-icon.png" alt="LinkedIn"/>
      </a>
    </div>
  </div>
)

const SearchTicker = ({ handleTickerChange }) => {
  // get all possible tickers, only needs to be done once
  const [allTickers, setAllTickers] = useState([]);
  const apiCalled = useRef(false);
  useEffect(() => {
    if (apiCalled.current) return;
    apiCalled.current = true;
    fetch('all_tickers.txt')
      .then(response => response.text())
      .then(text => text.split('\n'))
      .then(tickers => setAllTickers(tickers))
      .catch(error => console.error('Error fetching file: ', error));
  }, []);

  const getFilteredOptions = (inputValue, callback) => {
    callback(allTickers.filter((ticker) => ticker.toLowerCase().includes(inputValue.toLowerCase()))
      .map((ticker) => ({value: ticker, label: ticker})));
  }

  return (
    <div className='async-select-container'>
      <AsyncSelect 
        loadOptions={getFilteredOptions}
        onChange={(selectedOption) => handleTickerChange(selectedOption.value)}
        placeholder="Enter ticker symbol..."
        filterOption={createFilter({ ignoreAccents: false })}
      />
    </div>
  )
}

const SelectStock = ({ ticker, setTicker, setMonthsHeadersHave, setLoadingMonths }) => {
  // whether or not we are loading the ticker options
  const [loadingTickers, setLoadingTickers] = useState(true);
  
  // update the months data when the ticker changes
  const handleTickerChange = (newTicker) => {
    setTicker(newTicker)
    setLoadingMonths(true);
    axios.get(`${process.env.REACT_APP_API_URL}/get_months_data?ticker=${newTicker}`)
      .then(response => response.data)
      .then(result => {
        const monthsHeaders = [];
        for (let date = new Date(result[0]); date < new Date(result[1]); date.setMonth(date.getMonth() + 1)) {
          const formattedDate = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
          monthsHeaders.push(formattedDate);
        }
        setMonthsHeadersHave(monthsHeaders);
        setLoadingMonths(false);
      })
      .catch(error => console.error('Error getting months data: ', error));
  }
  
  // get ticker options inside useEffect with empty dependency array so it only runs once.
  const [tickerOptions, setTickerOptions] = useState([]);
  const apiCalled = useRef(false);
  useEffect(() => {
    if (apiCalled.current) return;
    apiCalled.current = true;
    console.log('getting ticker options')
    axios.get(`${process.env.REACT_APP_API_URL}/list_ticker_options`)
      .then(response => {
        setTickerOptions(response.data);
        setLoadingTickers(false);
        handleTickerChange(response.data[0]);
      })
      .catch(error => console.error('Error getting ticker options: ', error));
  }, []);


  // see if i can remove the loadingtickers conditional
  return (
    <div className='step'>
      <h1>Step 1. Choose Stock</h1>
      <h2>Choose From Loaded Datasets</h2>
      <div className='ticker-buttons'>
        {loadingTickers && (
          <div style={{margin:'50px'}}>
            <MoonLoader size={150} color={'#8892b0'} loading={loadingTickers} />
          </div>
        )}
        {tickerOptions.map((tickerOption, index) => (
          <button 
            key={index}
            style={{backgroundColor: tickerOption === ticker ? '#3d4f81' : '#172f58'}} 
            onClick={(e) => handleTickerChange(e.target.innerText)}
          >
            {tickerOption}
          </button>
        ))}
      </div>
      <h3>OR</h3>
      <h2>Search For a New Stock</h2>
      <div className='new-options'>
        <SearchTicker setTicker={setTicker} handleTickerChange={handleTickerChange}/>
      </div>
    </div>
  )
}

const SelectTimeframe = forwardRef(({ ticker, months, startMonthIdx, setStartMonthIdx, endMonthIdx, setEndMonthIdx, monthsConfirmed, setMonthsConfirmed, loadingMonths }, ref) => {
  // store all the colours needed and then index them or something.... might be best way lol
  const [monthColours, setMonthColours] = useState(months.map((_, index) => index >= startMonthIdx && index <= endMonthIdx ? '#3d4f81' : '#172f58'));
  // this can't be null or check if it is

  // update monthColours when months changes
  useEffect(() => {
    if (monthsConfirmed) {
      setMonthColours(months.map((_, index) => index >= startMonthIdx && index <= endMonthIdx ? '#22437c' : '#172f58'))
    } else {
      setMonthColours(months.map((_, index) => index >= startMonthIdx && index <= endMonthIdx ? '#3d4f81' : '#172f58'))
    }
  }, [months, startMonthIdx, endMonthIdx, monthsConfirmed])
  
  // get the column headers for the months we actually have
  const [choosingStartMonth, setChoosingStartMonth] = useState(true);
  useEffect(() => {
    setStartMonthIdx(-1);
    setEndMonthIdx(-1);
    setChoosingStartMonth(true);
  }, [ticker])

  const handleMonthClick = (index) => {
    if (choosingStartMonth) {
      setStartMonthIdx(index);
      setEndMonthIdx(index);
      setChoosingStartMonth(false);
    } else {
      if (index < startMonthIdx) {
        setChoosingStartMonth(true);
        setStartMonthIdx(-1);
        setEndMonthIdx(-1);
      } else {
        setEndMonthIdx(index);
        // here is where we push down to step 4 of trading??
      }
    }
  }

  const handleConfirmClick = () => {
    if (startMonthIdx === -1) {
      alert('Please select a start and end month!');
      return;
    }
    if (startMonthIdx <= endMonthIdx) {
      setMonthsConfirmed(true);
      return;
    }
  }

  const TimeFrameBody = () => {
    if (loadingMonths) {
      return (
        <div style={{margin:'50px', display: 'flex', justifyContent: 'center'}}>
          <MoonLoader size={100} color={'#8892b0'} loading={loadingMonths} />
        </div>
      )
    } else {
      return (
        <div>
          <div className='button-pair'>
          <button 
            className='left-button'
            onClick={() => {
              setChoosingStartMonth(true);
              setMonthsConfirmed(false);
              setStartMonthIdx(-1);
              setEndMonthIdx(-1);
            }}
            style={{backgroundColor: choosingStartMonth && !monthsConfirmed ? `#3d4f81` : '#172f58'}}  
          >
            Select Start Month
          </button>
          <button 
            className='right-button'
            onClick={() => {
              if (startMonthIdx === -1) return;
              setChoosingStartMonth(false);
              setMonthsConfirmed(false);
            }}
            style={{backgroundColor: !choosingStartMonth && !monthsConfirmed ? '#3d4f81' : '#172f58'}}
          >
            Select End Month
          </button>
        </div>
        <div className='my-table'>
          {months.map((column, index) => (
            <button 
              key={index} 
              className='my-box-button'
              style={{backgroundColor: monthColours[index]}}
              // style={{backgroundColor: index >= startMonthIdx && index <= endMonthIdx ? '#3d4f81' : '#172f58'}}
              onClick={() => handleMonthClick(index)}
            >
              <h5>{column.split(' ')[0]}</h5>
              <h5>{column.split(' ')[1]}</h5>
            </button>
          ))}
        </div>
        <div className='next-page-button'>
          <button style={{margin: '20px'}} onClick={handleConfirmClick}>Confirm</button>
        </div>
      </div>
      )
    }
  }

  return (
    <div ref={ref} className='step'>
      <h1>Step 3. Choose Timeframe</h1>
      <h2>Select Months to Trade From and Until</h2>
      <TimeFrameBody />
    </div>
  );
});

const Simulator = ({ ticker,  months, startMonthIdx, endMonthIdx, monthsConfirmed }) => {
  // see if clicked button and will reroute if has
  const [clicked, setClicked] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');

  // format the date to be in the format needed by the mysql database
  const formatDate = (date, isStart) => {
    const [month, year] = date.split(' ');
    const monthNumber = new Date(Date.parse(month + ' 1, 2020')).getMonth() + 1;
    const formattedMonth = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
    return `${year}-${formattedMonth}-${isStart ? '01' : '31'}`;
  }
  
  const handleClick = () => {
    if (!monthsConfirmed) {
      alert('Please confirm your months before continuing!');
      return;
    }
    // get start and end months as strings
    setStartMonth(formatDate(months[startMonthIdx], true));
    setEndMonth(formatDate(months[endMonthIdx], false));

    setClicked(true);
  }

  return (
    <div className='step'>
      <h1>Step 4. Trade!</h1>
      <div className='next-page-button'>
        {clicked && <Navigate to={`/trading-simulator/Simulator/${ticker}/${startMonth}/${endMonth}`} />}
        <button onClick={handleClick}>Let's Go! {'->'}</button>
      </div>
    </div>
  )
}

const DownloadData = ({ ticker, monthsHeadersAll, monthsHeadersHave, loadingMonths }) => {
  return (
    <div className='step'>
      <h1>Step 2. Download New Data <span style={{ color: '#8892b0' }}>(optional)</span></h1>
      <h2>Tick Months You Wish to Download</h2>
      <DataTable ticker={ticker} monthsHeadersAll={monthsHeadersAll} monthsHeadersHave={monthsHeadersHave} loadingMonths={loadingMonths}/>
    </div>
  );
}

const StepContainer = forwardRef(({ gotoRef, children }, ref) => {

  const scrollToStep = (ref) => {
    ref.current.scrollIntoView({behavior: 'smooth'});
  }

  return (
    <div ref={ref} className='step-container'>
      <div className='side-bar'></div>
      {children}
      <div className='side-bar'>
        {gotoRef && <button onClick={() => scrollToStep(gotoRef)}>▼</button>}
      </div>
    </div>
  )
});

const Setup = () => {
  // useState variables needed by multiple components
  const [ticker, setTicker] = useState('');

  // get all months headers, this wont ever change. 
  const monthsHeadersAll = useRef([]);
  const monthsHeadersAllSet = useRef(false);
  useEffect(() => {
    if (monthsHeadersAllSet.current) return;
    monthsHeadersAllSet.current = true;
    const result = [];
    for (let date = new Date('2023-01-01'); date <= new Date(); date.setMonth(date.getMonth() + 1)) {
      const formattedDate = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
      result.push(formattedDate);
    }
    monthsHeadersAll.current = result;
  }, [])

  // get the column headers for all the months we have for the ticker, update when ticker changes
  const [monthsHeadersHave, setMonthsHeadersHave] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(true);

  const [startMonthIdx, setStartMonthIdx] = useState(-1);
  const [endMonthIdx, setEndMonthIdx] = useState(-1);
  const [monthsConfirmed, setMonthsConfirmed] = useState(false);
  
  const chooseStockRef = useRef(null);
  const downloadDataRef = useRef(null);
  const selectTimeframeRef = useRef(null);
  const simulatorRef = useRef(null);

  return (
    <div className='background-new'>
      <HeadingBanner />
      <div className='body-container'>
        <StepContainer ref={chooseStockRef} gotoRef={downloadDataRef} >
          <SelectStock ticker={ticker} setTicker={setTicker} setMonthsHeadersHave={setMonthsHeadersHave} setLoadingMonths={setLoadingMonths}/>
        </StepContainer>

        <StepContainer ref={downloadDataRef} gotoRef={selectTimeframeRef} >
          <DownloadData ticker={ticker} monthsHeadersAll={monthsHeadersAll.current} monthsHeadersHave={monthsHeadersHave} loadingMonths={loadingMonths}/>
        </StepContainer>
        
        <StepContainer ref={selectTimeframeRef} gotoRef={simulatorRef} >
          <SelectTimeframe 
            ticker={ticker} 
            months={monthsHeadersHave}
            startMonthIdx={startMonthIdx}
            setStartMonthIdx={setStartMonthIdx}
            endMonthIdx={endMonthIdx}
            setEndMonthIdx={setEndMonthIdx}
            monthsConfirmed={monthsConfirmed}
            setMonthsConfirmed={setMonthsConfirmed}
            loadingMonths={loadingMonths}
          />
        </StepContainer>

        <StepContainer ref={simulatorRef} gotoRef={null} >
          <Simulator ticker={ticker} months={monthsHeadersHave} startMonthIdx={startMonthIdx} endMonthIdx={endMonthIdx} monthsConfirmed={monthsConfirmed}/>
        </StepContainer>
      </div>
    </div>
  )
}

export default Setup;