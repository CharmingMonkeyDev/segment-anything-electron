document.addEventListener("DOMContentLoaded", async () => {
  const loginPopup = document.getElementById("login-popup");
  const signupButton = document.getElementById("signup-button");
  const loginButton = document.getElementById("login-button");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const togglePasswordButton = document.getElementById("toggle-password");
  const errorMessage = document.getElementById("error-message");

  const user = localStorage.getItem("user");
  const session = localStorage.getItem("session");

  if (session) {
    try {
      const sessionData = JSON.parse(session);
      const accessToken = sessionData.access_token;

      const result = await window.electronAPI.verifySession(accessToken);
      if (result.success && result.data.length > 0 && result.data[0].id) {
        loginPopup.style.display = "none";
        console.log("isloggedinSuccessful");
        return; // Exit the function as no further action is needed
      }
    } catch (error) {
      console.error("Error verifying session:", error);
      loginPopup.style.display = "flex";
    }
  }
  loginPopup.style.display = "flex";

  togglePasswordButton.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePasswordButton.textContent = "Hide";
    } else {
      passwordInput.type = "password";
      togglePasswordButton.textContent = "Show";
    }
  });

  loginButton.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    errorMessage.style.display = "none";
    try {
      const result = await window.electronAPI.authenticateUser({
        email,
        password,
      });
      if (result.success && result.data.user !== null) {
        localStorage.setItem("user", JSON.stringify(result.data.user));
        localStorage.setItem("session", JSON.stringify(result.data.session));
        loginPopup.style.display = "none";
      } else {
        errorMessage.textContent = "Email or password is incorrect";
        errorMessage.style.display = "block";
      }
    } catch (error) {
      console.log(error);
      errorMessage.textContent = "An error occurred. Please try again.";
      errorMessage.style.display = "block";
    }
  });

  signupButton.addEventListener("click", () => {
    window.open("https://www.yusha.ai/", "_blank");
  });
});
