# 🎤 Rev - Revolt Motors Voice Assistant

A real-time voice-based chatbot using Google's Gemini Live API, designed specifically for Revolt Motors. This application provides natural voice conversations with low latency, interruption support, and contextual responses limited to Revolt Motors topics.

## 🌟 Features

### Core Voice Functionality
- **Real-time Voice Conversation**: Natural voice input and AI-generated audio responses
- **Low Latency**: Response time under 2 seconds after user finishes speaking
- **Interruption Support**: Stop AI mid-speech and start speaking again
- **Multi-language Support**: Supports multiple languages through Gemini API
- **Audio Visualization**: Real-time visual feedback during recording

### Technical Capabilities
- **WebSocket Communication**: Real-time bidirectional communication
- **Audio Streaming**: Continuous audio processing and streaming
- **Session Management**: Persistent conversation sessions
- **Fallback Text Input**: Alternative text-based interaction
- **Responsive Design**: Works on desktop and mobile devices

### Revolt Motors Integration
- **Contextual AI**: Trained specifically for Revolt Motors topics
- **Brand Consistency**: Professional UI matching Revolt's brand
- **Topic Restriction**: Politely redirects non-Revolt queries

## 🏗️ Architecture

```
┌─────────────────┐    WebSocket    ┌─────────────────┐    HTTP/gRPC    ┌─────────────────┐
│                 │◄──────────────►│                 │◄──────────────►│                 │
│     Frontend    │                │   Node.js API   │                │   Gemini Live   │
│   (HTML/JS/CSS) │                │    (Express)    │                │      API        │
│                 │                │                 │                │                 │
└─────────────────┘                └─────────────────┘                └─────────────────┘
      │                                      │
      │                                      │
      ▼                                      ▼
┌─────────────────┐                ┌─────────────────┐
│  Web Audio API  │                │  Session Store  │
│  MediaRecorder  │                │  (In-Memory)    │
│  SpeechSynthesis│                │                 │
└─────────────────┘                └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher, v18+ recommended)
- **NPM** or **Yarn**
- **Google Gemini API Key** ([Get it here](https://aistudio.google.com/))
- **Modern Web Browser** with microphone support

**Note**: For Node.js versions < 18, this application includes fetch/Headers polyfills to ensure compatibility with the Gemini API.

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai_bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Create .env file
   echo "GEMINI_API_KEY=your_gemini_api_key_here" > .env
   echo "PORT=3000" >> .env
   echo "NODE_ENV=development" >> .env
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## 🎯 Usage

### Voice Interaction
1. **Grant microphone permission** when prompted
2. **Click the microphone button** or **press Space** to start recording
3. **Speak your question** about Revolt Motors
4. **Click stop** or **press Space again** to end recording
5. **Listen to the AI response**
6. **Press Escape** or **click stop** to interrupt AI speech

### Text Interaction
- Type your message in the text input field
- Press **Enter** or click the **send button**
- Receive text and voice responses

### Keyboard Shortcuts
- **Space**: Toggle voice recording (when not typing)
- **Escape**: Interrupt current conversation
- **Enter**: Send text message (when typing)

## 🎤 Voice Assistant Capabilities

### What Rev Can Help With
- **Electric Motorcycle Information**: RV400, RV1+ specifications
- **Battery Technology**: Battery swapping, charging, range details
- **Services**: Booking test rides, service appointments
- **Dealership Network**: Locations, contact information
- **MyRevolt App**: Features and functionality
- **Sustainability**: Environmental benefits, green transportation
- **Company Information**: About Revolt Motors, founder details

### Example Conversations
```
User: "Tell me about the RV400"
Rev: "The RV400 is Revolt's flagship electric motorcycle with a 3.24 kWh battery, 150km range, and our innovative battery swapping technology..."

User: "How do I book a test ride?"
Rev: "You can book a test ride through our MyRevolt app or by visiting any Revolt dealership. Would you like me to help you find the nearest dealership?"

