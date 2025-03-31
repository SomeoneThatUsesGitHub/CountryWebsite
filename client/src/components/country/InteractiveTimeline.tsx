import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TimelineEvent } from '@/types';
import { formatDate, getEventBadgeColor, getEventDotColor, getEventIcon, extractKeyword } from '@/lib/helpers';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface InteractiveTimelineProps {
  events: TimelineEvent[];
}

const InteractiveTimeline: React.FC<InteractiveTimelineProps> = ({ events }) => {
  const [filterType, setFilterType] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  
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

  // Determine if description is long enough to need the "read more" button on mobile
  const isDescriptionLong = (desc: string) => {
    return desc && desc.length > 150;
  };
  
  // Truncated description for mobile view
  const getTruncatedDescription = (desc: string) => {
    if (!desc || !isDescriptionLong(desc)) return desc;
    return `${desc.substring(0, 147)}...`;
  };
  
  // Check if we're on a mobile device
  const isMobile = () => {
    return window.innerWidth < 768;
  };

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
              className={`timeline-dot absolute left-0 w-10 h-10 ${getEventDotColor(event.eventType)} 
                flex items-center justify-center text-white z-10 transition-all duration-300
                hover:scale-110 hover:rotate-12 transform`}
              style={{clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"}}
            >
              <i className={`fas ${getEventIcon(event.eventType, event.icon)}`}></i>
            </div>
            
            <div className="bg-white p-5 rounded-lg shadow-sm relative transition-all duration-300 
                transform hover:-translate-y-1 hover:shadow-md">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-gray-500 font-medium">{formatDate(event.date)}</span>
                <span className={`${getEventBadgeColor(event.eventType)} text-xs font-medium px-2.5 py-0.5 rounded-full`}>
                  {event.eventType}
                </span>
              </div>
              
              <h3 className="font-bold text-lg mb-2">
                {event.title}
              </h3>
              
              {/* Description with read more functionality on mobile */}
              <div className="text-gray-600">
                {isMobile() && isDescriptionLong(event.description) ? (
                  <>
                    <p>{getTruncatedDescription(event.description)}</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="mt-1 p-0 h-auto text-sm text-primary hover:text-primary/80 font-medium"
                      onClick={() => setSelectedEvent(event)}
                    >
                      Read more
                    </Button>
                  </>
                ) : (
                  <p>{event.description}</p>
                )}
              </div>
              
              {/* AI-powered contextual analysis for tags */}
              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                {event.description && extractKeyword(event.description).map((tag, tagIndex) => (
                  <span 
                    key={`${event.id}-tag-${tagIndex}`}
                    className={`${getEventBadgeColor(event.eventType)} px-3 py-1.5 rounded-full text-xs font-medium shadow-sm transition-transform duration-300 hover:scale-105 capitalize flex items-center gap-1.5`}
                  >
                    <i className={`fas fa-tag text-xs opacity-70`}></i>
                    {tag}
                  </span>
                ))}
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

      {/* Modal for reading full text on mobile */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </DialogHeader>
          <div className="space-y-3">
            <p className="text-gray-500 text-sm">{selectedEvent?.date ? formatDate(selectedEvent.date) : ''}</p>
            <p className="text-gray-700">{selectedEvent?.description}</p>
            
            {/* Display tags in modal too */}
            {selectedEvent?.description && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-100">
                {extractKeyword(selectedEvent.description).map((tag, tagIndex) => (
                  <span 
                    key={`modal-tag-${tagIndex}`}
                    className={`${getEventBadgeColor(selectedEvent.eventType || '')} px-3 py-1.5 rounded-full text-xs font-medium capitalize flex items-center gap-1.5`}
                  >
                    <i className={`fas fa-tag text-xs opacity-70`}></i>
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveTimeline;