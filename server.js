const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Polyfill fetch and Headers for Node.js versions < 18
const fetch = require('node-fetch');
const { Headers, Request, Response } = require('node-fetch');

if (!globalThis.fetch) {
    globalThis.fetch = fetch;
    globalThis.Headers = Headers;
    globalThis.Request = Request;
    globalThis.Response = Response;
}

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Revolt Motors System Instruction  
const REVOLT_SYSTEM_INSTRUCTION = `You are Rev, the AI voice assistant for Revolt Motors. You are helpful, knowledgeable, and passionate about electric motorcycles.

IDENTITY & LANGUAGE:
- Introduce yourself naturally: "I am Rev, the AI voice assistant for Revolt Motors" 
- Respond in natural
- Be enthusiastic, friendly and helpful
- Speak like a knowledgeable friend, not a robot

CONVERSATION RULES:
- Focus only on Revolt Motors electric motorcycles and related topics
- For unrelated questions, politely redirect: "I am Rev, the AI voice assistant for Revolt Motors. How can I help you with our electric bikes today?"
- Give detailed, informative responses (not repetitive or generic)
- Keep spoken responses under 25 seconds but be comprehensive  
- Ask engaging follow-up questions to continue conversation
- Never give exactly the same response twice - vary your language and approach

REVOLT MOTORS KNOWLEDGE:
- RV400 and RV1+ electric motorcycle models
- Battery swapping technology and MyRevolt app features
- Pan-India dealership network and test ride booking process  
- Founded in 2019 by Rahul Sharma in Gurugram
- Pricing, specifications, features, and performance details
- Charging infrastructure and battery technology
- Service centers and customer support

CONVERSATION STYLE:
- Respond in natural
- Use relevant emojis occasionally 🏍️⚡🔋
- Be conversational and engaging
- Give specific details and examples
- Vary your responses - sometimes technical, sometimes simple  
- Ask different types of follow-up questions each time`;

