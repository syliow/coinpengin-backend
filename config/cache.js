const NodeCache = require('node-cache');

/**
 * Cache instance for storing API responses and other data
 * Default TTL: 60 seconds for market data
 * Check period: Every 120 seconds to remove expired keys
 */
const cache = new NodeCache({
  stdTTL: 60, // Default TTL in seconds
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false // Better performance, but be careful with object mutations
});

/**
 * Get statistics about the cache
 * @returns {Object} Cache statistics
 */
const getStats = () => {
  return cache.getStats();
};

/**
 * Clear all cache entries
 */
const clearAll = () => {
  cache.flushAll();
};

module.exports = {
  cache,
  getStats,
  clearAll
};
