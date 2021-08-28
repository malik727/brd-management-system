const http = require('http');
const https = require('https');


module.exports.getJSON = (options, onResult) => {
    const port = options.port == 443 ? https : http;
    let output = '';
    const req = port.request(options, (res) => {
        console.log(`${options.host} : ${res.statusCode}`);
        res.setEncoding('utf8');
    
        res.on('data', (chunk) => {
            output += chunk;
        });
    
        res.on('end', () => {
            let obj = JSON.parse(output);
    
            onResult(res.statusCode, obj);
        });
    });
  
    req.on('error', (err) => {
        // Error Message Logging
    });
  
    req.end();
};