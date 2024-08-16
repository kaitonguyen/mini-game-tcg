import { useEffect, useState } from 'react';
import './App.css';
import { Box, Button, FormControl, InputLabel, MenuItem, Modal, Select, Stack, Typography } from '@mui/material';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, timelineItemClasses, TimelineSeparator } from '@mui/lab';

const words = "Hãy liệng bánh ngươi nơi mặt nước , vì khỏi lâu ngày ngươi sẽ tìm nó lại . Truyền đạo 11 : 1".split(" ");
let wordOpts = [...words];
wordOpts = wordOpts.sort();

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  backgroundColor: '#ffffff',
  p: 4,
};

const BasicTimeline = ({ timelineItems }) => {
  return (
    <Timeline
      sx={{
        [`& .${timelineItemClasses.root}:before`]: {
          flex: 0,
          padding: 0,
        },
      }}
    >
      {
        timelineItems && timelineItems.map((item, index) => (
          <TimelineItem key={index} sx={{ minHeight: 'unset' }}>
            <TimelineSeparator>
              <TimelineDot color="success" />
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>{item}</TimelineContent>
          </TimelineItem>)
        )
      }
    </Timeline>
  );
}

function App() {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalTime, setIntervalTime] = useState(100); // Starting speed
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hiddenWords, setHiddenWords] = useState(true);
  const [hiddenWordIndexes, setHiddenWordIndexes] = useState([]);
  const [timelineItems, setTimelineItems] = useState([]);

  const addToTimeline = (text) => {
    setTimelineItems([...timelineItems, text]);
  };

  const [findingSound] = useState(new Audio('/sfx/finding.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);

  const playSound = (sound) => {
    switch (sound) {
      case "finding":
        findingSound.play();
        break;

      case "right":
        new Audio(`/sfx/right.mp3`).play();
        break;

      case "wrong":
        let randomNumber = Math.floor(Math.random() * 3) + 1;
        new Audio(`/sfx/wrong${randomNumber}.mp3`).play();
        break;

      default:
        break;
    }
  };
  const stopSound = (sound) => {
    switch (sound) {
      case "finding":
        findingSound.pause();
        findingSound.currentTime = 0; // Reset to start
        break;

      case "right":
        findingSound.pause();
        findingSound.currentTime = 0; // Reset to start
        break;

      case "wrong":
        findingSound.pause();
        findingSound.currentTime = 0; // Reset to start
        break;

      default:
        break;
    }

  };

  const toggleHiddenWordIndex = (index) => {
    addToTimeline(`Mở ô ${index + 1}`);
    const newHiddenWordIndexes = [...hiddenWordIndexes];
    newHiddenWordIndexes[index] = -1;
    setHiddenWordIndexes([...newHiddenWordIndexes]);
  };

  useEffect(() => {
    setHiddenWordIndexes(Array.from({ length: words.length }, (_, i) => hiddenWords === true ? -1 : i));
  }, [words.length, hiddenWords]);

  useEffect(() => {
    let interval;

    if (isRunning) {
      interval = setInterval(() => {
        const hiddenButtons = hiddenWordIndexes.filter(button => button !== -1);
        if (hiddenButtons.length === 0) {
          clearInterval(interval); // Không còn button nào ẩn để chọn
          return;
        }

        // setCurrentIndex((prevIndex) => {
        //   const newIndex = (prevIndex + 1) % words.length;
        //   return newIndex;
        // });

        const randomIndex = Math.floor(Math.random() * hiddenButtons.length);
        setCurrentIndex(hiddenButtons[randomIndex]); // Chọn 1 button;

        setElapsedTime((prevTime) => {
          const newTime = prevTime + intervalTime;
          if (newTime >= 2000 && newTime < 5000) {
            setIntervalTime((prevInterval) => prevInterval + 200); // Slow down after 2 seconds
          } else if (newTime >= 5000) {
            clearInterval(interval);
            setIsRunning(false);

            addToTimeline(`Chọn ô ${randomIndex + 1}`);
            stopSound("finding");
          }
          return newTime;
        });
      }, intervalTime);
    }

    return () => clearInterval(interval);
  }, [isRunning, intervalTime, words.length]);


  const startGame = () => {
    addToTimeline("Bắt đầu chọn ô...");
    playSound("finding");
    setCurrentIndex(currentIndex);
    setElapsedTime(0);
    setIntervalTime(100);
    setIsRunning(true);
  };

  const [open, setOpen] = useState(false);
  const openModal = (idx) => {
    setOpen(idx);
  };

  const closeModal = () => {
    setOpen(false);
  };

  const [answer, setAnswer] = useState("");

  const handleAnswerChange = (event) => {
    setAnswer(event.target.value);
  };


  const flipCard = (idx, value) => {
    const newHiddenWordIndexes = [...hiddenWordIndexes];
    newHiddenWordIndexes[idx] = value;
    setHiddenWordIndexes([...newHiddenWordIndexes]);
  };

  const checkAnswer = () => {
    if (answer === words[currentIndex]) {
      addToTimeline(`Đúng ô ${currentIndex + 1}`);
      playSound("right");
      flipCard(currentIndex, -1);
      closeModal();
    } else {
      addToTimeline(`Sai ô ${currentIndex + 1}`);
      playSound("wrong");
      flipCard(currentIndex, -2);
      closeModal();
    }
    setAnswer("");
  };

  console.log(hiddenWordIndexes);

  return (
    <>
      <Box component="section" sx={{ display: 'flex', flexWrap: 'wrap', height: '100%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#282c34', color: 'white', px: 10 }}>
        <Stack direction="row" useFlexGap flexWrap="wrap" spacing={2} justifyContent="center" sx={{
          padding: '0', width: '100%',
        }}>
          {words.map((w, i) =>
            <Button
              key={i}
              variant="contained"
              color={currentIndex === i ? 'error' : hiddenWordIndexes[i] === -1 ? 'warning' : hiddenWordIndexes[i] === -2 ? 'secondary' : 'info'}
              sx={{ fontSize: '3.5rem', width: '20rem', height: '7rem' }}
              onClick={() => {
                // toggleHiddenWordIndex(i); 
                openModal(i)
              }}>
              {hiddenWords ? w : hiddenWordIndexes[i] === -1 || hiddenWordIndexes[i] === -2 ? w : i + 1}
            </Button>)
          }
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center" sx={{ width: '100%' }}>
          <Box sx={{
            height: '7rem', width: '700px', overflowY: 'scroll', backgroundColor: '#373d4a',
            display: 'flex',
            flexDirection: 'column-reverse'
          }}>
            <BasicTimeline timelineItems={timelineItems} />
          </Box>
          <Stack direction="row" spacing={2} justifyContent="flex-end" alignItems="center">
            <Button variant="contained" color='secondary' sx={{ fontSize: '1.5rem' }} onClick={() => setHiddenWords(!hiddenWords)} disabled={!hiddenWords}>
              {hiddenWords ?
                <>
                  <span className="material-symbols-outlined me-2">
                    visibility_off
                  </span>
                  Ẩn
                </> :
                <>
                  <span className="material-symbols-outlined me-2">
                    visibility
                  </span>
                  Hiện
                </>}
            </Button>
            <Button variant="contained" color='success' sx={{ fontSize: '1.5rem' }} onClick={startGame} disabled={isRunning || hiddenWords === true}>
              <span className="material-symbols-outlined">
                play_arrow
              </span>
              <span className='ms-2'>Bắt đầu</span>
            </Button>
          </Stack>
        </Stack>
      </Box >
      {
        open !== false &&
        <Modal
          open={open}
          onClose={closeModal}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box
            sx={modalStyle}>
            <Typography id="modal-modal-title" variant="h6" component="h2">

            </Typography>
            <Typography id="modal-modal-description" sx={{ mt: 2, mb: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">{`Ô số ${open + 1} có nội dung là:`}</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label={`Ô số ${open + 1} có nội dung là:`}
                  onChange={handleAnswerChange}
                >
                  {
                    wordOpts.map((w, i) => <MenuItem key={i} value={w} sx={{ fontSize: '1.5rem' }}>{w.toUpperCase()}</MenuItem>)
                  }
                </Select>
              </FormControl>
              {/* {words[open]} */}
            </Typography>
            <Button variant='contained' color='info' size='large' sx={{ fontSize: '1.5rem' }} disabled={!answer} onClick={() => { checkAnswer(); }}>Đáp án</Button>
          </Box>
        </Modal>
      }

    </>
  );
}

export default App;
