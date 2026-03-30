/**
 * resvaspot/js/auth.js
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 * Sign-in / Sign-up form handler.
 * Connects to POST /api/auth/login and /api/auth/register.
 * Original UI logic (validation, toggle, field states) preserved.
 * –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
 */

// –– Sign-in form –––––––––––––––––––––––––––––––––––––––––––––––
const signinForm = document.querySelector("#signinForm");

if (signinForm) {
  const emailInput    = document.querySelector("#email");
  const passwordInput = document.querySelector("#password");
  const emailError    = document.querySelector("#emailError");
  const passwordError = document.querySelector("#passwordError");
  const formMessage   = document.querySelector("#formMessage");
  const passwordToggle= document.querySelector("#passwordToggle");

  // Current auth mode – sign-in by default, toggled by tab buttons
  let currentMode = "signin";

  // Tab toggle (Sign In â†” Sign Up) – works if tabs exist in HTML
  const switchAuthMode = (mode) => {
    currentMode = mode;
    document.querySelectorAll("[data-auth-tab]").forEach((b) =>
      b.classList.toggle("active", b.dataset.authTab === currentMode)
    );
    const submitBtn = signinForm.querySelector("button[type='submit']");
    if (submitBtn) submitBtn.textContent = currentMode === "signin" ? "Sign In" : "Create Account";

    const nameField = document.querySelector("#nameFieldGroup");
    if (nameField) {
      nameField.style.display = currentMode === "signin" ? "none" : "flex";
    }

    const roleField = document.querySelector("#roleFieldGroup");
    if (roleField) {
      roleField.style.display = currentMode === "signin" ? "none" : "block";
    }

    const headerTitle = document.querySelector(".auth-header-block h2");
    const headerCopy  = document.querySelector(".auth-header-block .auth-copy");
    if (headerTitle) {
      headerTitle.textContent = currentMode === "signin" ? "Sign in to your account" : "Create an account";
    }
    if (headerCopy) {
      headerCopy.textContent = currentMode === "signin" 
        ? "Manage bookings, orders, and provider conversations from one clean Resvaspot workspace."
        : "Join Resvaspot to book trusted services and products on campus.";
    }

    const switchText = document.querySelector("#authSwitchText");
    const switchBtn  = document.querySelector("#authSwitchBtn");
    if (switchText && switchBtn) {
      switchText.textContent = currentMode === "signin" ? "Don't have an account yet?" : "Already have an account?";
      switchBtn.textContent  = currentMode === "signin" ? "Create an account" : "Sign in";
    }
  };

  document.querySelectorAll("[data-auth-tab]").forEach((btn) => {
    btn.addEventListener("click", () => switchAuthMode(btn.dataset.authTab));
  });

  const authSwitchBtn = document.querySelector("#authSwitchBtn");
  if (authSwitchBtn) {
    authSwitchBtn.addEventListener("click", () => {
      switchAuthMode(currentMode === "signin" ? "signup" : "signin");
    });
  }

  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = window.rvAuth.sanitizeReturnTo(urlParams.get("returnTo") || "");

  // Handle mode from URL
  if (urlParams.get("mode") === "signup") {
    switchAuthMode("signup");
  }

  // –– Validation (identical to original logic) –––––––––––––––
  const setFieldState = (input, errorElement, message) => {
    if (!input || !errorElement) return;
    errorElement.textContent = message;
    input.classList.toggle("invalid", Boolean(message));
  };

  const validateEmail = () => {
    const value = emailInput?.value.trim();
    if (!value) return "Email is required.";
    if (!/^\S+@\S+\.\S+$/.test(value)) return "Enter a valid email address.";
    return "";
  };

  const validatePassword = () => {
    const value = passwordInput?.value.trim();
    if (!value) return "Password is required.";
    if (value.length < 6) return "Password must be at least 6 characters.";
    return "";
  };

  emailInput?.addEventListener("input",    () => setFieldState(emailInput,    emailError,    validateEmail()));
  passwordInput?.addEventListener("input", () => setFieldState(passwordInput, passwordError, validatePassword()));

  passwordToggle?.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    passwordToggle.textContent = isHidden ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-label", isHidden ? "Hide password" : "Show password");
  });

  // –– Submit –––––––––––––––––––––––––––––––––––––––––––––––––
  signinForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailErr = validateEmail();
    const passErr  = validatePassword();
    setFieldState(emailInput,    emailError,    emailErr);
    setFieldState(passwordInput, passwordError, passErr);

    if (emailErr || passErr) {
      if (formMessage) {
        formMessage.textContent = "Please fix the highlighted fields and try again.";
        formMessage.className   = "form-message error";
      }
      return;
    }

    const submitBtn = signinForm.querySelector("button[type='submit']");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add("button-loading");
      submitBtn.innerHTML = `<span class="spinner"></span> Please wait—¦`;
    }

    try {
      const endpoint = currentMode === "signin" ? "/auth/login" : "/auth/register";
      const payload  = {
        email:    emailInput.value.trim(),
        password: passwordInput.value.trim(),
      };
      if (currentMode === "signup") {
        const nameEl = document.querySelector("#name");
        payload.name = nameEl?.value.trim() || payload.email.split("@")[0];
        const roleEl = document.querySelector("input[name='role']:checked");
        payload.role = roleEl?.value || "student";
      }

      const response = await fetch(`${window.rvAuth.API_BASE}${endpoint}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Something went wrong.");

      // Backend wraps response in data.data – handle both shapes
      const authData = data.data || data;
      window.rvAuth.setToken(authData.token);
      window.rvAuth.setUser(authData.user);

      if (formMessage) {
        formMessage.textContent = currentMode === "signin"
          ? "Login successful. Welcome back to Resvaspot."
          : "Account created! Welcome to Resvaspot.";
        formMessage.className = "form-message success";
      }

      signinForm.reset();
      setFieldState(emailInput,    emailError,    "");
      setFieldState(passwordInput, passwordError, "");

      // Return users to the action they requested first, otherwise use role-based landing pages.
      const redirectUser = authData.user;
      const dest = returnTo || (redirectUser?.role === "provider" ? "dashboard.html" : "home.html");
      setTimeout(() => { window.location.href = dest; }, 700);
    } catch (err) {
      if (formMessage) {
        formMessage.textContent = err.message;
        formMessage.className   = "form-message error";
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove("button-loading");
        submitBtn.textContent = currentMode === "signin" ? "Sign In" : "Create Account";
      }
    }
  });
}
