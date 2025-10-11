// Shared event system for triggering calendar refreshes across components
class RefreshEventManager {
    constructor() {
        this.listeners = [];
    }

    // Add a listener for refresh events
    addListener(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(listener => listener !== callback);
        };
    }

    // Trigger a refresh event
    triggerRefresh(source = 'manual') {
        console.log(`Refresh triggered from: ${source}`);
        this.listeners.forEach(callback => {
            try {
                callback({ source, timestamp: Date.now() });
            } catch (error) {
                console.error('Error in refresh listener:', error);
            }
        });
    }

    // Trigger refresh with event details
    triggerEventUpdate(eventId, eventType = 'update', source = 'manual') {
        console.log(`Event ${eventType} triggered for event ${eventId} from: ${source}`);
        this.listeners.forEach(callback => {
            try {
                callback({ 
                    eventId, 
                    eventType, 
                    source, 
                    timestamp: Date.now() 
                });
            } catch (error) {
                console.error('Error in event update listener:', error);
            }
        });
    }
}

// Create a singleton instance
const refreshEventManager = new RefreshEventManager();

export default refreshEventManager;
