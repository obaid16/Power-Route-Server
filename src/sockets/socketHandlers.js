module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join a specific room (e.g., for live tracking of a specific trip)
    socket.on('join_tracking', (tripId) => {
      socket.join(tripId);
      console.log(`Socket ${socket.id} joined tracking room: ${tripId}`);
    });

    // Handle live location updates
    socket.on('location_update', (data) => {
      // Broadcast to everyone in the trip room except sender
      socket.to(data.tripId).emit('new_location', data);
    });

    // Handle emergency SOS
    socket.on('emergency_sos', (data) => {
      console.log('🚨 EMERGENCY SOS TRIGGERED', data);
      // Broadcast to admins or specific safety room
      io.emit('emergency_alert', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnected: ${socket.id}`);
    });
  });
};
