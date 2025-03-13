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
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
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
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(0); // Start at 0% (80m)
  const [currentSliderValue, setCurrentSliderValue] = useState(80); // Start at 80m

  const timerRef = useRef(null);
  const animationRef = useRef(null);
  const sliderRef = useRef(null);

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
      <div className="loading-circles">
        <div className="loading-circle"></div>
        <div className="loading-circle"></div>
        <div className="loading-circle"></div>
      </div>
      <div className="logo">
        <img src='/assets/yevvo-logo.svg' alt='SpeedMaster Logo' />
      </div>
      <h1 style={{ color: '#58cc02', fontSize: '28px', marginBottom: '20px' }}>
        SpeedMaster
      </h1>
      <button 
        onClick={() => setCurrentSlide(1)} 
        style={{
          backgroundColor: '#58cc02',
          color: 'white',
          border: 'none',
          padding: '18px 36px',
          borderRadius: '25px',
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          zIndex: 1,
          minWidth: '200px'
        }}
      >
        Start Learning
      </button>
    </div>
  );

  // Navigate to next slide
  const nextSlide = () => {
    if (currentSlide < totalSlides && hearts > 0) {
      setCurrentSlide(currentSlide + 1);
      resetAnimation();
      setDistance('');
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

  // Handle drop with updated heart logic
  const handleDrop = event => {
    event.preventDefault();
    if (currentSlide === 2) {
      setDistance(draggedAnswer);
      if (draggedAnswer !== '120 meters') {
        const newHearts = hearts - 1;
        setHearts(newHearts);
        
        // If no hearts left, reset to animation page
        if (newHearts === 0) {
          setTimeout(() => {
            setCurrentSlide(1); // Reset to animation page
            setHearts(3); // Restore hearts
            resetAnimation(); // Reset animation state
            setDistance(''); // Clear answer
          }, 1500); // Give time to show the wrong answer
          return; // Don't proceed to next slide
        }
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
      
      // Remove the selected letter from available letters
      const newLetters = [...rateLetters];
      newLetters.splice(index, 1);
      setRateLetters(newLetters);
      
      // Update selected letters
      setSelectedLetters1(newSelectedLetters);
      
      // Check if all boxes are filled (4 letters)
      if (newSelectedLetters.length === 4) {
        // Check if the word spells "RATE"
        if (newSelectedLetters.join('') !== 'RATE') {
          // Incorrect spelling - reduce heart
          const newHearts = hearts - 1;
          setHearts(newHearts);
          
          // If no hearts left, reset to animation page
          if (newHearts === 0) {
            setTimeout(() => {
              setCurrentSlide(1); // Reset to animation page
              setHearts(3); // Restore hearts
              // Reset the letter drag state
              setSelectedLetters1([]);
              setRateLetters(shuffleArray(['R', 'A', 'T', 'E']));
            }, 1500);
          } else {
            // If hearts remain, reset the current attempt
            setTimeout(() => {
              setSelectedLetters1([]);
              setRateLetters(shuffleArray(['R', 'A', 'T', 'E']));
            }, 1000);
          }
        }
      }
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

  // Fixed slider value options
  const sliderOptions = [80, 100, 120, 140];
  
  // Get the position for a specific option index (0-3)
  const getPositionForOptionIndex = (index) => {
    // Map each index to a specific position percentage
    // Adjusted to have equal spacing between marks
    const positions = [0, 33.33, 66.66, 100];
    return positions[index];
  };
  
  // Function to move slider to next option
  const moveToNextOption = () => {
    const currentIndex = sliderOptions.indexOf(currentSliderValue);
    if (currentIndex < sliderOptions.length - 1) {
      const nextIndex = currentIndex + 1;
      const nextValue = sliderOptions[nextIndex];
      console.log(`Moving to next option: ${nextValue} (index: ${nextIndex})`);
      setCurrentSliderValue(nextValue);
      
      // Calculate position directly from index
      const newPosition = getPositionForOptionIndex(nextIndex);
      console.log(`New position: ${newPosition}%`);
      setSliderPosition(newPosition);
    }
  };

  // Function to move slider to previous option
  const moveToPrevOption = () => {
    const currentIndex = sliderOptions.indexOf(currentSliderValue);
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      const prevValue = sliderOptions[prevIndex];
      console.log(`Moving to previous option: ${prevValue} (index: ${prevIndex})`);
      setCurrentSliderValue(prevValue);
      
      // Calculate position directly from index
      const newPosition = getPositionForOptionIndex(prevIndex);
      console.log(`New position: ${newPosition}%`);
      setSliderPosition(newPosition);
    }
  };

  // Function to handle continue button click - updated to correctly check answer
  const handleSliderContinue = () => {
    if (currentSliderValue !== 120) {
      // Only reduce hearts if the answer is wrong
      const newHearts = hearts - 1;
      setHearts(newHearts);
      
      // If no hearts left, reset to animation page
      if (newHearts === 0) {
        setTimeout(() => {
          setCurrentSlide(1); // Reset to animation page
          setHearts(3); // Restore hearts
          resetAnimation(); // Reset animation state
        }, 1500);
        return;
      }
    }
    
    nextSlide();
  };

  // Initialize slider position when slide 5 is shown
  useEffect(() => {
    if (currentSlide === 5) {
      // Reset to first option (80m)
      setCurrentSliderValue(sliderOptions[0]);
      setSliderPosition(getPositionForOptionIndex(0));
      console.log("Initialized slider position to 80m");
    }
  }, [currentSlide]);

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
              <span className='heart'>❤️</span>
              <span className='heart-counter'>×{hearts}</span>
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
                  <span role="img" aria-label="Anne character" style={{ fontSize: '50px', marginRight: '15px' }}>
                    👩‍🏫
                  </span>
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
                    style={{
                      borderColor: distance ? '#58cc02' : '#ccc',
                      backgroundColor: distance ? '#e5f8d0' : '#f0f0f0',
                      color: distance ? '#58cc02' : '#666'
                    }}
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
                <div className="continue-btn-container">
                  <button 
                    onClick={nextSlide} 
                    className='continue-btn'
                    disabled={!distance}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Page 3: Speed facts card */}
            {currentSlide === 3 && (
              <div className='facts-container'>
                <div className='fact-card'>
                  <h3>Fun Fact About Speed</h3>
                  <div className='fact-image'>
                    <img
                      src='/src/assets/cheetah-running.gif'
                      alt='Cheetah running at high speed'
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMjM0NWNmZWM4ZmM4NzM4ZjBmYzM4ZDM4M2NhOGM0ZmE4ZTBkYjE2YiZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/l378zBXmzRxeCjQe4/giphy.gif';
                      }}
                      style={{ 
                        objectFit: 'cover',
                        width: '100%',
                        height: '100%',
                        display: 'block',
                        marginBottom: '0'
                      }}
                    />
                  </div>
                  <p>
                    The fastest land animal, the cheetah, can reach speeds of up to
                    70 mph (112 km/h) in just a few seconds! Their incredible acceleration
                    and agility make them nature's perfect sprinters.
                  </p>
                </div>
                <div className="continue-btn-container">
                  <button onClick={nextSlide} className='continue-btn' disabled={hearts === 0}>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Page 4: YouTube Video */}
            {currentSlide === 4 && (
              <div className='video-container'>
                <h2>Understanding Speed & Motion</h2>
                <p className="video-description">
                  Watch this engaging video to learn about speed, velocity, and motion in everyday life!
                </p>
                <div className='video-embed'>
                  <iframe
                    src="https://www.youtube.com/embed/EGqpLug-sDk"
                    title="Speed Learning Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="video-summary">
                  <h3>Key Points to Remember:</h3>
                  <ul>
                    <li>Speed is the rate of change in position</li>
                    <li>Distance covered depends on speed and time</li>
                    <li>Different objects move at different speeds</li>
                    <li>Speed helps us measure how fast something moves</li>
                  </ul>
                </div>
                <div className="continue-btn-container">
                  <button onClick={nextSlide} className='continue-btn'>
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Page 5: Distance Question - FIXED SLIDER IMPLEMENTATION */}
            {currentSlide === 5 && (
              <div className='question-container'>
                <div className='character'>
                  <span role="img" aria-label="Kid character" style={{ fontSize: '50px', marginRight: '15px' }}>
                    👦
                  </span>
                  <h3>Find the distance when speed is given!</h3>
                </div>
                <div className='question'>
                  <p>
                    A car travels at a speed of 40 meters per second for 3 seconds.
                    What distance does it cover?
                  </p>
                  <div className='formula'>
                    <p>Remember: Distance = Speed × Time</p>
                  </div>
                  <div className='ruler-container'>
                    <div className='ruler' ref={sliderRef}>
                      <div className='ruler-marks'>
                        {sliderOptions.map((value, index) => (
                          <div key={index} className='mark large'>
                            <span className='mark-label'>{value}m</span>
                          </div>
                        ))}
                      </div>
                      <div 
                        className='slider-handle' 
                        style={{ 
                          left: `${2 + sliderPosition * 0.9}%`,
                          transition: 'left 0.3s linear'
                        }}
                      />
                    </div>
                    <div className='slider-controls'>
                      <button 
                        className='arrow-button'
                        onClick={moveToPrevOption}
                        disabled={currentSliderValue === sliderOptions[0]}
                      >
                        ←
                      </button>
                      <button 
                        className='arrow-button'
                        onClick={moveToNextOption}
                        disabled={currentSliderValue === sliderOptions[sliderOptions.length - 1]}
                      >
                        →
                      </button>
                    </div>
                  </div>
                </div>
                <div className="continue-btn-container">
                  <button 
                    onClick={handleSliderContinue} 
                    className='continue-btn'
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {/* Page 6: Letter Drag Drop for RATE */}
            {currentSlide === 6 && (
              <div className='letter-drag-container'>
                <div className='character'>
                  <span role="img" aria-label="Teacher character" style={{ 
                    fontSize: '32px', 
                    marginRight: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '16px' }}>🎓</span>
                    <span>🦊</span>
                    <span style={{ fontSize: '16px' }}>📚</span>
                  </span>
                  <h3 style={{ 
                    color: '#1cb0f6',
                    fontSize: '16px',
                    background: '#f0f8ff',
                    padding: '8px',
                    borderRadius: '10px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    marginLeft: '8px',
                    flex: 1,
                    lineHeight: '1.3'
                  }}>
                    Form the word that means "How fast something moves"
                  </h3>
                </div>
                <div className='word-container' style={{
                  background: 'linear-gradient(145deg, #f0f8ff, #e6f3ff)',
                  padding: '20px',
                  borderRadius: '15px',
                  boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.1)'
                }}>
                  {selectedLetters1.map((letter, index) => (
                    <div key={index} className='letter-box filled' style={{
                      animation: 'pop 0.3s ease-out'
                    }}>
                      {letter}
                    </div>
                  ))}
                  {Array.from({ length: 4 - selectedLetters1.length }).map(
                    (_, index) => (
                      <div key={index} className='letter-box' style={{
                        borderStyle: 'dashed'
                      }}></div>
                    )
                  )}
                </div>
                <div className='letters' style={{
                  marginTop: '25px'
                }}>
                  {rateLetters.map((letter, index) => (
                    <div
                      key={index}
                      className='letter'
                      onClick={() => handleLetterDrag(letter, index, 1)}
                      style={{
                        background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                        transform: 'translateY(0)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: '#1cb0f6'
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div className="continue-btn-container">
                  <button
                    onClick={nextSlide}
                    className='continue-btn'
                    disabled={selectedLetters1.length !== 4 || selectedLetters1.join('') !== 'RATE'}
                    style={{
                      background: selectedLetters1.length === 4 && selectedLetters1.join('') === 'RATE' 
                        ? 'linear-gradient(145deg, #58cc02, #4caf02)'
                        : '#cccccc',
                      transform: 'translateY(0)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Continue {selectedLetters1.length === 4 && selectedLetters1.join('') === 'RATE' ? '🎉' : ''}
                  </button>
                </div>
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