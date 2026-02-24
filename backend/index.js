const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World! Bam!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}!`);
});