// Type definitions (JSDoc for IDE support)

/**
 * @typedef {Object} Article
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} category
 * @property {string} lastUpdated
 * @property {string} content
 */

/**
 * @typedef {Object} Ticket
 * @property {string} id
 * @property {string} subject
 * @property {string} category
 * @property {'Low'|'Medium'|'High'} priority
 * @property {string} description
 * @property {'Open'|'In Progress'|'Resolved'} status
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {string[]} [attachments]
 * @property {boolean} [chatEnabled]
 */

/**
 * @typedef {Object} ChatMessage
 * @property {string} id
 * @property {'user'|'support'} sender
 * @property {string} message
 * @property {string} timestamp
 * @property {string} [agentName]
 */
