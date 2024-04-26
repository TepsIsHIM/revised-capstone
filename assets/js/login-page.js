document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");

  if (loginForm) {
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("psw");
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      showLoadingScreen();
      const email = emailInput.value;
      const password = passwordInput.value;

      try {
        const response = await fetch("/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
        if (!response.ok) {
          console.error('Error during login:', response.statusText);
          const errorData = await response.json();
          alert(errorData.error); 
          hideLoadingScreen();
          return;
        }

        const data = await response.json();

        if (data.accountType === 'Student') {
          window.location.href = '/StudentHomepage';
        } else if (data.accountType === 'Counselor') {
          window.location.href = '/CounselorHomepage';
        } else {
          console.error('Unknown account type:', data.accountType);
        }
      } catch (error) {
        console.error('Error during login:', error);
        hideLoadingScreen();
      }
    });
  }
});

function showLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "flex";
  }
}


function hideLoadingScreen() {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.style.display = "none";
  }
}
