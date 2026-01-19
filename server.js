import { create, router as _router, defaults } from 'json-server';
import cors from 'cors';

const server = create();
const router = _router('db.json');
const middlewares = defaults();
const port = process.env.PORT || 3001;

// Enable CORS
server.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add delay to simulate real API
server.use((req, res, next) => {
  setTimeout(next, 500);
});

// Use default middlewares and router
server.use(middlewares);
server.use(router);

// Start server
server.listen(port, () => {
  console.log(`JSON Server is running on port ${port}`);
  console.log('Available endpoints:');
  console.log(`- http://localhost:${port}/users`);
  console.log(`- http://localhost:${port}/habits`);
  console.log(`- http://localhost:${port}/tasks`);
});
