import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '@/types';
import { formatDate, getEventBadgeColor, getEventDotColor, getEventIcon } from '@/lib/helpers';

interface InteractiveTimelineProps {
  events: TimelineEvent[];
}

const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ events }) => {
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);
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
                flex items-center justify-center text-white z-10 cursor-pointer transition-transform 
                hover:scale-110`}
              onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}
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
              
              <h3 className="font-bold text-lg mb-2 cursor-pointer flex items-center" onClick={() => setExpandedEvent(expandedEvent === event.id ? null : event.id)}>
                {event.title}
                <i className={`fas fa-chevron-${expandedEvent === event.id ? 'up' : 'down'} ml-2 text-sm text-gray-400`}></i>
              </h3>
              
              <p className="text-gray-600">{event.description}</p>
              
              {/* Expanded content when clicked */}
              {expandedEvent === event.id && (
                <motion.div 
                  className="mt-4 pt-4 border-t border-gray-100"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 text-gray-500">KEY FIGURES</h4>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-user text-blue-500"></i>
                        </div>
                        <span>Key Political Figure</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <i className="fas fa-landmark text-green-500"></i>
                        </div>
                        <span>Relevant Institution</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-sm mb-2 text-gray-500">IMPACT</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-500"></i>
                          <span className="text-sm">Positive outcome 1</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-check-circle text-green-500"></i>
                          <span className="text-sm">Positive outcome 2</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <i className="fas fa-times-circle text-red-500"></i>
                          <span className="text-sm">Negative consequence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between">
                    <div className="flex items-center gap-2">
                      <i className="fas fa-newspaper text-gray-400"></i>
                      <span className="text-sm text-gray-500">News Sources</span>
                    </div>
                    <button className="text-primary text-sm hover:underline">
                      Learn More
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Interactive Education Element */}
      <motion.div 
        className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-primary mt-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <h3 className="font-bold text-lg mb-3">Did You Know?</h3>
        <p className="text-gray-600 mb-4">
          Political events can have long-lasting impacts on a country's development. 
          Elections, legislation, and international agreements shape the future direction of a nation.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Test Your Knowledge</h4>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
              Which type of event typically occurs every 4-5 years in democracies?
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
              What's the purpose of international agreements between countries?
            </button>
            <button className="w-full text-left p-3 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 transition-colors">
              How can citizens influence political decisions between elections?
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InteractiveTimeline;