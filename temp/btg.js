// if (!UseDebug) {
Vue.config.devtools = false;
Vue.config.debug = false;
Vue.config.silent = true;
// }

Vue.config.ignoredElements = [
  'app',
  'page',
  'navbar',
  'settings',
  'splash',
  'splashwrap',
  'message',
  'notifications',
  'speedControls',
  'state',
  'bank',
  'commodity',
  'detail',
  'pageover',
  'listheader',
  'listings',
  'category',
  'name',
  'units',
  'currentPrice',
  'description',
  'market',
  'currentValue',
  'contractSize',
  'goldbacking',
  'contractUnit',
  'authmodal',
  'login',
  'authbuttons',
  'authmessage',
  'premiumcontent',
  'paywall',
  'profile',
  'accountform',
  'accountbuttons',
  'accountmessage',
  'emptystateaccount',
];

var app = new Vue({
  el: '#app',
  data: {
    pages: Pages,
    year: new Date().getFullYear(),
    showOnionskin: false,
    onionSkinImageSrc: '',
    currentHash: '',
    expandVersionHistory: false,
    platform: '',
    r: document.querySelector(':root'),
    // Authentication data
    showAuthModal: false,
    authMode: 'login', // 'login' or 'signup'
    authEmail: '',
    userEmail: '', // Separate field for displaying logged-in user's email
    authPassword: '',
    authConfirmPassword: '',
    authMessage: '',
    authLoading: false,
    isAuthenticated: false,
    userToken: null,
    emailValidationMessage: '',
    isEmailValid: false,
    emailValidationTimeout: null,
    // Account management data
    playerName: 'Player',
    originalPlayerName: '',
    playerId: '',
    accountLoading: false,
    accountMessage: '',
    // Rate limiting for player name changes
    nameChangeAttempts: [],
    nameChangeCooldownEnd: null,
    newPassword: '',
    confirmNewPassword: '',
    currentPassword: '',
    showAccountDropdown: false,
    // Delete account modal data
    showDeleteModal: false,
    deleteConfirmEmail: '',
    deleteMessage: '',
    deleteLoading: false,
  },
  methods: {
    ChangeHashToPagePath(_path) {
      log('ChangeHashToPagePath(_path) called');
      this.ResetScrollPositions();

      window.location.hash = _path;
    },

    SelectPage(_path) {
      log('SelectPage(_path) called');
      this.pages.forEach((_page) => {
        _page.isSelected = _page.path === _path;
      });
      this.ResetScrollPositions();
    },

    GetCurrentPage() {
      log('GetCurrentPage() called');
      let _page = null;
      this.pages.forEach((g) => {
        if (g.isSelected) {
          _page = g;
        }
      });
      if (_page === null) {
        _page = this.pages[0];
        this.SelectPage(_page.path);
      }
      return _page;
    },

    GetCurrentPageByPathName(_path) {
      log('GetCurrentPageByPathName(_path) called');
      return this.pages.filter((obj) => obj.path === _path);
    },

    ToggleAccountDropdown() {
      log('ToggleAccountDropdown() called');
      this.showAccountDropdown = !this.showAccountDropdown;
    },

    CloseAccountDropdownIfOpen() {
      if (this.showAccountDropdown) {
        this.showAccountDropdown = false;
      }
    },

    ToggleExpandVersionHistory() {
      log('ToggleExpandVersionHistory() called');
      this.expandVersionHistory = !this.expandVersionHistory;
    },

    ToggleShowOnionSkin() {
      log('ToggleShowOnionSkin() called');
      this.showOnionskin = !this.showOnionskin;
      if (!this.showOnionskin && document.getElementById('onionvideo') != undefined) {
        document.getElementById('onionvideo').pause();
      } else if (document.getElementById('onionvideo') != undefined) {
        document.getElementById('onionvideo').play();
      }
    },

    ZoomImage(_screenshot) {
      log('ZoomImage(_screenshot) called');
      this.onionSkinImageSrc = _screenshot;
      this.ToggleShowOnionSkin();
    },

    ResetScrollPositions() {
      log('ResetScrollPositions() called');
      requestAnimationFrame(() => {
        if (document.getElementsByTagName('content')[0] != undefined) {
          document.getElementsByTagName('content')[0].scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        }
        if (document.getElementsByTagName('screenshots')[0] != undefined) {
          document.getElementsByTagName('screenshots')[0].scrollTo({
            top: 0,
            left: 0,
            behavior: 'smooth',
          });
        }
        this.expandVersionHistory = false;
      });
    },

    HandleHashChangeEvent() {
      log('HandleHashChangeEvent() called');
      let hash = window.location.hash.split('?');

      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('showVersionHistory')) {
        let url = new URL(window.location.href);
        url.searchParams.delete('showVersionHistory');
        window.history.replaceState({}, document.title, url);
        window.setTimeout(function () {
          app.expandVersionHistory = true;
        }, 1);
        window.setTimeout(function () {
          document.getElementById('versionHistory').scrollIntoView();
        }, 100);
      }

      this.currentHash = hash[0].replace('#', '');
      log(window.location.hash);
      if (this.currentHash === '') {
        window.location.hash = 'home';
      } else {
        this.SelectPage(this.currentHash);

        // Check if user is trying to access account page without being authenticated
        if (this.currentHash === 'account' && !this.isAuthenticated) {
          // Small delay to let the page render first
          setTimeout(() => {
            this.ShowAuthModal('login');
          }, 100);
        } else if (this.currentHash === 'account' && this.isAuthenticated) {
          // Refresh user profile data when navigating to account page
          this.LoadUserProfile();
        }
      }
    },

    InitializeApp() {
      announce('InitializeApp() called');
      this.HandleHashChangeEvent();
    },

    async GetPlatformValue() {
      let n = navigator;
      if (n.userAgentData) {
        const hints = ['platform'];
        await n.userAgentData.getHighEntropyValues(hints).then((ua) => {
          this.platform = ua.platform.toLowerCase();
        });
      } else {
        var platform = navigator.platform;

        if (/Mac/.test(platform)) {
          this.platform = 'mac';
        } else if (/Win/.test(platform)) {
          this.platform = 'windows';
        } else if (/iPhone/.test(platform)) {
          this.platform = 'ios';
        } else if (/iPad/.test(platform)) {
          this.platform = 'ios';
        } else if (/Linux/.test(platform)) {
          this.platform = 'android';
        } else {
          this.platform = 'unknown';
        }
      }
    },

    HandleKeyUp(e) {
      if (e.key === 'Escape' && this.getCurrentPageComputed.name === 'Privacy Policy') {
        this.ChangeHashToPagePath(this.pages[0].path);
      }
      if (e.key === 'Escape' && this.showAuthModal) {
        this.CloseAuthModal();
      }
    },

    // Input sanitization and validation
    sanitizeString(input) {
      if (typeof input !== 'string') return '';
      // Remove null bytes and control characters except newlines and tabs
      return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
    },

    validateEmail(email) {
      const sanitized = this.sanitizeString(email);
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      return emailRegex.test(sanitized) && sanitized.length <= 254;
    },

    validatePlayerName(playerName) {
      const sanitized = this.sanitizeString(playerName);
      if (sanitized.length === 0 || sanitized.length > 50) return false;

      // Check for harmful patterns
      const harmfulPatterns = [/<script[^>]*>.*?<\/script>/gi, /javascript:/gi, /on\w+\s*=/gi, /<[^>]+>/g];

      return !harmfulPatterns.some((pattern) => pattern.test(sanitized));
    },

    validatePassword(password) {
      return (
        typeof password === 'string' &&
        password.length >= 8 &&
        password.length <= 128 &&
        !/^(.)\1+$/.test(password) && // Not all same character
        !/^(password|123456|qwerty)$/i.test(password)
      ); // Not common weak passwords
    },

    async copyToClipboard(text, successMessage = 'Copied to clipboard!') {
      log('copyToClipboard() called');
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          // Modern clipboard API
          await navigator.clipboard.writeText(text);
          this.accountMessage = successMessage;
        } else {
          // Fallback for older browsers
          const textArea = document.createElement('textarea');
          textArea.value = text;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          textArea.style.top = '-999999px';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          if (document.execCommand('copy')) {
            this.accountMessage = successMessage;
          } else {
            throw new Error('Copy command failed');
          }

          document.body.removeChild(textArea);
        }

        // Clear message after 3 seconds
        setTimeout(() => {
          if (this.accountMessage === successMessage) {
            this.accountMessage = '';
          }
        }, 3000);
      } catch (error) {
        this.accountMessage = 'Failed to copy to clipboard. Please select and copy manually.';
      }
    },

    // Authentication Methods
    ShowAuthModal(mode = 'login') {
      log('ShowAuthModal() called');
      this.authMode = mode;
      this.showAuthModal = true;
      this.ClearAuthForm();
    },

    CloseAuthModal() {
      log('CloseAuthModal() called');
      this.showAuthModal = false;
      this.ClearAuthForm();
    },

    ClearAuthForm() {
      log('ClearAuthForm() called');
      this.authEmail = '';
      this.authPassword = '';
      this.authConfirmPassword = '';
      this.authMessage = '';
      this.authLoading = false;
      this.emailValidationMessage = '';
      this.isEmailValid = false;
      if (this.emailValidationTimeout) {
        clearTimeout(this.emailValidationTimeout);
      }
    },

    SwitchAuthMode() {
      log('SwitchAuthMode() called');
      this.authMode = this.authMode === 'login' ? 'signup' : 'login';
      this.ClearAuthForm();
    },

    async SubmitAuth() {
      log('SubmitAuth() called');
      if (!this.ValidateAuthForm()) return;

      this.authLoading = true;
      this.authMessage = '';

      try {
        if (this.authMode === 'login') {
          await this.LoginUser();
        } else {
          await this.SignupUser();
        }
      } catch (error) {
        this.authMessage = error.message || 'Authentication failed. Please try again.';
      } finally {
        this.authLoading = false;
      }
    },

    ValidateAuthForm() {
      log('ValidateAuthForm() called');

      // Sanitize inputs
      this.authEmail = this.sanitizeString(this.authEmail);
      this.authPassword = this.sanitizeString(this.authPassword);

      if (!this.authEmail || !this.authPassword) {
        this.authMessage = 'Please fill in all fields.';
        return false;
      }

      if (!this.validateEmail(this.authEmail)) {
        this.authMessage = 'Please enter a valid email address.';
        return false;
      }

      if (this.authMode === 'signup' && this.authPassword !== this.authConfirmPassword) {
        this.authMessage = 'Passwords do not match.';
        return false;
      }

      if (!this.validatePassword(this.authPassword)) {
        this.authMessage = 'Password must be 8-128 characters and cannot be a common weak password.';
        return false;
      }

      return true;
    },

    CheckEmailAvailabilityDebounced() {
      // Clear existing timeout
      if (this.emailValidationTimeout) {
        clearTimeout(this.emailValidationTimeout);
      }

      // Set new timeout for debounced validation
      this.emailValidationTimeout = setTimeout(() => {
        this.CheckEmailAvailability();
      }, 500); // Wait 500ms after user stops typing
    },

    async CheckEmailAvailability() {
      log('CheckEmailAvailability() called');

      // Clear previous validation state
      this.emailValidationMessage = '';
      this.isEmailValid = false;

      // Only check for signup mode and if email is not empty
      if (this.authMode !== 'signup' || !this.authEmail.trim()) {
        if (this.authMode === 'login' && this.authEmail.trim()) {
          // For login mode, just validate format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          this.isEmailValid = emailRegex.test(this.authEmail);
          if (!this.isEmailValid) {
            this.emailValidationMessage = 'Please enter a valid email address.';
          }
        }
        return;
      }

      // Basic email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.authEmail)) {
        this.emailValidationMessage = 'Please enter a valid email address.';
        this.isEmailValid = false;
        return;
      }

      try {
        // Attempt to signup with a short password to check email availability
        const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: this.authEmail,
            password: 'x', // Intentionally short (1 char) to fail password validation
          }),
        });

        const data = await response.json();

        // Clear previous state
        this.emailValidationMessage = '';
        this.isEmailValid = false;

        if (response.status === 409) {
          // 409 Conflict = User already exists
          this.emailValidationMessage = 'This email is already registered. Try logging in instead.';
          this.isEmailValid = false;
        } else if (response.status === 400) {
          // 400 Bad Request - check the specific error
          if (data.error && data.error.includes('Password must be at least')) {
            // Password validation failed, which means email validation passed
            // This means the email is available!
            this.emailValidationMessage = '';
            this.isEmailValid = true;
          } else if (data.error && (data.error.includes('Email') || data.error.includes('required'))) {
            // Email validation failed
            this.emailValidationMessage = 'Please enter a valid email address.';
            this.isEmailValid = false;
          } else {
            // Other 400 errors
            this.emailValidationMessage = data.error || 'Invalid email format.';
            this.isEmailValid = false;
          }
        } else if (response.status === 201) {
          // 201 Created - This shouldn't happen with our short password, but handle it
          this.emailValidationMessage = '';
          this.isEmailValid = true;
        } else {
          // Any other response code - assume error
          this.emailValidationMessage = 'Unable to validate email. Please try again.';
          this.isEmailValid = false;
        }
      } catch (error) {
        // On error, don't block the user but don't mark as valid either
        this.emailValidationMessage = '';
        this.isEmailValid = false;
      }
    },

    async LoginUser() {
      log('LoginUser() called');
      const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.authEmail,
          password: this.authPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        this.SetAuthToken(data.token);
        this.authMessage = 'Login successful!';
        setTimeout(() => this.CloseAuthModal(), 1000);
      } else if (data.requiresVerification) {
        // Redirect to verification page
        this.CloseAuthModal();
        window.location.href = `/verify-email.html?email=${encodeURIComponent(data.email)}`;
      } else {
        throw new Error(data.error || 'Login failed');
      }
    },

    async SignupUser() {
      log('SignupUser() called');
      const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: this.authEmail,
          password: this.authPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.requiresVerification) {
        // Redirect to verification page
        this.CloseAuthModal();
        window.location.href = `/verify-email.html?email=${encodeURIComponent(data.email)}`;
      } else if (response.ok) {
        // Fallback for accounts that don't require verification
        this.SetAuthToken(data.token);
        this.authMessage = 'Account created successfully!';
        setTimeout(() => this.CloseAuthModal(), 1000);
      } else {
        throw new Error(data.error || 'Signup failed');
      }
    },

    SetAuthToken(token) {
      log('SetAuthToken() called');
      this.userToken = token;
      this.isAuthenticated = true;
      localStorage.setItem('btg_auth_token', token);

      // Set cookie for cross-subdomain access - works for both local and production
      const domain = window.location.hostname.includes('local') ? '.bigtentgames.local' : '.bigtentgames.com';
      document.cookie = `btg_auth_token=${token}; domain=${domain}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days

      // Load user profile data
      this.LoadUserProfile();
    },
    async CheckAuthStatus() {
      log('CheckAuthStatus() called');
      const token = localStorage.getItem('btg_auth_token');
      if (!token) return;

      try {
        const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/auth/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          this.SetAuthToken(token);
        } else {
          this.Logout();
        }
      } catch (error) {
        console.error('Auth validation failed:', error);
        this.Logout();
      }
    },

    Logout() {
      log('Logout() called');
      this.isAuthenticated = false;
      this.userToken = null;
      this.userEmail = '';
      this.playerName = '';
      this.playerId = '';
      // Clear rate limiting data
      this.nameChangeAttempts = [];
      this.nameChangeCooldownEnd = null;
      localStorage.removeItem('btg_name_change_cooldown');
      if (this.getCurrentPageComputed.path === 'account') {
        this.ChangeHashToPagePath('home');
      }
      localStorage.removeItem('btg_auth_token');

      // Clear cookie - works for both local and production
      const domain = window.location.hostname.includes('local') ? '.bigtentgames.local' : '.bigtentgames.com';
      document.cookie = `btg_auth_token=; domain=${domain}; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
    },

    // Account Management Methods
    async UpdatePlayerName() {
      log('UpdatePlayerName() called');

      // Check rate limiting
      if (this.isNameChangeOnCooldown()) {
        this.accountMessage = 'Please wait 5 minutes before changing your name again.';
        return;
      }

      // Sanitize input
      this.playerName = this.sanitizeString(this.playerName);

      if (!this.validatePlayerName(this.playerName)) {
        this.accountMessage = 'Player name must be 1-50 characters and cannot contain HTML or scripts.';
        return;
      }

      if (this.playerName === this.originalPlayerName) {
        this.accountMessage = 'Player name is the same as current name.';
        return;
      }

      this.accountLoading = true;
      this.accountMessage = '';

      try {
        const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/account/update-profile', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.userToken}`,
          },
          body: JSON.stringify({
            playerName: this.playerName.trim(),
          }),
        });

        const data = await response.json();

        if (response.ok) {
          this.accountMessage = 'Player name updated successfully!';
          // Update the original player name so the button becomes disabled again
          this.originalPlayerName = this.playerName.trim();
          // Track this name change attempt
          this.trackNameChangeAttempt();
        } else {
          throw new Error(data.error || 'Failed to update player name');
        }
      } catch (error) {
        this.accountMessage = error.message || 'Failed to update player name. Please try again.';
      } finally {
        this.accountLoading = false;
      }
    },

    async UpdatePassword() {
      log('UpdatePassword() called');

      // Sanitize inputs
      this.currentPassword = this.sanitizeString(this.currentPassword);
      this.newPassword = this.sanitizeString(this.newPassword);
      this.confirmNewPassword = this.sanitizeString(this.confirmNewPassword);

      if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
        this.accountMessage = 'Please fill in all password fields.';
        return;
      }

      if (!this.validatePassword(this.currentPassword)) {
        this.accountMessage = 'Current password format is invalid.';
        return;
      }

      if (this.newPassword !== this.confirmNewPassword) {
        this.accountMessage = 'New passwords do not match.';
        return;
      }

      if (!this.validatePassword(this.newPassword)) {
        this.accountMessage = 'New password must be 8-128 characters and cannot be a common weak password.';
        return;
      }

      if (this.currentPassword === this.newPassword) {
        this.accountMessage = 'New password must be different from current password.';
        return;
      }

      this.accountLoading = true;
      this.accountMessage = '';

      try {
        const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/account/update-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.userToken}`,
          },
          body: JSON.stringify({
            currentPassword: this.currentPassword,
            newPassword: this.newPassword,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          this.accountMessage = 'Password updated successfully!';
          this.ClearPasswordFields();
        } else {
          throw new Error(data.error || 'Failed to update password');
        }
      } catch (error) {
        this.accountMessage = error.message || 'Failed to update password. Please try again.';
      } finally {
        this.accountLoading = false;
      }
    },

    ClearPasswordFields() {
      log('ClearPasswordFields() called');
      this.currentPassword = '';
      this.newPassword = '';
      this.confirmNewPassword = '';
    },

    ShowDeleteAccountModal() {
      log('ShowDeleteAccountModal() called');
      this.showDeleteModal = true;
      this.deleteConfirmEmail = '';
      this.deleteMessage = '';
    },

    CloseDeleteModal() {
      log('CloseDeleteModal() called');
      this.showDeleteModal = false;
      this.deleteConfirmEmail = '';
      this.deleteMessage = '';
      this.deleteLoading = false;
    },

    async ConfirmDeleteAccount() {
      log('ConfirmDeleteAccount() called');

      // Sanitize inputs
      this.deleteConfirmEmail = this.sanitizeString(this.deleteConfirmEmail);

      // Validate fields
      if (!this.deleteConfirmEmail) {
        this.deleteMessage = 'Please enter your email address';
        return;
      }

      if (!this.validateEmail(this.deleteConfirmEmail)) {
        this.deleteMessage = 'Please enter a valid email address';
        return;
      }

      if (this.deleteConfirmEmail.toLowerCase() !== this.userEmail.toLowerCase()) {
        this.deleteMessage = 'Email must match your account email';
        return;
      }

      this.deleteLoading = true;
      this.deleteMessage = '';

      try {
        const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/account/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.userToken}`,
          },
          body: JSON.stringify({
            confirmationEmail: this.deleteConfirmEmail,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          this.deleteMessage = 'Account deleted successfully. You will be logged out.';

          // Wait a moment to show success message, then logout
          setTimeout(() => {
            this.Logout();
            this.CloseDeleteModal();
          }, 2000);
        } else {
          this.deleteMessage = data.message || 'Failed to delete account. Please try again.';
        }
      } catch (error) {
        console.error('Delete account error:', error);
        this.deleteMessage = 'Network error. Please check your connection and try again.';
      } finally {
        this.deleteLoading = false;
      }
    },

    async LoadUserProfile() {
      log('LoadUserProfile() called');
      if (!this.isAuthenticated || !this.userToken) return;

      try {
        const response = await fetch('https://btg-accounts-worker.bigtentgames.workers.dev/account/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.userToken}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          this.userEmail = data.profile.email || '';
          this.playerName = data.profile.playerName || 'Player';
          this.originalPlayerName = data.profile.playerName || 'Player';
          this.playerId = data.profile.playerId || '';

          // Debug logging for profile loading
          console.log('User profile loaded:', {
            email: this.userEmail,
            playerName: this.playerName,
            playerId: this.playerId,
            rawData: data.profile,
          });
        }
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    },

    // Rate limiting helper methods
    trackNameChangeAttempt() {
      const now = Date.now();
      // Remove attempts older than 1 minute
      this.nameChangeAttempts = this.nameChangeAttempts.filter((timestamp) => now - timestamp < 60000);
      // Add current attempt
      this.nameChangeAttempts.push(now);

      // If 2 or more attempts in the last minute, set cooldown
      if (this.nameChangeAttempts.length >= 2) {
        this.nameChangeCooldownEnd = now + 300000; // 5 minute cooldown
        // Persist cooldown in localStorage
        localStorage.setItem('btg_name_change_cooldown', this.nameChangeCooldownEnd.toString());
      }
    },

    isNameChangeOnCooldown() {
      // Check localStorage for persisted cooldown
      const storedCooldown = localStorage.getItem('btg_name_change_cooldown');
      if (storedCooldown) {
        const cooldownEnd = parseInt(storedCooldown);
        if (Date.now() < cooldownEnd) {
          this.nameChangeCooldownEnd = cooldownEnd;
          return true;
        } else {
          // Cooldown expired, clean up
          localStorage.removeItem('btg_name_change_cooldown');
          this.nameChangeCooldownEnd = null;
        }
      }

      return this.nameChangeCooldownEnd && Date.now() < this.nameChangeCooldownEnd;
    },

    OnPlayerNameInput() {
      // Clear previous messages first
      this.accountMessage = '';

      // Check if user is on cooldown when they start typing
      if (this.isNameChangeOnCooldown()) {
        this.accountMessage = 'Please wait 5 minutes before changing your name again.';
      }
    },

    InitializeRateLimiting() {
      // Check for existing cooldown in localStorage on app start
      const storedCooldown = localStorage.getItem('btg_name_change_cooldown');
      if (storedCooldown) {
        const cooldownEnd = parseInt(storedCooldown);
        if (Date.now() < cooldownEnd) {
          this.nameChangeCooldownEnd = cooldownEnd;
        } else {
          // Cooldown expired, clean up
          localStorage.removeItem('btg_name_change_cooldown');
        }
      }
    },
  },
  async mounted() {
    window.addEventListener('hashchange', this.HandleHashChangeEvent);
    window.addEventListener('keyup', this.HandleKeyUp);
    this.GetPlatformValue();
    this.InitializeRateLimiting();
    await this.CheckAuthStatus();
    this.InitializeApp();
  },

  computed: {
    getCurrentPageComputed: function () {
      return this.GetCurrentPage();
    },

    getPrivacyPageComputed: function () {
      return this.GetCurrentPageByPathName('privacy');
    },

    getPlatformValueComputed: async function () {
      return this.platform;
    },

    groupedByService() {
      return this.getCurrentPageComputed.socialLinks.reduce((grouped, item) => {
        const key = item.service;
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(item);
        return grouped;
      }, {});
    },

    // Smart button states
    isPlayerNameUpdateDisabled() {
      return this.accountLoading || !this.playerName.trim() || this.playerName.trim() === this.originalPlayerName.trim() || !this.validatePlayerName(this.playerName) || this.isNameChangeOnCooldown();
    },

    isPasswordUpdateDisabled() {
      return this.accountLoading || !this.currentPassword || !this.newPassword || !this.confirmNewPassword || this.newPassword !== this.confirmNewPassword || !this.validatePassword(this.newPassword) || this.currentPassword === this.newPassword;
    },

    isDeleteFormValid() {
      return this.deleteConfirmEmail && this.validateEmail(this.deleteConfirmEmail) && this.userEmail && this.deleteConfirmEmail.toLowerCase() === this.userEmail.toLowerCase() && !this.deleteLoading;
    },
  },
});
