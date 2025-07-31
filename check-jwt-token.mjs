// Decode JWT token to check expiration
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI0MzMxNzcsImV4cCI6MjAzODAwOTE3N30.YI1RxpjqToyqY9Dj12fqEP2V3G6d2j8QZA2xj8TcTBg'

// Parse JWT without verification (just to see the payload)
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Error parsing JWT:', e);
    return null;
  }
}

const payload = parseJwt(token);
console.log('JWT Payload:', JSON.stringify(payload, null, 2));

if (payload) {
  console.log('\n📅 Token Details:');
  console.log('Issued at:', new Date(payload.iat * 1000).toLocaleString());
  console.log('Expires at:', new Date(payload.exp * 1000).toLocaleString());
  console.log('Project ref:', payload.ref);
  console.log('Role:', payload.role);
  
  const now = Date.now() / 1000;
  if (payload.exp < now) {
    console.log('\n❌ Token has EXPIRED!');
  } else {
    console.log('\n✅ Token is still valid');
    console.log(`Expires in ${Math.floor((payload.exp - now) / 86400)} days`);
  }
}
