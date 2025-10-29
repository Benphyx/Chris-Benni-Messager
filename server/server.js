// This is a blueprint for your backend server.
// You would run this on a hosting platform like Render, Heroku, etc.
// To run it locally:
// 1. Make sure you have Node.js installed.
// 2. In your terminal, run `npm install ws`.
// 3. Run `node server/server.js`.

const { WebSocketServer } = require('ws');
const http = require('http');
const url = require('url');

// Use the PORT environment variable provided by Render, with a fallback for local development.
const PORT = process.env.PORT || 8080;

// Create a simple HTTP server to handle health checks from Render.
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

// Attach the WebSocket server to the HTTP server.
const wss = new WebSocketServer({ server });

// In a real application, you would use a proper database (e.g., PostgreSQL, Redis).
// For this example, we'll store messages in memory.
const messageHistory = {}; 
const clients = new Map(); // Map<userId, WebSocket>

wss.on('connection', (ws, req) => {
  // Extract userId from the connection URL, e.g., ws://localhost:8080?userId=user-1
  const { query } = url.parse(req.url, true);
  const userId = query.userId;

  if (!userId) {
    console.log('Connection rejected: No userId provided.');
    ws.close();
    return;
  }
  
  clients.set(userId, ws);
  console.log(`Client connected: ${userId}`);

  // Send existing message history to the newly connected client
  const userMessages = {};
  for(const chatKey in messageHistory) {
      if(chatKey.includes(userId)){
        userMessages[chatKey] = messageHistory[chatKey];
      }
  }

  ws.send(JSON.stringify({
    type: 'initialMessages',
    payload: userMessages
  }));


  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'sendMessage') {
        const { message: msg, recipientId } = data.payload;
        const chatKey = msg.chatKey;

        // Store the message
        if (!messageHistory[chatKey]) {
          messageHistory[chatKey] = [];
        }
        messageHistory[chatKey].push(msg);
        
        // Forward the message to the recipient if they are online
        const recipientSocket = clients.get(recipientId);
        if (recipientSocket && recipientSocket.readyState === recipientSocket.OPEN) {
          recipientSocket.send(JSON.stringify({ type: 'newMessage', payload: msg }));
          console.log(`Message forwarded from ${msg.senderId} to ${recipientId}`);
        } else {
            console.log(`Recipient ${recipientId} is not online. Message stored.`);
        }

        // Also send the message back to the sender to confirm it was processed
        const senderSocket = clients.get(msg.senderId);
        if(senderSocket && senderSocket.readyState === senderSocket.OPEN) {
            // (Optional) You could add a confirmation message type here
        }
      }
    } catch (e) {
      console.error('Failed to process message:', e);
    }
  });

  ws.on('close', () => {
    // Find the userId for the closing socket and remove it
    for (let [id, socket] of clients.entries()) {
        if (socket === ws) {
            clients.delete(id);
            console.log(`Client disconnected: ${id}`);
            break;
        }
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Start the HTTP server, which in turn starts the WebSocket server.
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
