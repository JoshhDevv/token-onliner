require('dotenv').config();
const fs = require('fs');
const path = require('path');

class TokenService {
  constructor() {
    this.tokens = new Map(); // Stores tokens and their statuses
    this.onlineTokens = new Set(); // Quick access to online tokens
    this.loadTokensFromEnv();
  }

  loadTokensFromEnv() {
    const tokenString = process.env.TOKENS || '';
    const tokenIds = tokenString.split(',').filter(token => token.trim() !== '');
    
    tokenIds.forEach(tokenId => {
      // Clean the token ID to create a valid env var name
      const cleanId = tokenId.replace(/[-\.]/g, '_');
      const metadataKey = `TOKEN_${cleanId}_METADATA`;
      let metadata = {};
      
      try {
        if (process.env[metadataKey]) {
          metadata = JSON.parse(process.env[metadataKey]);
        }
      } catch (error) {
        console.warn(`Failed to parse metadata for token ${tokenId}`);
      }
      
      this.registerToken(tokenId, metadata);
    });
    
    console.log(`Loaded ${tokenIds.length} tokens from environment`);
  }

  // Register a new token
  registerToken(tokenId, metadata = {}) {
    if (this.tokens.has(tokenId)) {
      return { success: false, message: 'Token already exists' };
    }
    
    this.tokens.set(tokenId, {
      isOnline: false,
      lastSeen: null,
      metadata,
      createdAt: new Date()
    });
    
    return { success: true, message: 'Token registered successfully' };
  }

  // Set token to online status
  setTokenOnline(tokenId) {
    if (!this.tokens.has(tokenId)) {
      return { success: false, message: 'Token not found' };
    }
    
    const tokenData = this.tokens.get(tokenId);
    tokenData.isOnline = true;
    tokenData.lastSeen = new Date();
    this.tokens.set(tokenId, tokenData);
    this.onlineTokens.add(tokenId);
    
    return { success: true, message: 'Token is now online' };
  }

  // Set multiple tokens online at once
  setMultipleTokensOnline(tokenIds) {
    if (!Array.isArray(tokenIds)) {
      return { 
        success: false, 
        message: 'Expected an array of token IDs'
      };
    }

    const results = {
      success: true,
      total: tokenIds.length,
      successful: 0,
      failed: 0,
      notFound: [],
      details: {}
    };

    const timestamp = new Date();
    
    // Process all tokens
    tokenIds.forEach(tokenId => {
      if (!this.tokens.has(tokenId)) {
        results.failed++;
        results.notFound.push(tokenId);
        results.details[tokenId] = { success: false, message: 'Token not found' };
        return;
      }
      
      const tokenData = this.tokens.get(tokenId);
      tokenData.isOnline = true;
      tokenData.lastSeen = timestamp;
      this.tokens.set(tokenId, tokenData);
      this.onlineTokens.add(tokenId);
      
      results.successful++;
      results.details[tokenId] = { success: true, message: 'Token is now online' };
    });
    
    // Update overall success flag if any operations failed
    if (results.failed > 0) {
      results.success = false;
      results.message = `${results.successful} tokens set online, ${results.failed} failed`;
    } else {
      results.message = `All ${results.successful} tokens set online successfully`;
    }
    
    return results;
  }

  // Set all available tokens online at once
  setAllTokensOnline() {
    const allTokenIds = Array.from(this.tokens.keys());
    return this.setMultipleTokensOnline(allTokenIds);
  }

  // Set token to offline status
  setTokenOffline(tokenId) {
    if (!this.tokens.has(tokenId)) {
      return { success: false, message: 'Token not found' };
    }
    
    const tokenData = this.tokens.get(tokenId);
    tokenData.isOnline = false;
    tokenData.lastSeen = new Date();
    this.tokens.set(tokenId, tokenData);
    this.onlineTokens.delete(tokenId);
    
    return { success: true, message: 'Token is now offline' };
  }

  // Get all online tokens
  getOnlineTokens() {
    return Array.from(this.onlineTokens);
  }

  // Get all available tokens
  getAllTokens() {
    return Array.from(this.tokens.keys());
  }

  // Check if a token is online
  isTokenOnline(tokenId) {
    if (!this.tokens.has(tokenId)) {
      return false;
    }
    return this.tokens.get(tokenId).isOnline;
  }
}

// Example usage
const tokenService = new TokenService();

// Display loaded tokens
console.log('Available tokens:', tokenService.getAllTokens());

// Set all tokens online
const result = tokenService.setAllTokensOnline();
console.log('Set all tokens online result:', result);
console.log('Online tokens:', tokenService.getOnlineTokens());

// You could also set specific tokens online
// const specificResult = tokenService.setMultipleTokensOnline(['user123-token', 'app101-token']);
// console.log('Set specific tokens online:', specificResult);