const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://monkey:MonkeyPass123@127.0.0.1:5432/monkey_db?schema=public'
});

client.connect()
  .then(() => {
    console.log('Connected successfully!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error:', err.stack);
    process.exit(1);
  });
