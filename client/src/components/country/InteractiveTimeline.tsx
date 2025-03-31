import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '@/types';
import { formatDate, getEventBadgeColor, getEventDotColor, getEventIcon } from '@/lib/helpers';

interface InteractiveTimelineProps {
  events: TimelineEvent[];
}

const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  
  // Get unique event types
  const eventTypes = Array.from(new Set(events.map(event => event.eventType)));
  
  // Sort events by date (most recent first)
  const sortedEvents = [...events].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  // Filter events by type if a filter is selected
  const filteredEvents = filterType 
    ? sortedEvents.filter(event => event.eventType === filterType)
    : sortedEvents;

  return (
    <div className="space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-gray-600 font-medium">Filter by:</span>
        <button 
          className={`px-3 py-1 rounded-full text-sm transition-colors ${
            filterType === null 
              ? 'bg-primary text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
          onClick={() => setFilterType(null)}
        >
          All Events
        </button>
        
        {eventTypes.map(type => (
          <button 
            key={type}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              filterType === type 
                ? 'bg-primary text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            onClick={() => setFilterType(type)}
          >
            {type}
          </button>
        ))}
      </div>
      
      {/* Timeline Visualization */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
        
        {filteredEvents.map((event, index) => (
          <motion.div 
            key={event.id} 
            className="timeline-item relative pl-16 mb-10 last:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <div 
              className={`timeline-dot absolute left-0 w-10 h-10 rounded-full ${getEventDotColor(event.eventType)} 
                flex items-center justify-center text-white z-10 transition-transform 
                hover:scale-110`}
            >
              <i className={`fas ${getEventIcon(event.eventType)}`}></i>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm relative hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500">{formatDate(event.date)}</span>
                <span className={`${getEventBadgeColor(event.eventType)} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                  {event.eventType}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">
                {event.title}
              </h3>
              
              <p className="text-gray-600">{event.description}</p>
              
              {/* Adding relevant tags at the bottom for context without expanding */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {event.eventType === 'Election' && (
                  <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">Democratic Process</span>
                )}
                {event.eventType === 'Legislation' && (
                  <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium">Policy Change</span>
                )}
                {event.eventType === 'Agreement' && (
                  <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-xs font-medium">International Relations</span>
                )}
                {event.eventType === 'Protest' && (
                  <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-md text-xs font-medium">Civil Action</span>
                )}
                {event.eventType === 'War' && (
                  <span className="bg-red-50 text-red-700 px-2 py-1 rounded-md text-xs font-medium">Military Conflict</span>
                )}
                {event.eventType === 'Treaty' && (
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">Diplomatic Agreement</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredEvents.length === 0 && (
        <div className="text-center py-10 text-gray-500">
          No timeline events found for this filter. Try another category or view all events.
        </div>
      )}
    </div>
  );
};

export default InteractiveTimeline;