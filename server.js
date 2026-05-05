const express = require('express');
const path = require('path');
const talksData = require('./data/talks');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/talks', (req, res) => {
  const schedule = [];
  let currentTime = new Date();
  currentTime.setHours(10, 0, 0, 0); // 10:00 AM

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  talksData.forEach((talk, index) => {
    const startTime = new Date(currentTime);
    currentTime.setMinutes(currentTime.getMinutes() + 60);
    const endTime = new Date(currentTime);

    schedule.push({
      ...talk,
      type: 'talk',
      startTime: formatTime(startTime),
      endTime: formatTime(endTime)
    });

    // After talk 3, add lunch break
    if (index === 2) {
      const lunchStart = new Date(currentTime);
      currentTime.setMinutes(currentTime.getMinutes() + 60);
      const lunchEnd = new Date(currentTime);
      
      schedule.push({
        type: 'break',
        label: 'Lunch Break',
        startTime: formatTime(lunchStart),
        endTime: formatTime(lunchEnd)
      });
      // No transition after lunch break before the next talk, 
      // or should there be? "10-minute transition between every talk".
      // Let's assume the 10m transition is ONLY between talks.
    } else if (index < talksData.length - 1) {
      // Transition between talks
      currentTime.setMinutes(currentTime.getMinutes() + 10);
    }
  });

  res.json(schedule);
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
