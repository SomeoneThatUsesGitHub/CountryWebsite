import React from 'react';
import { motion } from 'framer-motion';
import { EconomicData } from '@/types';

interface EconomyProps {
  countryName: string;
  economicData?: EconomicData;
}

const Economy: React.FC<EconomyProps> = ({ countryName, economicData }) => {
  return (
    <motion.div 
      className="flex items-center justify-center h-64 bg-gray-100 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <p className="text-gray-500 text-lg">Economy content has been removed</p>
    </motion.div>
  );
};

export default Economy;
