document.getElementById('logout').addEventListener('click', async function(e) {
  try {
    const res = await fetch('/logout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    const json = await res.json();

    if (json.status === 200) {
      // Clear local storage or any client-side data if needed
      window.localStorage.clear();
      window.sessionStorage.clear();
 // Redirect to the login page
 window.location.href = '/';
    } else {
      console.error('Logout failed:', json.error);
      // Handle error or display a message to the user
    }
  } catch (error) {
    console.error('Unexpected error during logout:', error);
    // Handle unexpected errors or display a generic error message
  }
});
