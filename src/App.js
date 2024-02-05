import './App.css';
import React from 'react';
import axios from 'axios';
import HeadingBanner from './components/HeadingBanner';

const checkTaskStatus = (taskId) => {
  // send request to celery server to see if task is done
  axios.get(`${process.env.REACT_APP_API_URL}/check_task_status?task_id=${taskId}`)
    .then(response => {
      // this might need to be triple equal signs idk thooo. 
      if (response.data === 'COMPLETED') {
        console.log('task completed');
      } else {
        console.log(response.data);
        setTimeout(() => checkTaskStatus(taskId), 500);
      }
    })
    .catch(error => console.error('Error check task status: ', error));
}

const App = () => {

  return (
    <div>
      <HeadingBanner title={'APP'} backButtonPath={'/trading-simulator'}/>
      <h3>Yeah man</h3>
    </div>
  )
}

export default App;
