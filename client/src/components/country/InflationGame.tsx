import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface InflationGameProps {
  countryName: string;
  currentInflation: string;
}

const InflationGame: React.FC<InflationGameProps> = ({ countryName, currentInflation }) => {
  // Parse the inflation rate from string to number (removing % sign)
  const initialInflation = parseFloat(currentInflation.replace('%', ''));
  
  // Game state
  const [gameStarted, setGameStarted] = useState(false);
  const [simulation, setSimulation] = useState({
    inflation: initialInflation,
    growth: 2.5,
    unemployment: 5.0,
    satisfaction: 70,
    year: 2023,
    round: 1,
    interestRate: 3.0, // Central bank interest rate
    govSpending: 3.0,   // Government spending level (scale of 1-5)
    taxRate: 3.0        // Tax rate level (scale of 1-5)
  });
  
  // Controls the speed of the simulation (updates every X milliseconds)
  const [simSpeed, setSimSpeed] = useState(2000);
  const [isRunning, setIsRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setIsRunning(true);
    setMessage("You're now in charge of managing inflation. Adjust the controls to keep the economy balanced.");
  };
  
  // Reset the game
  const resetGame = () => {
    setSimulation({
      inflation: initialInflation,
      growth: 2.5,
      unemployment: 5.0,
      satisfaction: 70,
      year: 2023,
      round: 1,
      interestRate: 3.0,
      govSpending: 3.0,
      taxRate: 3.0
    });
    setGameOver(false);
    setIsRunning(false);
    setMessage(null);
  };
  
  // Handle control changes
  const handleInterestRateChange = (value: number) => {
    setSimulation(prev => ({
      ...prev,
      interestRate: value
    }));
  };
  
  const handleGovSpendingChange = (value: number) => {
    setSimulation(prev => ({
      ...prev,
      govSpending: value
    }));
  };
  
  const handleTaxRateChange = (value: number) => {
    setSimulation(prev => ({
      ...prev,
      taxRate: value
    }));
  };
  
  // Simulate economic effects based on policy choices
  const updateEconomy = () => {
    if (!isRunning) return;
    
    setSimulation(prev => {
      // Interest rate effects
      // Higher interest rates reduce inflation but also slow growth and can increase unemployment
      const interestEffect = (prev.interestRate - 3) * 0.8;
      
      // Government spending effects
      // Higher spending increases growth and reduces unemployment but can increase inflation
      const spendingEffect = (prev.govSpending - 3) * 0.8;
      
      // Tax rate effects
      // Higher taxes reduce inflation and growth but can increase unemployment
      const taxEffect = (prev.taxRate - 3) * 0.8;
      
      // Calculate new values with some randomness
      const randomFactor = Math.random() * 0.6 - 0.3; // Random between -0.3 and 0.3
      
      let newInflation = prev.inflation - interestEffect + spendingEffect - taxEffect + randomFactor;
      newInflation = Math.max(0, Math.min(15, newInflation)); // Cap between 0-15%
      
      let newGrowth = prev.growth - interestEffect * 0.5 + spendingEffect - taxEffect * 0.5 + randomFactor;
      newGrowth = Math.max(-3, Math.min(7, newGrowth)); // Cap between -3% and 7%
      
      let newUnemployment = prev.unemployment + interestEffect * 0.3 - spendingEffect * 0.5 + taxEffect * 0.2 + randomFactor;
      newUnemployment = Math.max(2, Math.min(15, newUnemployment)); // Cap between 2-15%
      
      // Calculate public satisfaction based on economic indicators
      // People dislike high inflation, high unemployment, and negative growth
      const inflationWeight = newInflation > 5 ? (newInflation - 5) * 3 : 0;
      const unemploymentWeight = newUnemployment * 2;
      const growthWeight = newGrowth < 0 ? -newGrowth * 5 : 0;
      
      let newSatisfaction = 100 - inflationWeight - unemploymentWeight + (newGrowth * 3) - growthWeight;
      newSatisfaction = Math.max(0, Math.min(100, newSatisfaction));
      
      const newYear = prev.year + 1;
      const newRound = prev.round + 1;
      
      return {
        inflation: parseFloat(newInflation.toFixed(1)),
        growth: parseFloat(newGrowth.toFixed(1)),
        unemployment: parseFloat(newUnemployment.toFixed(1)),
        satisfaction: Math.round(newSatisfaction),
        year: newYear,
        round: newRound,
        interestRate: prev.interestRate,
        govSpending: prev.govSpending,
        taxRate: prev.taxRate
      };
    });
  };
  
  // Run simulation at regular intervals
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && !gameOver) {
      interval = setInterval(() => {
        updateEconomy();
      }, simSpeed);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, simSpeed, gameOver]);
  
  // Check for game over conditions
  useEffect(() => {
    if (simulation.round > 1) {
      // Check if economy is in crisis
      if (simulation.inflation > 12) {
        setMessage("Economy in hyperinflation! The central bank has taken over.");
        setGameOver(true);
        setIsRunning(false);
      } else if (simulation.unemployment > 12) {
        setMessage("Unemployment crisis has triggered social unrest!");
        setGameOver(true);
        setIsRunning(false);
      } else if (simulation.growth < -2 && simulation.round > 3) {
        setMessage("Severe recession! The economy needs new leadership.");
        setGameOver(true);
        setIsRunning(false);
      } else if (simulation.satisfaction < 20) {
        setMessage("Public dissatisfaction has led to a vote of no confidence!");
        setGameOver(true);
        setIsRunning(false);
      } else if (simulation.round > 10) {
        // Successfully managed 10 years
        setMessage("Congratulations! You've successfully managed the economy for a decade.");
        setGameOver(true);
        setIsRunning(false);
      }
      
      // Feedback messages
      else if (simulation.inflation < 2 && simulation.growth > 3) {
        setMessage("The economy is thriving with low inflation and strong growth!");
      } else if (simulation.inflation > 8) {
        setMessage("Warning: Inflation is getting out of control!");
      } else if (simulation.unemployment > 8) {
        setMessage("Warning: Unemployment is rising to concerning levels!");
      } else if (simulation.growth < 0) {
        setMessage("The economy has entered a recession. Take action!");
      } else {
        setMessage(null);
      }
    }
  }, [simulation]);
  
  // Get status colors based on values
  const getInflationColor = (value: number) => {
    if (value < 2) return 'text-green-500';
    if (value < 5) return 'text-blue-500';
    if (value < 8) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getGrowthColor = (value: number) => {
    if (value > 4) return 'text-green-500';
    if (value > 2) return 'text-blue-500';
    if (value >= 0) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getUnemploymentColor = (value: number) => {
    if (value < 4) return 'text-green-500';
    if (value < 6) return 'text-blue-500';
    if (value < 9) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const getSatisfactionColor = (value: number) => {
    if (value > 75) return 'text-green-500';
    if (value > 50) return 'text-blue-500';
    if (value > 30) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-gradient-to-br from-blue-600/10 via-primary/5 to-purple-600/10 p-6 rounded-lg shadow-sm border-2 border-primary/20">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-primary">
        <i className="fas fa-gamepad"></i>
        Inflation Management Simulation
      </h3>
      <p className="text-gray-600 mb-6">
        Take control of {countryName}'s economy as the economic policy chief. 
        Can you maintain healthy inflation while balancing growth and employment?
      </p>
      
      {!gameStarted ? (
        <div className="text-center py-6">
          <motion.button
            className="bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={startGame}
          >
            Start Simulation
          </motion.button>
          
          <div className="mt-6 bg-blue-50 p-4 rounded-lg text-left">
            <h4 className="font-medium mb-2">How to Play:</h4>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Adjust interest rates, government spending, and tax rates</li>
              <li>Balance inflation, economic growth, and unemployment</li>
              <li>Keep public satisfaction high</li>
              <li>Manage the economy for 10 years successfully to win</li>
            </ul>
          </div>
        </div>
      ) : (
        <div>
          {/* Economic Indicators Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-3 rounded-lg text-center shadow-sm border-t-4 border-blue-500">
              <div className="flex justify-center mb-1">
                <i className="fas fa-percentage text-blue-500"></i>
              </div>
              <h5 className="text-sm text-gray-500 mb-1">Inflation</h5>
              <p className={`text-2xl font-bold ${getInflationColor(simulation.inflation)}`}>
                {simulation.inflation}%
              </p>
              <p className="text-xs text-gray-500">Target: 2-3%</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm border-t-4 border-green-500">
              <div className="flex justify-center mb-1">
                <i className="fas fa-chart-line text-green-500"></i>
              </div>
              <h5 className="text-sm text-gray-500 mb-1">Growth</h5>
              <p className={`text-2xl font-bold ${getGrowthColor(simulation.growth)}`}>
                {simulation.growth}%
              </p>
              <p className="text-xs text-gray-500">Target: 2-4%</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm border-t-4 border-red-500">
              <div className="flex justify-center mb-1">
                <i className="fas fa-user-tie text-red-500"></i>
              </div>
              <h5 className="text-sm text-gray-500 mb-1">Unemployment</h5>
              <p className={`text-2xl font-bold ${getUnemploymentColor(simulation.unemployment)}`}>
                {simulation.unemployment}%
              </p>
              <p className="text-xs text-gray-500">Target: &lt;5%</p>
            </div>
            
            <div className="bg-white p-3 rounded-lg text-center shadow-sm border-t-4 border-purple-500">
              <div className="flex justify-center mb-1">
                <i className="fas fa-thumbs-up text-purple-500"></i>
              </div>
              <h5 className="text-sm text-gray-500 mb-1">Public Opinion</h5>
              <p className={`text-2xl font-bold ${getSatisfactionColor(simulation.satisfaction)}`}>
                {simulation.satisfaction}%
              </p>
              <p className="text-xs text-gray-500">Year: {simulation.year}</p>
            </div>
          </div>
          
          {/* Message Area */}
          {message && (
            <motion.div 
              className="mb-6 p-3 rounded-lg bg-blue-50 text-blue-800"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p>{message}</p>
            </motion.div>
          )}
          
          {/* Policy Controls */}
          {!gameOver && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-blue-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                    <i className="fas fa-university text-blue-500"></i>
                  </div>
                  <div className="flex-grow">
                    <h5 className="font-medium">Interest Rate</h5>
                  </div>
                  <span className="text-sm font-bold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">
                    {simulation.interestRate}%
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="0.5" 
                  value={simulation.interestRate}
                  onChange={(e) => handleInterestRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(simulation.interestRate - 1) * 25}%, #dbeafe ${(simulation.interestRate - 1) * 25}%, #dbeafe 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-blue-50 p-2 rounded">
                  Higher rates reduce inflation but slow growth.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-2">
                    <i className="fas fa-money-bill-wave text-green-500"></i>
                  </div>
                  <div className="flex-grow">
                    <h5 className="font-medium">Government Spending</h5>
                  </div>
                  <span className="text-sm font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full">
                    {simulation.govSpending < 3 ? 'Low' : simulation.govSpending === 3 ? 'Moderate' : 'High'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="0.5" 
                  value={simulation.govSpending}
                  onChange={(e) => handleGovSpendingChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(simulation.govSpending - 1) * 25}%, #dcfce7 ${(simulation.govSpending - 1) * 25}%, #dcfce7 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-green-50 p-2 rounded">
                  Higher spending stimulates growth but may increase inflation.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-amber-100">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center mr-2">
                    <i className="fas fa-hand-holding-usd text-amber-500"></i>
                  </div>
                  <div className="flex-grow">
                    <h5 className="font-medium">Taxation</h5>
                  </div>
                  <span className="text-sm font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
                    {simulation.taxRate < 3 ? 'Low' : simulation.taxRate === 3 ? 'Moderate' : 'High'}
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  step="0.5" 
                  value={simulation.taxRate}
                  onChange={(e) => handleTaxRateChange(parseFloat(e.target.value))}
                  className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${(simulation.taxRate - 1) * 25}%, #fef3c7 ${(simulation.taxRate - 1) * 25}%, #fef3c7 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Low</span>
                  <span>High</span>
                </div>
                <p className="text-xs text-gray-500 mt-2 bg-amber-50 p-2 rounded">
                  Higher taxes can reduce inflation but may slow growth.
                </p>
              </div>
            </div>
          )}
          
          {/* Game Controls */}
          <div className="flex justify-between bg-white p-3 rounded-lg shadow-sm border border-primary/20">
            <div className="flex gap-3">
              {!gameOver && (
                <button
                  className={`px-4 py-2 rounded-lg font-medium shadow-sm ${
                    isRunning 
                      ? 'bg-amber-100 text-amber-700 hover:bg-amber-200 border border-amber-200' 
                      : 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
                  } transition-colors`}
                  onClick={() => setIsRunning(!isRunning)}
                >
                  {isRunning ? (
                    <><i className="fas fa-pause mr-1"></i> Pause</>
                  ) : (
                    <><i className="fas fa-play mr-1"></i> Resume</>
                  )}
                </button>
              )}
              
              {!isRunning && (
                <button
                  className="px-4 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors shadow-sm border border-blue-200"
                  onClick={resetGame}
                >
                  <i className="fas fa-redo mr-1"></i> Reset
                </button>
              )}
            </div>
            
            {!gameOver && isRunning && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg">
                <span className="text-sm text-gray-600 font-medium">Speed:</span>
                <button 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${simSpeed === 3000 ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                  onClick={() => setSimSpeed(3000)}
                >
                  1x
                </button>
                <button 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${simSpeed === 2000 ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                  onClick={() => setSimSpeed(2000)}
                >
                  2x
                </button>
                <button 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${simSpeed === 1000 ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200'}`}
                  onClick={() => setSimSpeed(1000)}
                >
                  3x
                </button>
              </div>
            )}
          </div>
          
          {/* Game Over Screen */}
          {gameOver && (
            <motion.div 
              className="mt-6 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg text-center shadow-sm border-2 border-primary/30"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-16 h-16 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
                <i className="fas fa-trophy text-primary text-2xl"></i>
              </div>
              <h4 className="font-bold text-xl mb-2 text-primary">Simulation Complete</h4>
              <p className="mb-4">{message}</p>
              <button
                className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
                onClick={resetGame}
              >
                Try Again
              </button>
            </motion.div>
          )}
          
          {/* Educational Info */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg text-left shadow-sm border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <i className="fas fa-lightbulb text-blue-500"></i>
              </div>
              <div>
                <h4 className="font-semibold mb-2 text-blue-700">About Inflation Management:</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Inflation occurs when prices rise across the economy. Central banks like the Federal Reserve 
                  use interest rates as their primary tool to control inflation. Higher interest rates make borrowing 
                  more expensive, which slows spending and cools the economy.
                </p>
                <p className="text-sm text-gray-600">
                  However, controlling inflation often involves tradeoffs with other economic goals like growth and 
                  employment - this is known as the "policy trilemma" in economics.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InflationGame;