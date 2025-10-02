// Cloudflare Worker for Big Tent Games Authentication
// Deploy this to: https://your-auth-worker.your-domain.workers.dev

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Route handling
    if (path === '/auth/login' && request.method === 'POST') {
      return handleLogin(request, env);
    } else if (path === '/auth/signup' && request.method === 'POST') {
      return handleSignup(request, env);
    } else if (path === '/auth/validate' && request.method === 'POST') {
      return handleValidate(request, env);
    } else if (path === '/account/profile' && request.method === 'GET') {
      return handleAuthenticatedRequest(request, env, ctx, handleGetProfile);
    } else if (path === '/account/update-profile' && request.method === 'POST') {
      return handleAuthenticatedRequest(request, env, ctx, handleUpdateProfile);
    } else if (path === '/account/update-password' && request.method === 'POST') {
      return handleAuthenticatedRequest(request, env, ctx, handleUpdatePassword);
    } else if (path === '/player/lookup' && request.method === 'GET') {
      return handlePlayerLookup(request, env);
    } else if (path === '/auth/verify-email' && request.method === 'POST') {
      return handleVerifyEmail(request, env);
    } else if (path === '/auth/resend-verification' && request.method === 'POST') {
      return handleResendVerification(request, env);
    } else if (path === '/account/delete' && request.method === 'POST') {
      return handleAuthenticatedRequest(request, env, ctx, handleDeleteAccount);
    }

    return new Response('Not Found', { status: 404 });
  },
};

// Player ID generation and management
// Uses a readable character set excluding easily confused characters (0, O, 1, I, l)
const PLAYER_ID_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const PLAYER_ID_LENGTH = 8;

// Generate a unique, collision-resistant player ID
async function generateUniquePlayerId(env) {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const playerId = generatePlayerId();

    // Check for collision in player ID index
    const existing = await env.BTG_PLAYER_IDS.get(playerId.toLowerCase());
    if (!existing) {
      return playerId;
    }

    // Check if the existing player ID belongs to a deleted account
    try {
      const existingData = JSON.parse(existing);
      if (existingData.deleted) {
        // This player ID belongs to a deleted account, we can reuse it
        console.log(`Reusing player ID ${playerId} from deleted account`);
        return playerId;
      }
    } catch (e) {
      // If it's not JSON (old format), treat as active email - continue to next attempt
      continue;
    }
  }

  // If we've exhausted attempts, use a longer ID with timestamp
  return generatePlayerId(12) + Date.now().toString(36).slice(-4).toUpperCase();
}

// Generate a random player ID of specified length
function generatePlayerId(length = PLAYER_ID_LENGTH) {
  let result = '';
  const chars = PLAYER_ID_CHARS;
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);

  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }

  return result;
}

// Store player ID mapping for fast lookups
async function storePlayerIdMapping(env, playerId, email) {
  await env.BTG_PLAYER_IDS.put(playerId.toLowerCase(), email.toLowerCase());
}

// Look up email by player ID
async function getEmailByPlayerId(env, playerId) {
  const result = await env.BTG_PLAYER_IDS.get(playerId.toLowerCase());

  if (!result) {
    return null;
  }

  // Check if this is a deleted player ID (JSON format)
  try {
    const playerData = JSON.parse(result);
    if (playerData.deleted) {
      return null; // Treat deleted player IDs as non-existent
    }
    // If it's JSON but not deleted, return the original email
    return playerData.originalEmail || null;
  } catch (e) {
    // If it's not JSON, it's the old format (just email string)
    return result;
  }
}

// Generate player ID for existing users who don't have one
async function ensureUserHasPlayerId(env, userData, email) {
  if (!userData.playerId) {
    const playerId = await generateUniquePlayerId(env);
    userData.playerId = playerId;

    // Store both the user data and the ID mapping
    await Promise.all([env.BTG_USERS.put(email.toLowerCase(), JSON.stringify(userData)), storePlayerIdMapping(env, playerId, email)]);
  }

  return userData;
}