User: "What's the weather like today?"
Rev: "I'm Rev, your Revolt Motors assistant. I can help you with information about our electric bikes, services, bookings, and dealership network. How can I assist you with Revolt today?"
```

## 🛠️ Technical Details

### Backend Components
- **Express Server**: HTTP server and static file serving
- **WebSocket Server**: Real-time communication
- **Gemini Integration**: AI model communication
- **Session Management**: User session tracking
- **Audio Processing**: Audio data handling

### Frontend Components
- **AudioProcessor**: Microphone recording and audio playback
- **VoiceAssistantApp**: Main application logic
- **UI Components**: Modern, responsive interface
- **WebSocket Client**: Real-time server communication

### Audio Pipeline
1. **Capture**: Web Audio API records user voice
2. **Encode**: Audio encoded as WebM/Opus
3. **Stream**: Base64 encoded audio sent via WebSocket
4. **Process**: Server processes with Gemini API
5. **Respond**: AI response sent back to client
6. **Synthesize**: Browser speaks AI response

## 🔧 Configuration

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
PORT=3000                    # Server port
NODE_ENV=development         # Environment mode
```

### Audio Settings
The application uses optimized audio settings:
- **Sample Rate**: 44.1kHz
- **Codec**: Opus (WebM container)
- **Echo Cancellation**: Enabled
- **Noise Suppression**: Enabled
- **Auto Gain Control**: Enabled

### Voice Synthesis Settings
- **Rate**: 1.0 (normal speed)
- **Pitch**: 1.0 (normal pitch)
- **Volume**: 0.8 (80% volume)
- **Language**: en-US (configurable)

## 🧪 Testing

### Manual Testing Checklist
- [ ] Microphone permission granted
- [ ] WebSocket connection established
- [ ] Voice recording starts/stops correctly
- [ ] Audio visualization works
- [ ] AI responses are relevant to Revolt Motors
- [ ] Text-to-speech works
- [ ] Interruption functionality works
- [ ] Non-Revolt topics are redirected
- [ ] Text fallback works
- [ ] Mobile responsiveness

### Performance Targets
- **Response Latency**: < 2 seconds
- **Audio Quality**: Clear recording and playback
- **Connection Stability**: Auto-reconnection on failure
- **Memory Usage**: Efficient cleanup after sessions

## 🚀 Deployment

### Production Setup
1. **Environment Configuration**
   ```bash
   NODE_ENV=production
   PORT=443
   GEMINI_API_KEY=your_production_api_key
   ```

2. **SSL Certificate** (for HTTPS/WSS)
   - Required for microphone access
   - Use Let's Encrypt or cloud provider certificates

3. **Process Management**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name revolt-voice-assistant
   ```

4. **Reverse Proxy** (Nginx example)
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Cloud Deployment
- **Heroku**: Use `Procfile` with `web: node server.js`
- **AWS/GCP**: Use PM2 or Docker container
- **Vercel**: Deploy with serverless functions
- **Railway**: Direct deployment from Git

## 🔍 Troubleshooting

### Common Issues

**Microphone Not Working**
- Ensure HTTPS connection (required for microphone access)
- Check browser permissions
- Verify microphone hardware

**WebSocket Connection Failed**
- Check server is running on correct port
- Verify firewall settings
- Check for proxy/load balancer issues

**AI Responses Not Working**
- Verify Gemini API key is correct and valid
- Check API quota and billing status
- Ensure using supported Gemini model (gemini-1.5-flash recommended)
- Monitor server logs for errors

**Audio Playback Issues**
- Check browser audio permissions
- Verify speakers/headphones
- Test with different browsers

### Debug Mode
Enable detailed logging:
```javascript
// In browser console
localStorage.setItem('debug', 'true');
// Reload page for verbose logging
```

## 📱 Browser Compatibility

### Supported Browsers
- **Chrome/Chromium**: 80+ (Recommended)
- **Firefox**: 75+
- **Safari**: 14+
- **Edge**: 80+

### Required Features
- WebRTC/MediaRecorder API
- WebSocket support
- Web Audio API
- Speech Synthesis API
- ES6+ JavaScript support

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Follow coding standards
4. Test thoroughly
5. Submit pull request

### Code Style
- Use ESLint configuration
- Follow semantic commit messages
- Add comments for complex logic
- Update README for new features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 References

- [Gemini Live API Documentation](https://ai.google.dev/gemini-api/docs/live)
- [Gemini AI Studio](https://aistudio.google.com/live)
- [Revolt Motors Website](https://www.revoltmotors.com/)
- [WebRTC API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)

## 📞 Support

For technical support or questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Built with ❤️ for Revolt Motors | Powered by Google Gemini AI** 