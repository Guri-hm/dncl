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

fetch('https://solopg.com/next/dncltest/api/lint', {
    method: 'OPTIONS'
})
    .then(response => console.log('Status:', response.status))
    .catch(error => console.error('Error:', error));