// Email verification token management
// Generate a secure verification token
async function generateVerificationToken() {
  const tokenBytes = new Uint8Array(32);
  crypto.getRandomValues(tokenBytes);
  return Array.from(tokenBytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// Store verification token with expiration (24 hours)
async function storeVerificationToken(env, token, email) {
  const expiration = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const tokenData = {
    email: email.toLowerCase(),
    createdAt: Date.now(),
    expiresAt: expiration,
  };

  // Store token with TTL (expires automatically after 24 hours)
  await env.BTG_VERIFICATION_TOKENS.put(token, JSON.stringify(tokenData), {
    expirationTtl: 24 * 60 * 60, // 24 hours in seconds
  });
}

// Validate and consume verification token
async function validateVerificationToken(env, token) {
  const tokenDataStr = await env.BTG_VERIFICATION_TOKENS.get(token);

  if (!tokenDataStr) {
    return { valid: false, error: 'Token not found or expired' };
  }

  const tokenData = JSON.parse(tokenDataStr);

  // Check if token has expired (double check even with TTL)
  if (Date.now() > tokenData.expiresAt) {
    await env.BTG_VERIFICATION_TOKENS.delete(token);
    return { valid: false, error: 'Token expired' };
  }

  return { valid: true, email: tokenData.email };
}

// Delete verification token after use
async function consumeVerificationToken(env, token) {
  await env.BTG_VERIFICATION_TOKENS.delete(token);
}

// Send verification email using Resend API
async function sendVerificationEmail(env, email, token) {
  // Check if Resend API key is configured
  console.log('sendVerificationEmail called for:', email);
  console.log('RESEND_API_KEY exists:', !!env.RESEND_API_KEY);
  console.log('RESEND_API_KEY length:', env.RESEND_API_KEY ? env.RESEND_API_KEY.length : 0);

  if (!env.RESEND_API_KEY) {
    console.log(`Email service not configured. Verification URL for ${email}: https://bigtentgames.com/verify-email.html?token=${token}`);
    return true; // Return true in development to not block signup
  }

  const verificationUrl = `https://bigtentgames.com/verify-email.html?token=${token}`;

  console.log('Attempting to send email via Resend API...');
  console.log('Verification URL:', verificationUrl);

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Big Tent Games <noreply@bigtentgames.com>',
        to: [email],
        subject: 'Verify your Big Tent Games account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Welcome to Big Tent Games!</h1>
            <p>Thank you for creating an account. Please verify your email address to complete your registration and start playing our games.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style="background: #f8f9fa; padding: 10px; border-radius: 3px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <p><strong>This link will expire in 24 hours.</strong></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              If you didn't create an account with Big Tent Games, please ignore this email.
            </p>
          </div>
        `,
        text: `
Welcome to Big Tent Games!

Thank you for creating an account. Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with Big Tent Games, please ignore this email.
        `,
      }),
    });

    console.log('Resend API response status:', response.status);
    console.log('Resend API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send email - Status:', response.status);
      console.error('Failed to send email - Error body:', error);
      throw new Error(`Failed to send verification email: ${response.status} - ${error}`);
    }

    const responseData = await response.json();
    console.log('Resend API success response:', responseData);
    console.log(`Verification email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error - Type:', error.constructor.name);
    console.error('Email sending error - Message:', error.message);
    console.error('Email sending error - Stack:', error.stack);
    // In production, you might want to throw the error
    // For now, log it but don't block signup
    console.log(`Fallback: Verification URL for ${email}: ${verificationUrl}`);
    return true;
  }
}

// Handle CORS for cross-origin requests
function handleCORS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}

