import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const App = () => {
  // State to track current slide and progress
  const [currentSlide, setCurrentSlide] = useState(0);
  const [totalSlides] = useState(10);
  const [timer, setTimer] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showDefinition, setShowDefinition] = useState(false);
  const [carPosition, setCarPosition] = useState(0);
  const [draggedAnswer, setDraggedAnswer] = useState(null);
  const [hearts, setHearts] = useState(3);
  const [distance, setDistance] = useState('');
  const [speed, setSpeed] = useState('');
  const [time, setTime] = useState('');
  const [rateLetters, setRateLetters] = useState(['R', 'A', 'T', 'E']);
  const [traveledLetters, setTraveledLetters] = useState([
    'T',
    'R',
    'A',
    'V',
    'E',
    'L',
    'E',
    'D',
  ]);
  const [selectedLetters1, setSelectedLetters1] = useState([]);
  const [selectedLetters2, setSelectedLetters2] = useState([]);
  const [jumbledWords, setJumbledWords] = useState([
    'The Rate at which an',
    'object',
    'covers a distance',
    'measured as the distance traveled divided by the time taken',
  ]);
  const [selectedJumbledWords, setSelectedJumbledWords] = useState([]);
  const [hasReachedDestination, setHasReachedDestination] = useState(false);

  const timerRef = useRef(null);
  const animationRef = useRef(null);

  // Shuffle arrays on component mount
  useEffect(() => {
    setRateLetters(shuffleArray(['R', 'A', 'T', 'E']));
    setTraveledLetters(shuffleArray(['T', 'R', 'A', 'V', 'E', 'L', 'E', 'D']));
    setJumbledWords(
      shuffleArray([
        'The Rate at which an',
        'object',
        'covers a distance',
        'measured as the distance traveled divided by the time taken',
      ])
    );
  }, []);

  // Function to shuffle array
  const shuffleArray = array => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Reset animation function
  const resetAnimation = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setCarPosition(0);
    setTimer(0);
    setIsAnimating(false);
    setHasReachedDestination(false);
  };

  // Start animation function
  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    let startTime = null;
    const animationDuration = 6000; // 6 seconds
    const totalDistance = 600; // 600 meters
    const initialSpeed = 100; // Initial speed in m/s
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const elapsedTime = progress / 1000; // Convert to seconds
      
      // Calculate current position (0-100%)
      const percentage = Math.min((progress / animationDuration) * 100, 100);
      setCarPosition(percentage);
      
      // Update timer
      setTimer(elapsedTime);
      
      // Calculate current speed (avoid division by zero)
      const currentSpeed = elapsedTime > 0 
        ? (totalDistance * percentage / 100) / elapsedTime 
        : initialSpeed;
      setSpeed(currentSpeed.toFixed(2));
      
      if (percentage < 100) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setHasReachedDestination(true);
        setIsAnimating(false);
        setShowDefinition(true); // Show definition after animation
        // Auto reset after 2 seconds
        setTimeout(resetAnimation, 2000);
      }
    };
    
    animationRef.current = requestAnimationFrame(animate);
  };

  // Update the car style to make movement smoother
  const carStyle = {
    left: `${carPosition}%`,
    transform: `scaleX(-1)`,
    transition: 'left 0.016s linear' // Approximately 60fps
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Logo Page Component
  const LogoPage = () => (
    <div className="logo-page">
      <div className="logo">
        <img src='/assets/yevvo-logo.svg' alt='Yevvo Logo' />
      </div>
      <h1 style={{ color: '#58cc02', fontSize: '28px', marginBottom: '20px' }}>
        Yevvo
      </h1>
      <button 
        onClick={() => setCurrentSlide(1)} 
        style={{
          backgroundColor: '#58cc02',
          color: 'white',
          border: 'none',
          padding: '15px 30px',
          borderRadius: '25px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s'
        }}
      >
        Start Learning
      </button>
    </div>
  );

  // Navigate to next slide
  const nextSlide = () => {
    if (currentSlide < totalSlides) {
      setCurrentSlide(currentSlide + 1);
      resetAnimation();
    }
  };

  // Navigate to previous slide
  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
      resetAnimation();
    }
  };

  // Handle drag start
  const handleDragStart = (event, answer) => {
    setDraggedAnswer(answer);
  };

  // Handle drop
  const handleDrop = event => {
    event.preventDefault();

    // For different questions based on the current slide
    if (currentSlide === 2) {
      setDistance(draggedAnswer);
    } else if (currentSlide === 5) {
      // Handle question in card 5
      if (draggedAnswer === '120 meters') {
        setHearts(hearts + 1);
      } else {
        setHearts(Math.max(0, hearts - 1));
      }
    }

    setDraggedAnswer(null);
  };

  // Handle drag over
  const handleDragOver = event => {
    event.preventDefault();
  };

  // Handle letter drag for word puzzles
  const handleLetterDrag = (letter, index, wordSet) => {
    if (wordSet === 1) {
      const newSelectedLetters = [...selectedLetters1];
      newSelectedLetters.push(letter);
      setSelectedLetters1(newSelectedLetters);

      const newLetters = [...rateLetters];
      newLetters.splice(index, 1);
      setRateLetters(newLetters);
    } else {
      const newSelectedLetters = [...selectedLetters2];
      newSelectedLetters.push(letter);
      setSelectedLetters2(newSelectedLetters);

      const newLetters = [...traveledLetters];
      newLetters.splice(index, 1);
      setTraveledLetters(newLetters);
    }
  };

  // Handle jumbled word selection
  const handleJumbledWordSelection = (word, index) => {
    const newSelectedWords = [...selectedJumbledWords];
    newSelectedWords.push(word);
    setSelectedJumbledWords(newSelectedWords);

    const newJumbledWords = [...jumbledWords];
    newJumbledWords.splice(index, 1);
    setJumbledWords(newJumbledWords);
  };

  return (
    <div className='app'>
      {currentSlide === 0 ? (
        <LogoPage />
      ) : (
        <>
          {/* Header with Progress Bar */}
          <div className='header'>
            <div className='back-button' onClick={prevSlide}>
              &larr;
            </div>
            <div className='progress-container'>
              {Array.from({ length: totalSlides - 1 }).map((_, index) => (
                <div
                  key={index}
                  className={`progress-segment ${
                    index < currentSlide ? 'completed' : ''
                  } ${index === currentSlide ? 'current' : ''}`}
                />
              ))}
            </div>
            <div className='hearts'>
              {Array.from({ length: hearts }).map((_, index) => (
                <span key={index} className='heart'>
                  ❤️
                </span>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className='content'>
            {/* Page 1: Car Animation */}
            {currentSlide === 1 && (
              <div className='animation-container'>
                <h2>Speed Animation</h2>
                <div className='road'>
                  <div className='start-point'>A</div>
                  <div className='path'>
                    <div className='car' style={carStyle}>
                      🚗
                    </div>
                    <div className='distance-label'>600 meters</div>
                  </div>
                  <div className='end-point'>B</div>
                </div>
                <div className='metrics'>
                  <div className='metric'>
                    <span>Distance:</span> {(600 * carPosition / 100).toFixed(0)}m
                  </div>
                  <div className='metric'>
                    <span>Time:</span> {timer.toFixed(1)}s
                  </div>
                  <div className='metric'>
                    <span>Speed:</span> {speed} m/s
                  </div>
                </div>
                <div className='controls'>
                  <button onClick={startAnimation} disabled={isAnimating}>
                    {isAnimating ? 'Moving...' : 'Start'}
                  </button>
                </div>

                {showDefinition && (
                  <div className='definition'>
                    <div className='dog-character'>
                      <img src='src/assets/yevvo-logo.svg' alt='Dog Character' />
                    </div>
                    <div className='definition-text'>
                      <h3>Speed Definition:</h3>
                      <p>
                        The Rate at which an object covers a distance, measured as
                        the distance traveled divided by the time taken
                      </p>
                      <div className='formula'>
                        <strong>Speed = Distance / Time</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="continue-btn-container">
                  <button onClick={nextSlide} className='continue-btn'>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Page 2: Question 1 (Speed) */}
            {currentSlide === 2 && (
              <div className='question-container'>
                <div className='character'>
                  <img src='src/assets/anne.jpg' alt='Anne character' />
                  <h3>Help Anne find the distance!</h3>
                </div>
                <div className='question'>
                  <p>
                    A car travels at a speed of 60 meters per second for 2 seconds.
                    What distance does it cover?
                  </p>
                  <div className='formula'>
                    <p>Remember: Distance = Speed × Time</p>
                  </div>
                  <div
                    className='answer-drop-area'
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {distance ? distance : 'Drop your answer here'}
                  </div>
                  <div className='options'>
                    {['80 meters', '120 meters', '100 meters', '140 meters'].map(
                      (option, index) => (
                        <div
                          key={index}
                          className='option speedometer'
                          draggable
                          onDragStart={e => handleDragStart(e, option)}
                        >
                          <div className='speedometer-dial'>
                            <div
                              className='speedometer-needle'
                              style={{ transform: `rotate(${index * 45}deg)` }}
                            ></div>
                          </div>
                          <div className='option-text'>{option}</div>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <button onClick={nextSlide} className='continue-btn'>
                  Continue
                </button>
              </div>
            )}

            {/* Page 3: Speed facts card */}
            {currentSlide === 3 && (
              <div className='facts-container'>
                <div className='dog-character'>
                  <img src='/api/placeholder/100/100' alt='Dog Character' />
                </div>
                <div className='fact-card'>
                  <h3>Fun Fact About Speed</h3>
                  <div className='fact-image'>
                    <img
                      src='/api/placeholder/300/200'
                      alt='Speed fact illustration'
                    />
                  </div>
                  <p>
                    The fastest land animal, the cheetah, can reach speeds of up to
                    70 mph (112 km/h) in just a few seconds!
                  </p>
                </div>
                <button onClick={nextSlide} className='continue-btn'>
                  Continue
                </button>
              </div>
            )}

            {/* Page 4: YouTube Video */}
            {currentSlide === 4 && (
              <div className='video-container'>
                <h3>Let's Learn More About Speed!</h3>
                <div className='video-embed'>
                  <div className='video-placeholder'>
                    <p>This is where the YouTube video would be embedded:</p>
                    <p>https://www.youtube.com/watch?v=EGqpLug-sDk</p>
                    <img src='/api/placeholder/560/315' alt='Video placeholder' />
                  </div>
                </div>
                <button onClick={nextSlide} className='continue-btn'>
                  Continue
                </button>
              </div>
            )}

            {/* Page 5: Distance Question */}
            {currentSlide === 5 && (
              <div className='question-container'>
                <div className='character'>
                  <img src='/api/placeholder/100/150' alt='Kid character' />
                  <h3>Find the distance when speed is given!</h3>
                </div>
                <div className='question'>
                  <p>
                    A car travels at a speed of 40 meters per second for 3 seconds.
                    What distance does it cover?
                  </p>
                  <div
                    className='answer-drop-area'
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {draggedAnswer ? draggedAnswer : 'Drop your answer here'}
                  </div>
                  <div className='options'>
                    {['80 meters', '120 meters', '100 meters', '140 meters'].map(
                      (option, index) => (
                        <div
                          key={index}
                          className='option'
                          draggable
                          onDragStart={e => handleDragStart(e, option)}
                        >
                          {option}
                        </div>
                      )
                    )}
                  </div>
                </div>
                <button onClick={nextSlide} className='continue-btn'>
                  Continue
                </button>
              </div>
            )}

            {/* Page 6: Letter Drag Drop 1 */}
            {currentSlide === 6 && (
              <div className='letter-drag-container'>
                <div className='dog-character'>
                  <img src='/api/placeholder/100/100' alt='Dog Character' />
                </div>
                <h3>
                  Form the word that means "The speed or velocity at which something
                  happens"
                </h3>
                <div className='word-container'>
                  {selectedLetters1.map((letter, index) => (
                    <div key={index} className='letter-box filled'>
                      {letter}
                    </div>
                  ))}
                  {Array.from({ length: 4 - selectedLetters1.length }).map(
                    (_, index) => (
                      <div key={index} className='letter-box'></div>
                    )
                  )}
                </div>
                <div className='letters'>
                  {rateLetters.map((letter, index) => (
                    <div
                      key={index}
                      className='letter'
                      onClick={() => handleLetterDrag(letter, index, 1)}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className='continue-btn'
                  disabled={selectedLetters1.length !== 4}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Page 7: Letter Drag Drop 2 */}
            {currentSlide === 7 && (
              <div className='letter-drag-container'>
                <div className='dog-character'>
                  <img src='/api/placeholder/100/100' alt='Dog Character' />
                </div>
                <h3>Form the word that means "Moved from one place to another"</h3>
                <div className='word-container'>
                  {selectedLetters2.map((letter, index) => (
                    <div key={index} className='letter-box filled'>
                      {letter}
                    </div>
                  ))}
                  {Array.from({ length: 8 - selectedLetters2.length }).map(
                    (_, index) => (
                      <div key={index} className='letter-box'></div>
                    )
                  )}
                </div>
                <div className='letters'>
                  {traveledLetters.map((letter, index) => (
                    <div
                      key={index}
                      className='letter'
                      onClick={() => handleLetterDrag(letter, index, 2)}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className='continue-btn'
                  disabled={selectedLetters2.length !== 8}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Page 8: Jumbled words */}
            {currentSlide === 8 && (
              <div className='jumbled-words-container'>
                <div className='dog-character'>
                  <img src='/api/placeholder/100/100' alt='Dog Character' />
                </div>
                <h3>
                  Form the correct sentence about speed from these jumbled phrases
                </h3>
                <div className='sentence-container'>
                  {selectedJumbledWords.map((word, index) => (
                    <div key={index} className='jumbled-word selected'>
                      {word}
                    </div>
                  ))}
                </div>
                <div className='jumbled-words'>
                  {jumbledWords.map((word, index) => (
                    <div
                      key={index}
                      className='jumbled-word'
                      onClick={() => handleJumbledWordSelection(word, index)}
                    >
                      {word}
                    </div>
                  ))}
                </div>
                <button
                  onClick={nextSlide}
                  className='continue-btn'
                  disabled={jumbledWords.length !== 0}
                >
                  Continue
                </button>
              </div>
            )}

            {/* Page 9: Final Question */}
            {currentSlide === 9 && (
              <div className='question-container'>
                <div className='character'>
                  <img src='/api/placeholder/100/150' alt='Anne character' />
                  <h3>One more challenge for Anne!</h3>
                </div>
                <div className='question'>
                  <p>
                    A cyclist travels 300 meters in 20 seconds. What is the
                    cyclist's speed?
                  </p>
                  <div className='formula'>
                    <p>Remember: Speed = Distance ÷ Time</p>
                  </div>
                  <div className='answer-inputs'>
                    <div className='input-group'>
                      <label>Speed:</label>
                      <input
                        type='text'
                        value={speed}
                        onChange={e => setSpeed(e.target.value)}
                        placeholder='Enter speed'
                      />
                    </div>
                  </div>
                </div>
                <button onClick={nextSlide} className='continue-btn'>
                  Continue
                </button>
              </div>
            )}

            {/* Congratulations Screen */}
            {currentSlide === 10 && (
              <div className='congrats-container'>
                <div className='dog-character happy'>
                  <img src='/api/placeholder/150/150' alt='Happy Dog Character' />
                </div>
                <h2>Congratulations!</h2>
                <p>You've completed all the lessons about speed!</p>
                <div className='stars'>⭐⭐⭐⭐⭐</div>
                <button onClick={() => setCurrentSlide(0)} className='restart-btn'>
                  Restart
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
