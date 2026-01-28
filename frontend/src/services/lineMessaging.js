/**
 * LINE Messaging Service
 * 
 * Central service for sending LINE messages via backend API.
 * Pages only need to construct the message content, this service handles the sending.
 */

import api from './api'

/**
 * Send a simple text message to user's LINE
 * @param {string} text - Message text
 * @param {string} lineUserId - Optional, defaults to current user
 */
export const sendTextMessage = async (text, lineUserId = null) => {
    try {
        const response = await api.post('/messaging/send/', {
            type: 'text',
            text,
            line_user_id: lineUserId
        })
        return response.data
    } catch (error) {
        console.error('[LINE Messaging] Failed to send text message:', error)
        throw error
    }
}

/**
 * Send a Flex Message to user's LINE
 * @param {string} altText - Alternative text for notifications
 * @param {object} contents - Flex Message bubble/carousel contents
 * @param {string} lineUserId - Optional, defaults to current user
 */
export const sendFlexMessage = async (altText, contents, lineUserId = null) => {
    try {
        const response = await api.post('/messaging/send/', {
            type: 'flex',
            altText,
            contents,
            line_user_id: lineUserId
        })
        return response.data
    } catch (error) {
        console.error('[LINE Messaging] Failed to send flex message:', error)
        throw error
    }
}

/**
 * Send raw messages (any LINE message type)
 * @param {array} messages - Array of LINE message objects
 * @param {string} lineUserId - Optional, defaults to current user
 */
export const sendRawMessages = async (messages, lineUserId = null) => {
    try {
        const response = await api.post('/messaging/send/', {
            type: 'raw',
            messages,
            line_user_id: lineUserId
        })
        return response.data
    } catch (error) {
        console.error('[LINE Messaging] Failed to send raw messages:', error)
        throw error
    }
}

// ============================================
// Message Templates
// ============================================

/**
 * Create a simple notification bubble
 */
export const createNotificationBubble = (title, message, iconEmoji = '📢') => ({
    type: 'bubble',
    body: {
        type: 'box',
        layout: 'vertical',
        contents: [
            {
                type: 'text',
                text: `${iconEmoji} ${title}`,
                weight: 'bold',
                size: 'lg',
                color: '#1DB446'
            },
            {
                type: 'text',
                text: message,
                size: 'sm',
                color: '#666666',
                margin: 'md',
                wrap: true
            }
        ]
    }
})

/**
 * Create a status update bubble
 */
export const createStatusBubble = (statusLabel, statusColor, message, buttonLabel = null, buttonUrl = null) => {
    const bubble = {
        type: 'bubble',
        body: {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'text',
                    text: statusLabel,
                    weight: 'bold',
                    size: 'xl',
                    color: statusColor
                },
                {
                    type: 'text',
                    text: message,
                    size: 'sm',
                    color: '#666666',
                    margin: 'md',
                    wrap: true
                }
            ]
        }
    }

    if (buttonLabel && buttonUrl) {
        bubble.footer = {
            type: 'box',
            layout: 'vertical',
            contents: [
                {
                    type: 'button',
                    style: 'primary',
                    action: {
                        type: 'uri',
                        label: buttonLabel,
                        uri: buttonUrl
                    },
                    color: statusColor
                }
            ]
        }
    }

    return bubble
}

export default {
    sendTextMessage,
    sendFlexMessage,
    sendRawMessages,
    createNotificationBubble,
    createStatusBubble
}