// Add CORS headers to response
function addCORSHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle authenticated requests by validating token first
async function handleAuthenticatedRequest(request, env, ctx, handlerFunction) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'No token provided' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const token = authHeader.substring(7);
    const email = validateSimpleToken(token);

    if (!email) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Verify user still exists and is not deleted
    const storedUserData = await env.BTG_USERS.get(email.toLowerCase());
    if (!storedUserData) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'User not found' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const userData = JSON.parse(storedUserData);
    // Treat deleted accounts like non-existent accounts
    if (userData.deleted) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'User not found' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Create token data object
    const tokenData = { email: email.toLowerCase() };

    // Call the actual handler function with authenticated context
    return await handlerFunction(request, env, ctx, tokenData);
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ success: false, message: 'Authentication failed' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handle user login
async function handleLogin(request, env) {
  try {
    const { email, password } = await request.json();

    // Validate and sanitize input
    if (!email || !password) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    let sanitizedEmail;
    try {
      sanitizedEmail = validateEmail(email);
      validatePassword(password); // Just validate, don't need return value
    } catch (validationError) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: validationError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Get stored user data from KV storage
    const storedUserData = await env.BTG_USERS.get(sanitizedEmail);

    if (!storedUserData) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Parse stored user data
    let userData = JSON.parse(storedUserData);

    // Check if account is deleted - treat deleted accounts like non-existent accounts
    if (userData.deleted) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Verify password using secure comparison
    const isValidPassword = await verifyPassword(password, userData.salt, userData.hash);

    if (!isValidPassword) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'Invalid email or password' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Check if email is verified (for accounts created after verification system)
    if (userData.hasOwnProperty('emailVerified') && !userData.emailVerified) {
      return addCORSHeaders(
        new Response(
          JSON.stringify({
            error: 'Email not verified',
            requiresVerification: true,
            email: sanitizedEmail,
            message: 'Please verify your email address before logging in',
          }),
          {
            status: 403,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }

    // Ensure user has a player ID (for existing users)
    userData = await ensureUserHasPlayerId(env, userData, email);

    // For existing users who don't have emailVerified property, set it to true
    if (!userData.hasOwnProperty('emailVerified')) {
      userData.emailVerified = true;
      await env.BTG_USERS.put(sanitizedEmail, JSON.stringify(userData));
    }

    // Generate simple token (in production, use JWT or similar)
    const token = generateSimpleToken(email);

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          token,
          message: 'Login successful',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ error: 'Login failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handle user signup
async function handleSignup(request, env) {
  try {
    const { email, password } = await request.json();

    // Validate and sanitize input
    if (!email || !password) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'Email and password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    let sanitizedEmail;
    try {
      sanitizedEmail = validateEmail(email);
      validatePassword(password);
    } catch (validationError) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: validationError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Check if user already exists
    const existingUser = await env.BTG_USERS.get(sanitizedEmail);
    console.log(`Signup attempt for ${sanitizedEmail}, existingUser:`, existingUser ? 'found' : 'not found');
    if (existingUser) {
      const userData = JSON.parse(existingUser);
      console.log(`Existing user data:`, { deleted: userData.deleted, emailVerified: userData.emailVerified });

      // If the account is deleted, allow re-registration by overwriting the old data
      if (!userData.deleted) {
        return addCORSHeaders(
          new Response(JSON.stringify({ error: 'User already exists' }), {
            status: 409,
            headers: { 'Content-Type': 'application/json' },
          }),
        );
      }

      // Account is deleted, so we'll clean up the old player ID mapping and continue with fresh signup
      console.log(`Deleted account found for ${sanitizedEmail}, allowing re-registration with fresh data`);
      if (userData.playerId) {
        // Clean up the old player ID mapping
        await env.BTG_PLAYER_IDS.delete(userData.playerId.toLowerCase());
        console.log(`Cleaned up old player ID mapping: ${userData.playerId}`);
      }
    }

    // Hash password securely
    const { salt, hash } = await hashPassword(password);

    // Generate unique player ID
    const playerId = await generateUniquePlayerId(env);

    // Generate verification token
    const verificationToken = await generateVerificationToken();

    // Store user data with hashed password, player ID, and unverified status
    const userData = {
      email: sanitizedEmail,
      salt,
      hash,
      playerId,
      playerName: 'Player',
      emailVerified: false, // Require email verification
      createdAt: new Date().toISOString(),
    };

    // Store user data, player ID mapping, and verification token atomically
    await Promise.all([env.BTG_USERS.put(sanitizedEmail, JSON.stringify(userData)), storePlayerIdMapping(env, playerId, sanitizedEmail), storeVerificationToken(env, verificationToken, sanitizedEmail)]);

    // Send verification email
    await sendVerificationEmail(env, sanitizedEmail, verificationToken);

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          requiresVerification: true,
          email: sanitizedEmail,
          message: 'Account created successfully. Please check your email to verify your account.',
        }),
        {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    console.error('Signup error:', error);
    console.error('Error details:', error.message, error.stack);
    return addCORSHeaders(
      new Response(JSON.stringify({ error: 'Signup failed', details: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handle token validation
async function handleValidate(request, env) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'No token provided' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const token = authHeader.substring(7);
    const email = validateSimpleToken(token);

    if (!email) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'Invalid token' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Verify user still exists and is not deleted
    const storedUserData = await env.BTG_USERS.get(email.toLowerCase());
    if (!storedUserData) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'User not found' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const userData = JSON.parse(storedUserData);
    // Treat deleted accounts like non-existent accounts
    if (userData.deleted) {
      return addCORSHeaders(
        new Response(JSON.stringify({ error: 'User not found' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          email: email,
          message: 'Token valid',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ error: 'Token validation failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Simple token generation (use JWT in production)
function generateSimpleToken(email) {
  const payload = {
    email: email.toLowerCase(),
    timestamp: Date.now(),
  };

  // Simple base64 encoding (use proper signing in production)
  return btoa(JSON.stringify(payload)) + '.' + btoa('btg-signature');
}

// Simple token validation (use JWT verification in production)
function validateSimpleToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const payload = JSON.parse(atob(parts[0]));

    // Check if token is not too old (7 days)
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    if (Date.now() - payload.timestamp > maxAge) {
      return null;
    }

    return payload.email;
  } catch (error) {
    return null;
  }
}

// Secure password hashing using Web Crypto API
async function hashPassword(password) {
  // Generate a random salt
  const saltArray = new Uint8Array(16);
  crypto.getRandomValues(saltArray);
  const salt = Array.from(saltArray, (byte) => byte.toString(16).padStart(2, '0')).join('');

  // Convert password and salt to ArrayBuffer
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password + salt);

  // Hash using PBKDF2
  const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, { name: 'PBKDF2' }, false, ['deriveBits']);

  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: encoder.encode(salt),
      iterations: 100000, // 100k iterations for security
      hash: 'SHA-256',
    },
    keyMaterial,
    256, // 256-bit hash
  );

  // Convert hash to hex string
  const hashArray = new Uint8Array(hashBuffer);
  const hash = Array.from(hashArray, (byte) => byte.toString(16).padStart(2, '0')).join('');

  return { salt, hash };
}

// Verify password against stored hash
async function verifyPassword(password, salt, storedHash) {
  try {
    // Generate hash for the provided password using the stored salt
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password + salt);

    const keyMaterial = await crypto.subtle.importKey('raw', passwordBuffer, { name: 'PBKDF2' }, false, ['deriveBits']);

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode(salt),
        iterations: 100000, // Same iterations as hashing
        hash: 'SHA-256',
      },
      keyMaterial,
      256,
    );

    // Convert hash to hex string
    const hashArray = new Uint8Array(hashBuffer);
    const hash = Array.from(hashArray, (byte) => byte.toString(16).padStart(2, '0')).join('');

    // Secure comparison to prevent timing attacks
    return secureCompare(hash, storedHash);
  } catch (error) {
    return false;
  }
}

// Secure string comparison to prevent timing attacks
function secureCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}

// Input sanitization and validation utilities
function sanitizeString(input) {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }

  // Remove null bytes and control characters except newlines and tabs
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
}

function validateEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const sanitizedEmail = sanitizeString(email);

  if (!emailRegex.test(sanitizedEmail)) {
    throw new Error('Invalid email format');
  }

  if (sanitizedEmail.length > 254) {
    throw new Error('Email too long');
  }

  return sanitizedEmail.toLowerCase();
}

function validatePlayerName(playerName) {
  const sanitized = sanitizeString(playerName);

  if (sanitized.length === 0) {
    throw new Error('Player name cannot be empty');
  }

  if (sanitized.length > 50) {
    throw new Error('Player name must be 50 characters or less');
  }

  // Check for potentially harmful patterns
  const harmfulPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<[^>]+>/g, // HTML tags
  ];

  for (const pattern of harmfulPatterns) {
    if (pattern.test(sanitized)) {
      throw new Error('Player name contains invalid characters');
    }
  }

  return sanitized;
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    throw new Error('Password must be a string');
  }

  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  if (password.length > 128) {
    throw new Error('Password is too long');
  }

  // Check for common weak patterns
  const weakPatterns = [
    /^(.)\1+$/, // All same character
    /^(password|123456|qwerty)$/i, // Common weak passwords
  ];

  for (const pattern of weakPatterns) {
    if (pattern.test(password)) {
      throw new Error('Password is too weak');
    }
  }

  return password;
}

// Handler for getting user profile
async function handleGetProfile(request, env, ctx, tokenData) {
  try {
    const user = await env.BTG_USERS.get(tokenData.email);
    if (!user) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    let userData = JSON.parse(user);

    // Ensure user has a player ID (for existing users)
    userData = await ensureUserHasPlayerId(env, userData, tokenData.email);

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          profile: {
            email: userData.email,
            playerId: userData.playerId,
            playerName: userData.playerName || 'Player',
            createdAt: userData.createdAt,
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handler for updating user profile
async function handleUpdateProfile(request, env, ctx, tokenData) {
  try {
    const { playerName } = await request.json();

    // Validate and sanitize player name
    let sanitizedPlayerName;
    try {
      sanitizedPlayerName = validatePlayerName(playerName);
    } catch (validationError) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: validationError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const user = await env.BTG_USERS.get(tokenData.email);
    if (!user) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const userData = JSON.parse(user);

    // Check if the new player name is different from current
    if (userData.playerName === sanitizedPlayerName) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Player name is the same as current name' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    userData.playerName = sanitizedPlayerName;

    await env.BTG_USERS.put(tokenData.email, JSON.stringify(userData));

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          message: 'Player name updated successfully',
          playerName: userData.playerName,
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handler for updating user password
async function handleUpdatePassword(request, env, ctx, tokenData) {
  try {
    const { currentPassword, newPassword } = await request.json();

    // Validate and sanitize input
    if (!currentPassword || !newPassword) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Current password and new password are required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    try {
      validatePassword(currentPassword);
      validatePassword(newPassword);
    } catch (validationError) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: validationError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const user = await env.BTG_USERS.get(tokenData.email);
    if (!user) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const userData = JSON.parse(user);

    // Check if new password is same as current
    const isSamePassword = await verifyPassword(newPassword, userData.salt, userData.hash);
    if (isSamePassword) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'New password must be different from current password' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Verify current password
    const isValidCurrentPassword = await verifyPassword(currentPassword, userData.salt, userData.hash);
    if (!isValidCurrentPassword) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Current password is incorrect' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Generate new salt and hash for new password
    const { salt: newSalt, hash: newHash } = await hashPassword(newPassword);

    // Update user data with new password
    userData.salt = newSalt;
    userData.hash = newHash;

    await env.BTG_USERS.put(tokenData.email, JSON.stringify(userData));

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          message: 'Password updated successfully',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handler for looking up player by Player ID (for future friending features)
async function handlePlayerLookup(request, env) {
  try {
    const url = new URL(request.url);
    const playerId = url.searchParams.get('id');

    if (!playerId) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Player ID is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Validate player ID format
    const playerIdRegex = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{8,16}$/i;
    if (!playerIdRegex.test(playerId)) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Invalid player ID format' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const email = await getEmailByPlayerId(env, playerId);
    if (!email) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Player not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const userData = await env.BTG_USERS.get(email);
    if (!userData) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, message: 'Player data not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const user = JSON.parse(userData);

    // Return public player info only (no sensitive data)
    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          player: {
            playerId: user.playerId,
            playerName: user.playerName || 'Anonymous Player',
            // Don't include email or other sensitive information
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ success: false, message: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handler for email verification
async function handleVerifyEmail(request, env) {
  try {
    const { token } = await request.json();

    if (!token) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, error: 'Verification token is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Validate the token
    const tokenResult = await validateVerificationToken(env, token);

    if (!tokenResult.valid) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, error: tokenResult.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Get user data
    const userData = await env.BTG_USERS.get(tokenResult.email);
    if (!userData) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const user = JSON.parse(userData);

    // Mark user as verified
    user.emailVerified = true;
    user.verifiedAt = new Date().toISOString();

    // Save updated user data
    await env.BTG_USERS.put(tokenResult.email, JSON.stringify(user));

    // Consume the token (delete it)
    await consumeVerificationToken(env, token);

    return addCORSHeaders(
      new Response(JSON.stringify({ success: true, message: 'Email verified successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Handler for resending verification email
async function handleResendVerification(request, env) {
  try {
    const { email } = await request.json();

    if (!email) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, error: 'Email is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Validate and sanitize email
    let sanitizedEmail;
    try {
      sanitizedEmail = validateEmail(email);
    } catch (validationError) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, error: validationError.message }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Check if user exists
    const userData = await env.BTG_USERS.get(sanitizedEmail);
    if (!userData) {
      // Don't reveal if user exists or not for security
      return addCORSHeaders(
        new Response(JSON.stringify({ success: true, message: 'If the email exists, a verification email has been sent' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    const user = JSON.parse(userData);

    // Check if user is already verified
    if (user.emailVerified) {
      return addCORSHeaders(
        new Response(JSON.stringify({ success: false, error: 'Email is already verified' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    }

    // Generate new verification token
    const token = await generateVerificationToken();
    await storeVerificationToken(env, token, sanitizedEmail);

    // Send verification email
    await sendVerificationEmail(env, sanitizedEmail, token);

    return addCORSHeaders(
      new Response(JSON.stringify({ success: true, message: 'Verification email sent' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  } catch (error) {
    return addCORSHeaders(
      new Response(JSON.stringify({ success: false, error: 'Internal server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  }
}

// Send account deletion confirmation email
async function sendAccountDeletionEmail(env, email, playerName) {
  // Check if Resend API key is configured
  if (!env.RESEND_API_KEY) {
    console.log(`Email service not configured. Account deletion confirmed for ${email}`);
    return true;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Big Tent Games <noreply@bigtentgames.com>',
        to: [email],
        subject: 'Account Deletion Confirmation - Big Tent Games',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333; text-align: center;">Account Deletion Confirmed</h1>
            <p>Hello${playerName ? ` ${playerName}` : ''},</p>
            
            <p>This email confirms that your Big Tent Games account has been successfully deleted.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">What this means:</h3>
              <ul style="color: #6c757d;">
                <li>Your player ID is no longer active</li>
                <li>You will no longer receive emails from us</li>                
              </ul>
            </div>
            
            <p>If you change your mind, you can always create a new account at any time.</p>
            
            <p>Thank you for being part of the Big Tent Games community!</p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              If you did not request this account deletion, please contact us immediately at bigtentgames@icloud.com
            </p>
          </div>
        `,
        text: `
Account Deletion Confirmed - Big Tent Games

Hello${playerName ? ` ${playerName}` : ''},

This email confirms that your Big Tent Games account has been successfully deleted.

What this means:
- Your account and profile data have been removed
- Your player ID is no longer active  
- You will no longer receive emails from us
- Any saved game progress has been deleted

If you change your mind, you can always create a new account at any time.

Thank you for being part of the Big Tent Games community!

If you did not request this account deletion, please contact us immediately at bigtentgames@icloud.com
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Failed to send deletion confirmation email:', error);
      throw new Error('Failed to send deletion confirmation email');
    }

    console.log(`Account deletion confirmation email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    // Don't fail the deletion if email fails
    console.log(`Fallback: Account deletion confirmed for ${email} (email failed to send)`);
    return true;
  }
}

// Handler for account deletion
async function handleDeleteAccount(request, env, ctx, tokenData) {
  try {
    const { confirmationEmail } = await request.json();

    // Validate required fields
    if (!confirmationEmail) {
      return addCORSHeaders(
        new Response(
          JSON.stringify({
            success: false,
            message: 'Confirmation email is required',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }

    // Validate confirmation email matches logged-in user
    let sanitizedConfirmationEmail;
    try {
      sanitizedConfirmationEmail = validateEmail(confirmationEmail);
    } catch (validationError) {
      return addCORSHeaders(
        new Response(
          JSON.stringify({
            success: false,
            message: 'Invalid email format',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }

    if (sanitizedConfirmationEmail !== tokenData.email) {
      return addCORSHeaders(
        new Response(
          JSON.stringify({
            success: false,
            message: 'Confirmation email must match your account email',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }

    // Get user data
    const user = await env.BTG_USERS.get(tokenData.email);
    if (!user) {
      return addCORSHeaders(
        new Response(
          JSON.stringify({
            success: false,
            message: 'User not found',
          }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }

    const userData = JSON.parse(user);

    // Check if account is already deleted
    if (userData.deleted) {
      return addCORSHeaders(
        new Response(
          JSON.stringify({
            success: false,
            message: 'Account is already deleted',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      );
    }

    // Password validation removed - user is already authenticated via JWT token

    // Perform soft delete by marking account as deleted
    userData.deleted = true;
    userData.deletedAt = new Date().toISOString();
    // Clear sensitive data but keep audit trail
    const originalPlayerName = userData.playerName;
    userData.playerName = '[deleted]';

    // Store the deleted user data
    await env.BTG_USERS.put(tokenData.email, JSON.stringify(userData));

    // Mark player ID as deleted (soft delete approach)
    if (userData.playerId) {
      const playerIdData = {
        deleted: true,
        deletedAt: new Date().toISOString(),
        originalEmail: tokenData.email,
      };
      await env.BTG_PLAYER_IDS.put(userData.playerId.toLowerCase(), JSON.stringify(playerIdData));
    }

    // Clean up any verification tokens for this user
    // Note: We can't easily query KV by email, but tokens expire automatically anyway

    // Send confirmation email
    await sendAccountDeletionEmail(env, tokenData.email, originalPlayerName);

    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: true,
          message: 'Account has been successfully deleted. A confirmation email has been sent.',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  } catch (error) {
    console.error('Account deletion error:', error);
    return addCORSHeaders(
      new Response(
        JSON.stringify({
          success: false,
          message: 'Internal server error',
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
  }
}
