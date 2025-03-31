import React from 'react';
import { motion } from 'framer-motion';

interface GovernmentProps {
  countryName: string;
  governmentData?: {
    type: 'Democracy' | 'Republic' | 'Monarchy' | 'Authoritarian' | 'Totalitarian' | 'Other';
    details: string;
    freedomIndex?: number; // 0-100, higher is more free
    electionSystem?: string;
  };
}

const GovernmentSystem: React.FC<GovernmentProps> = ({ 
  countryName,
  governmentData
}) => {
  return (
    <motion.div 
      className="flex items-center justify-center h-64 bg-gray-100 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-gray-500 text-lg">Political System content has been removed</p>
    </motion.div>
  );
};

export default GovernmentSystem;