// Initialize Gemini AI
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'test_key_for_demo') {
    console.warn('⚠️  Warning: Using demo API key. Please set a valid GEMINI_API_KEY in .env file');
    console.warn('💡 Get your API key from: https://aistudio.google.com/');
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Store active sessions
const activeSessions = new Map();

class VoiceSession {
    constructor(ws, sessionId) {
        this.ws = ws;
        this.sessionId = sessionId;
        this.isActive = false;
        this.currentModel = null;
        this.isProcessing = false;
        this.audioBuffer = [];
    }

    async initializeModel() {
        try {
            this.currentModel = genAI.getGenerativeModel({
                model: "gemini-1.5-flash", // Using stable model
                generationConfig: {
                    temperature: 0.7,
                    topP: 0.95,
                    maxOutputTokens: 200,
                }
            });
            
            console.log(`Session ${this.sessionId}: Model initialized`);
            return true;
        } catch (error) {
            console.error(`Session ${this.sessionId}: Model initialization failed:`, error);
            return false;
        }
    }

    async processAudioInput(audioData) {
        if (this.isProcessing) {
            console.log(`Session ${this.sessionId}: Already processing, queuing audio`);
            this.audioBuffer.push(audioData);
            return;
        }

        this.isProcessing = true;
        
        try {
            // Handle different audio data formats
            let userInput;
            
            if (audioData.text) {
                // Client-side transcription provided
                userInput = audioData.text;
                console.log(`Session ${this.sessionId}: Voice transcription received:`, userInput);
            } else {
                // Fallback for when client-side transcription fails
                console.log(`Session ${this.sessionId}: No transcription available, using generic voice prompt`);
                userInput = "User spoke in voice about Revolt Motors electric bikes.";
            }
            
            // Create contextual prompt with actual user input
            const promptWithContext = `${REVOLT_SYSTEM_INSTRUCTION}\n\nUser (via voice): ${userInput}\n\nRev:`;
            
            const result = await this.currentModel.generateContent(promptWithContext);
            const response = await result.response;
            const text = response.text();

            // Send response back to client
            this.ws.send(JSON.stringify({
                type: 'ai_response',
                text: text,
                sessionId: this.sessionId,
                timestamp: Date.now()
            }));

            console.log(`Session ${this.sessionId}: Voice response generated:`, text.substring(0, 100) + '...');

        } catch (error) {
            console.error(`Session ${this.sessionId}: Error processing audio:`, error);
            this.ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to process voice input',
                sessionId: this.sessionId
            }));
        } finally {
            this.isProcessing = false;
            
            // Process queued audio if any
            if (this.audioBuffer.length > 0) {
                const nextAudio = this.audioBuffer.shift();
                setImmediate(() => this.processAudioInput(nextAudio));
            }
        }
    }

    async processVoiceTextInput(text) {
        // This method handles transcribed voice input directly as text
        console.log(`Session ${this.sessionId}: Processing voice-to-text:`, text);
        
        // Use the same logic as processTextInput but mark it as voice input
        return this.processTextInput(text, true);
    }

    async processTextInput(text, isVoiceInput = false) {
        if (this.isProcessing) {
            console.log(`Session ${this.sessionId}: Already processing ${isVoiceInput ? 'voice' : 'text'} input`);
            return;
        }

        this.isProcessing = true;

        try {
            // Create different prompts for voice vs text input
            const inputType = isVoiceInput ? 'User (via voice)' : 'User';
            const promptWithContext = `${REVOLT_SYSTEM_INSTRUCTION}\n\n${inputType}: ${text}\n\nRev:`;
            
            const result = await this.currentModel.generateContent(promptWithContext);
            const response = await result.response;
            const responseText = response.text();

            this.ws.send(JSON.stringify({
                type: 'ai_response',
                text: responseText,
                sessionId: this.sessionId,
                isVoiceResponse: isVoiceInput,
                timestamp: Date.now()
            }));

            console.log(`Session ${this.sessionId}: ${isVoiceInput ? 'Voice' : 'Text'} response:`, responseText.substring(0, 100) + '...');

        } catch (error) {
            console.error(`Session ${this.sessionId}: Error processing ${isVoiceInput ? 'voice' : 'text'}:`, error);
            this.ws.send(JSON.stringify({
                type: 'error',
                message: `Failed to process ${isVoiceInput ? 'voice' : 'text'} input`,
                sessionId: this.sessionId
            }));
        } finally {
            this.isProcessing = false;
        }
    }

    interrupt() {
        console.log(`Session ${this.sessionId}: Interruption triggered`);
        this.isProcessing = false;
        this.audioBuffer = [];
        
        this.ws.send(JSON.stringify({
            type: 'interrupted',
            sessionId: this.sessionId,
            timestamp: Date.now()
        }));
    }

    cleanup() {
        this.isActive = false;
        this.currentModel = null;
        this.audioBuffer = [];
        console.log(`Session ${this.sessionId}: Cleaned up`);
    }
}

// WebSocket connection handling
wss.on('connection', async (ws, req) => {
    const sessionId = uuidv4();
    const session = new VoiceSession(ws, sessionId);
    
    activeSessions.set(sessionId, session);
    console.log(`New session connected: ${sessionId}`);

    // Initialize the AI model
    const modelReady = await session.initializeModel();
    
    ws.send(JSON.stringify({
        type: 'session_ready',
        sessionId: sessionId,
        modelReady: modelReady,
        timestamp: Date.now()
    }));

    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'audio_data':
                    await session.processAudioInput(data.audio);
                    break;
                    
                case 'voice_text_input':
                    // Handle transcribed voice input
                    await session.processTextInput(data.text, true);
                    break;
                    
                case 'text_input':
                    await session.processTextInput(data.text);
                    break;
                    
                case 'interrupt':
                    session.interrupt();
                    break;
                    
                case 'ping':
                    ws.send(JSON.stringify({ type: 'pong', timestamp: Date.now() }));
                    break;
                    
                default:
                    console.log(`Session ${sessionId}: Unknown message type:`, data.type);
            }
        } catch (error) {
            console.error(`Session ${sessionId}: Error processing message:`, error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
                sessionId: sessionId
            }));
        }
    });

    ws.on('close', () => {
        session.cleanup();
        activeSessions.delete(sessionId);
        console.log(`Session disconnected: ${sessionId}`);
    });

    ws.on('error', (error) => {
        console.error(`Session ${sessionId}: WebSocket error:`, error);
        session.cleanup();
        activeSessions.delete(sessionId);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        activeSessions: activeSessions.size,
        timestamp: new Date().toISOString()
    });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Revolt Voice Assistant Server running on port ${PORT}`);
    console.log(`📱 Access the app at: http://localhost:${PORT}`);
    console.log(`🔊 WebSocket server ready for voice connections`);
}); 