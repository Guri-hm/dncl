// a = b;

fetch('https://solopg.com/next/dncltest/api/lint', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: 'a = b;' })
})
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));

fetch('https://solopg.com/next/dncl/api/lint', {
    method: 'OPTIONS'
})
    .then(response => console.log('Status:', response.status))
    .catch(error => console.error('Error:', error));


// POSTリクエスト（コード実行）
fetch('https://solopg.com/next/dncl/api/execute', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ code: 'console.log("Hello DNCL!");' })
})
    .then(response => response.json())
    .then(data => console.log('POST result:', data))
    .catch(error => console.error('POST error:', error));

// OPTIONSリクエスト（CORSプリフライト確認）
fetch('https://solopg.com/next/dncl/api/execute', {
    method: 'OPTIONS'
})
    .then(response => console.log('OPTIONS status:', response.status))
    .catch(error => console.error('OPTIONS error:', error));