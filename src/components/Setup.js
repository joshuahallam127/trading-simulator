import React, { useState, useEffect, useRef, forwardRef } from 'react';
import './Setup.css';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import { createFilter } from 'react-select';
import MoonLoader from 'react-spinners/MoonLoader';
import BeatLoader from 'react-spinners/BeatLoader';
import { Navigate, Link } from 'react-router-dom';

const HeadingBanner = () => (
  <div className='heading-banner-new'>
    <div className='back-button-container'>
      <Link to={'/trading-simulator'}>
        <button className='back-button'>{'<'}</button>
      </Link>
    </div>
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

const scrollToStep = (ref) => {
  ref.current.scrollIntoView({behavior: 'smooth'});
}

const Setup = () => {
  // references
  const downloadDataRef = useRef(null);
  const selectTimeframeRef = useRef(null);
  const simulatorRef = useRef(null);

  // window width and update on change
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // do some maths for max buttons in a row when window changes
  const [buttonsInRow, setButtonsInRow] = useState(5);
  useEffect(() => {
    const usableWidth = 0.6 * width;
    const buttonSize = 13.5 * 16;
    setButtonsInRow(Math.floor(usableWidth / buttonSize));
  }, [width]);

  // chosen ticker
  const [ticker, setTicker] = useState('');
  
  // all tickers with loaded datasets
  const [tickerOptions, setTickerOptions] = useState([]); 
  const [loadingTickers, setLoadingTickers] = useState(true);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/list_ticker_options`)
    .then(response => {
      setTickerOptions(response.data);
      setLoadingTickers(false);
      setTicker(response.data[0]);
    })
    .catch(error => console.error('Error getting ticker options: ', error));
  }, []);

  // all possible tickers
  const [allTickers, setAllTickers] = useState([]);
  useEffect(() => {
    fetch('all_tickers.txt')
      .then(response => response.text())
      .then(text => text.split('\n'))
      .then(tickers => setAllTickers(tickers))
      .catch(error => console.error('Error fetching file: ', error));
  }, []);

  const [seeMore, setSeeMore] = useState(false);
  
  // select stock component
  const SelectStock = () => {
    const SearchTicker = () => {
      const getFilteredOptions = (inputValue, callback) => {
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
            value={{ label: ticker, value: ticker}}
          />
        </div>
      )
    }

    return (
      <div className='step'>
        <h1>Step 1. Choose Stock To Trade</h1>
        <h2>Preloaded Datasets</h2>
        <div className='ticker-buttons'>
          {loadingTickers && (
            <div style={{margin:'50px'}}>
              <MoonLoader size={150} color={'#8892b0'} loading={loadingTickers} />
            </div>
          )}
          {tickerOptions.slice(0, buttonsInRow * 2).map((tickerOption, index) => (
            <button 
              key={index}
              style={{backgroundColor: tickerOption === ticker ? '#3d4f81' : '#172f58'}} 
              onClick={(e) => setTicker(e.target.innerText)}
            >
              {tickerOption}
            </button>
          ))}
          {seeMore && (
            <>
              {tickerOptions.slice(buttonsInRow * 2).map((tickerOption, index) => (
                <button 
                  key={index}
                  style={{backgroundColor: tickerOption === ticker ? '#3d4f81' : '#172f58'}} 
                  onClick={(e) => setTicker(e.target.innerText)}
                >
                  {tickerOption}
                </button>
              ))}
            </>
          )
          }
        </div>
        {tickerOptions.length > buttonsInRow * 2 &&
        <div className='see-more-container'>
          <span onClick={() => setSeeMore(!seeMore)}>{seeMore ? 'See Less ▲' : 'See More ▼'}</span>
        </div>
        }
        <h2>Search New Ticker</h2>
        <div className='new-options'>
          <SearchTicker />
        </div>
        {downloadDataRef && 
        <div className='continue-button'>
          <button style={{margin: '20px'}} onClick={() => scrollToStep(downloadDataRef)}>Continue</button>
        </div>}
      </div>
    )
  };


  // get all months headers
  const [monthsHeadersAll, setMonthsHeadersAll] = useState([]);
  useEffect(() => {
    const result = [];
    for (let date = new Date('2023-01-01'); date <= new Date(); date.setMonth(date.getMonth() + 1)) {
      const formattedDate = new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date);
      result.push(formattedDate);
    }
    setMonthsHeadersAll(result);
  }, []);

  // get the months headers for the ticker
  const [monthsHeadersHave, setMonthsHeadersHave] = useState([]);
  const [loadingMonths, setLoadingMonths] = useState(true);
  const getMonthsHeadersHave = () => {
    setLoadingMonths(true);
    axios.get(`${process.env.REACT_APP_API_URL}/get_months_data?ticker=${ticker}`)
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
  useEffect(() => getMonthsHeadersHave(), [ticker]);

  // array defining if there is a checkbox for that month, and if so whether it is checked
  // each element of the form (is there a checkbox, is it checked)
  const [checkboxes, setCheckboxes] = useState([]);
  useEffect(() => {
    setCheckboxes(monthsHeadersAll.map((column) => monthsHeadersHave.includes(column) ? [false, false] : [true, false]));
  }, [monthsHeadersHave, monthsHeadersAll])

  // get calls to the api left remaining
  const [callsRemaining, setCallsRemaining] = useState(25);
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/get_remaining_calls`)
    .then(response => setCallsRemaining(response.data))
    .catch(error => console.error('Error getting remaining api calls: ', error));
  }, []);

  // cost of downloading data
  const [cost, setCost] = useState(1);
  useEffect(() => {
    let cost = checkboxes.filter((checkbox) => checkbox[1]).length;
    // if there is at least one no checkbox, we must add 1
    if (checkboxes.filter((checkbox) => !checkbox[0]).length > 0) {
      cost++;
    }
    setCost(cost);
  }, [checkboxes]);

  // if data is currently downlading
  const [downloadingData, setDownloadingData] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);
  useEffect(() => {
    if (downloadingData) {
      if (timeRemaining === 0) {
        return;
      }
      const interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [downloadingData, timeRemaining])

  // function to change from month to date
  const formatDate = (date, isStart) => {
    const [month, year] = date.split(' ');
    const monthNumber = new Date(Date.parse(month + ' 1, 2020')).getMonth() + 1;
    const formattedMonth = monthNumber < 10 ? `0${monthNumber}` : monthNumber;
    return `${year}-${formattedMonth}-${isStart ? '01' : '31'}`;
  }

  // download data component 
  const DownloadData = forwardRef((_, ref) => {

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
    }

    const handleDownloadClick = () => {
      if (cost > callsRemaining) {
        alert(`You do not have enough calls remaining to download this data. You have ${callsRemaining} calls remaining.`);
        return;
      }
      if (!checkboxes.some(checkbox => checkbox[1])) {
        alert('Please select at least one month to download!');
        return;
      }
      const startMonthIdx = checkboxes.findIndex(checkbox => checkbox[1]);
      const endMonthIdx = checkboxes.map(checkbox => checkbox[1]).lastIndexOf(true);
      const startMonth = formatDate(monthsHeadersAll[startMonthIdx === 0 ? 0 : startMonthIdx - 1], true);
      const endMonth = formatDate(monthsHeadersAll[endMonthIdx], false);
      setDownloadingData(true);
      setTimeRemaining((endMonthIdx - startMonthIdx + 1) * 10);
      
      axios.get(`${process.env.REACT_APP_API_URL}/download_data?ticker=${ticker}&startMonth=${startMonth}&endMonth=${endMonth}`)
      .then(response => {
        if (response.data === 'FAILED') {
          alert('Data download failed, ran out of api calls. Please try again later.');
          setDownloadingData(false);
          setCallsRemaining(0);
        }
        setCallsRemaining(callsRemaining - cost);
        setDownloadingData(false);
        getMonthsHeadersHave();
      })
      .catch(error => {
        alert('Unknown error downloading data');
        setDownloadingData(false);
      });
    }

    return (
      <div ref={ref} className='step'>
        <h1>Step 2. Download New Data <span style={{ color: '#8892b0' }}>(optional)</span></h1>
        {downloadingData ?
        <div>
          <div style={{display: 'flex', flexDirection: 'row'}}>
            <h3>Data is currently downloading</h3>
            <div style={{display: 'flex', alignItems: 'flex-end', paddingBottom: '6px'}}>
              <BeatLoader size='10px' color='#8892b0'/>
            </div>
          </div>
          {timeRemaining > 0 ?
          <h5>Estimated time remaining: {timeRemaining}s</h5> 
          :
          <h5>Data will be downloaded shortly</h5>
          }
        </div>
        :
        <div>
          <p style={{fontSize: '22px'}}>✔️ = Data Already Downloaded For stock {ticker}</p>
          <p style={{fontSize: '22px'}}><input type='checkbox' disabled /> = Tick Box Then Press 'Start Download' To Download More Data To Trade</p>
          {loadingMonths ?
            <div style={{margin:'50px', display: 'flex', justifyContent: 'center' }}>
              <MoonLoader size={150} color={'#8892b0'} loading={loadingMonths} />
            </div> 
            :
            <div>
              <div className='my-table'>
                {monthsHeadersAll.map((column, index) => (
                  <div key={index} className='my-box'>
                    <h5>{column.split(' ')[0]}</h5>
                    <h5>{column.split(' ')[1]}</h5>
                    <p>{checkboxes[index][0] ? 
                      <input 
                        type='checkbox' 
                        checked={checkboxes[index][1]} 
                        onChange={() => handleCheckboxClick(index)}
                      /> : '✔️'}</p>
                  </div>
                ))}
              </div>
              <div className='download-buttons'>
                <div style={{flex: '1'}}>
                  <p>Calls required: <span style={{color: callsRemaining - cost >= 0 ? 'green' : 'red'}}>{cost}</span></p>
                  <p>Calls remaining: {callsRemaining}</p>
                </div>
                <div>
                  <button onClick={handleDownloadClick}>Start Download</button>
                </div>
                <div style={{flex: '1'}}>

                </div>
              </div>
            </div>
          }
        </div>
        }
        {selectTimeframeRef && 
        <div className='continue-button'>
          <button style={{margin: '20px'}} onClick={() => scrollToStep(selectTimeframeRef)}>Continue</button>
        </div>}
      </div>
    );
  });


  // select tiemframe shit
  const [startMonthIdx, setStartMonthIdx] = useState(-1);
  const [endMonthIdx, setEndMonthIdx] = useState(-1);
  const [monthsConfirmed, setMonthsConfirmed] = useState(false);

  // store all the colours needed and then index them or something.... might be best way lol
  const [monthColours, setMonthColours] = useState(monthsHeadersHave.map((_, index) => index >= startMonthIdx && index <= endMonthIdx ? '#3d4f81' : '#172f58'));
  useEffect(() => {
    if (monthsConfirmed) {
      setMonthColours(monthsHeadersHave.map((_, index) => index >= startMonthIdx && index <= endMonthIdx ? '#22437c' : '#172f58'))
    } else {
      if (startMonthIdx !== -1 && endMonthIdx === -1) {
        setMonthColours(monthsHeadersHave.map((_, index) => index === startMonthIdx ? '#3d4f81' : '#172f58'))
      } else {
        setMonthColours(monthsHeadersHave.map((_, index) => index >= startMonthIdx && index <= endMonthIdx ? '#3d4f81' : '#172f58'))
      }
    }
  }, [monthsHeadersHave, startMonthIdx, endMonthIdx, monthsConfirmed])
  
  // get the column headers for the monthsHeadersHave we actually have
  const [choosingStartMonth, setChoosingStartMonth] = useState(true);
  useEffect(() => {
    setStartMonthIdx(-1);
    setEndMonthIdx(-1);
    setChoosingStartMonth(true);
  }, [ticker]);

  const shortToLongMonth = {
    'Jan': 'January',
    'Feb': 'February',
    'Mar': 'March',
    'Apr': 'April',
    'May': 'May',
    'Jun': 'June',
    'Jul': 'July',
    'Aug': 'August',
    'Sep': 'September',
    'Oct': 'October',
    'Nov': 'November',
    'Dec': 'December'
  }

  const shortToLongDate = (shortDate) => {
    const [month, year] = shortDate.split(' ');
    return `${shortToLongMonth[month]} ${year}`;
  }

  const SelectTimeframe = forwardRef((_, ref) => {
    const handleMonthClick = (index) => {
      if (monthsConfirmed) return;
      if (choosingStartMonth) {
        setStartMonthIdx(index);
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
      if (startMonthIdx === -1 || endMonthIdx === -1) {
        alert('Please select a start and end month!');
        return;
      }
      if (startMonthIdx <= endMonthIdx) {
        setMonthsConfirmed(true);
      }
    }
  
    return (
      <div ref={ref} className='step'>
        <h1>Step 3. Choose Trading Timeframe</h1>
        {loadingMonths ? 
          <div style={{margin:'50px', display: 'flex', justifyContent: 'center'}}>
            <MoonLoader size={100} color={'#8892b0'} loading={loadingMonths} />
          </div>
          :
          <div>
            <div className='from-to'>
              <h2>From: {startMonthIdx !== -1 ? shortToLongDate(monthsHeadersHave[startMonthIdx]) : '______ ____'}</h2>
              <h2>To: {endMonthIdx !== -1 ? shortToLongDate(monthsHeadersHave[endMonthIdx]) : '______ ____'}</h2>
            </div>
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
              {monthsHeadersHave.map((column, index) => (
                <button 
                  key={index} 
                  className='my-box-button'
                  style={{backgroundColor: monthColours[index]}}
                  onClick={() => handleMonthClick(index)}
                >
                  <h5>{column.split(' ')[0]}</h5>
                  <h5>{column.split(' ')[1]}</h5>
                </button>
              ))}
            </div>
            <div className='continue-button'>
              <button style={{margin: '20px'}} onClick={handleConfirmClick}>Confirm Months</button>
            </div>
            {simulatorRef && 
            <div className='continue-button'>
              <button style={{margin: '20px'}} onClick={() => scrollToStep(simulatorRef)}>Continue</button>
            </div>}
          </div>
        }
      </div>
    );
  });

  // see if clicked button and will reroute if has
  const [clicked, setClicked] = useState(false);
  const [startMonth, setStartMonth] = useState('');
  const [endMonth, setEndMonth] = useState('');

  const Simulator = forwardRef((_, ref) => {
    const handleClick = () => {
      if (!monthsConfirmed) {
        alert('Please confirm your months before continuing!');
        return;
      }
      // get start and end months as strings
      setStartMonth(formatDate(monthsHeadersHave[startMonthIdx], true));
      setEndMonth(formatDate(monthsHeadersHave[endMonthIdx], false));
  
      setClicked(true);
    }
  
    return (
      <div ref={ref} className='step'>
        <h1>Step 4. Trade!</h1>
        {monthsConfirmed && (<h2>Click button to start the simulator trading {ticker} from {shortToLongDate(monthsHeadersHave[startMonthIdx])} until {shortToLongDate(monthsHeadersHave[endMonthIdx])}</h2>)}
        <div className='continue-button'>
          {clicked && <Navigate to={`/trading-simulator/Simulator/${ticker}/${startMonth}/${endMonth}`} />}
          <button onClick={handleClick}>Let's Go! {'->'}</button>
        </div>
      </div>
    )
  });
  
  return (
    <div className='background-new'>
      <HeadingBanner />
      <div className='body-container'>
        <SelectStock />
        <DownloadData ref={downloadDataRef}/>
        <SelectTimeframe ref={selectTimeframeRef} />
        <Simulator ref={simulatorRef}/>
      </div>
    </div>
  )
}

export default Setup;