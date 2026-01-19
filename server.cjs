// @ts-ignore - json-server doesn't have type definitions
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const port = 3001;

// Enable CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  next();
});

// Handle preflight requests
server.options('*', (req, res) => {
  res.sendStatus(200);
});

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Add custom routes before JSON Server router
server.use((req, res, next) => {
  if (req.method === 'POST') {
    // Add createdAt timestamp for new items
    if (req.body && !req.body.createdAt) {
      req.body.createdAt = new Date().toISOString();
    }
    // Add ID for new items if not provided - use sequential numbering
    if (req.body && !req.body.id) {
      const db = router.db; // Get the lowdb instance
      const collection = req.path.substring(1); // Remove leading slash to get collection name

      if (db && db.get) {
        const items = db.get(collection).value() || [];

        // Find the highest numeric ID
        let maxId = 0;
        items.forEach(item => {
          const numId = parseInt(item.id);
          if (!isNaN(numId) && numId > maxId) {
            maxId = numId;
          }
        });

        // Set new ID as maxId + 1
        req.body.id = (maxId + 1).toString();
      } else {
        // Fallback to timestamp if db is not available
        req.body.id = Date.now().toString();
      }
    }
  }
  next();
});

// Use default router
server.use(router);

server.listen(port, () => {
  console.log(`JSON Server is running on http://localhost:${port}`);
  console.log('Available endpoints:');
  console.log(`- Users: http://localhost:${port}/users`);
  console.log(`- Habits: http://localhost:${port}/habits`);
  console.log(`- Tasks: http://localhost:${port}/tasks`);
});
