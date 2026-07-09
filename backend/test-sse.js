const fs = require('fs');
const http = require('http');

const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
const fileContent = fs.readFileSync('sample.csv');

let body = '--' + boundary + '\r\n';
body += 'Content-Disposition: form-data; name="file"; filename="sample.csv"\r\n';
body += 'Content-Type: text/csv\r\n\r\n';
body += fileContent.toString('utf-8') + '\r\n';
body += '--' + boundary + '--\r\n';

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/v1/import/extract',
  method: 'POST',
  headers: {
    'Content-Type': 'multipart/form-data; boundary=' + boundary,
    'Content-Length': Buffer.byteLength(body),
    'Accept': 'text/event-stream'
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
  
  res.on('data', (chunk) => {
    console.log(`\n--- CHUNK RECEIVED AT ${new Date().toISOString()} (${chunk.length} bytes) ---`);
    console.log(chunk.toString('utf8').substring(0, 200) + '...');
  });
  
  res.on('end', () => {
    console.log('No more data in response.');
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(body);
req.end();
