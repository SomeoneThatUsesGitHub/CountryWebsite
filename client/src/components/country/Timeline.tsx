import React from 'react';
import { TimelineEvent } from '@/types';
import { formatDate, getEventBadgeColor, getEventDotColor, getEventIcon } from '@/lib/helpers';
import { motion } from 'framer-motion';

interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-8">
      {sortedEvents.map((event, index) => (
        <motion.div 
          key={event.id} 
          className="timeline-item relative pl-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div 
            className={`timeline-dot absolute left-0 w-10 h-10 rounded-full ${getEventDotColor(event.eventType)} flex items-center justify-center text-white`}
          >
            <i className={`fas ${getEventIcon(event.eventType)}`}></i>
          </div>
          
          <div className="bg-white p-5 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
              <span className={`${getEventBadgeColor(event.eventType)} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                {event.eventType}
              </span>
            </div>
            
            <h3 className="font-bold text-lg mb-2">{event.title}</h3>
            <p className="text-gray-600">{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default Timeline;
