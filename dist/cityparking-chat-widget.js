/**
 * CityParking Chat Widget
 * A deployable chat widget for customer support with handover capabilities
 * Version: 1.0.0
 * Author: RingRing
 * 
 * Usage:
 * Single script tag with data attributes:
 * <script 
 *   src="https://your-cdn.com/cityparking-chat-widget.js"
 *   data-webhook-url="https://your-n8n-instance.com/webhook/your-webhook-id"
 *   data-language="nl"
 *   data-primary-color="#009648"
 *   data-position="bottom-right">
 * </script>
 * 
 * Or programmatic initialization:
 * <script src="https://your-cdn.com/cityparking-chat-widget.js"></script>
 * <script>
 *   window.initCityparkingWidget({
 *     webhookUrl: 'https://your-n8n-instance.com/webhook/your-webhook-id',
 *     language: 'nl', // optional: 'en', 'nl', 'fr'
 *     theme: {
 *       primaryColor: '#009648',
 *       position: 'bottom-right' // optional: 'bottom-left', 'bottom-right'
 *     }
 *   });
 * </script>
 */

class CityparkingChatWidget extends HTMLElement {
    constructor(config = {}) {
        super();
        this.attachShadow({ mode: 'open' });
        this.noAnswerCount = 0;
        this.isCollectingUserInfo = false;
        this.isGeneratingResponse = false;
        this.conversationHistory = [];
        
        // Configuration with defaults
        this.config = {
            webhookUrl: config.webhookUrl || config.chatUrl || null, // No default - must be provided
            language: config.language || document.documentElement.lang?.toLowerCase() || 'en',
            theme: {
                primaryColor: config.theme?.primaryColor || '#009648',
                position: config.theme?.position || 'bottom-right',
                ...config.theme
            }
        };
        
        // Generate session token
        this.sessionToken = this.generateSessionToken();
        
        // Embedded messages (no external dependencies)
        this.messages = {
            welcome: {
                en: "Welcome! I am Cue, your digital assistant powered by AI! 👋\nI'm here to help you with parking questions in Doornik.\n\nYou can ask questions about:\n• Parking zones\n• Resident permits\n• Parking fees\n• Special permits",
                nl: "Welkom! Ik ben Cue, uw digitale assistent gemaakt door AI! 👋\nIk ben hier om je te helpen met vragen over parkeren in Doornik.\n\nJe kunt vragen stellen over:\n• Parkeerzones\n• Residentenpermissies\n• Parkeergeld\n• Speciale permissies",
                fr: "Bienvenue! Je suis Cue, votre assistant digitale alimenté par l'IA! 👋\nJe suis là pour vous aider avec vos questions sur le stationnement à Tournai.\n\nVous pouvez poser des questions sur:\n• Zones de stationnement\n• Permis de résident\n• Frais de stationnement\n• Permis spéciaux"
            },
            confirmation: {
                question: {
                    en: "Would you like Cityparking to handle your question?",
                    nl: "Wilt u dat Cityparking uw vraag behandelt?",
                    fr: "Souhaitez-vous que Cityparking traite votre question?"
                },
                buttons: {
                    yes: {
                        en: "Yes, please",
                        nl: "Ja, graag",
                        fr: "Oui, s'il vous plaît"
                    },
                    no: {
                        en: "No, thanks",
                        nl: "Nee, bedankt",
                        fr: "Non, merci"
                    }
                },
                decline: {
                    en: "No problem! Feel free to ask another question.",
                    nl: "Geen probleem! Stel gerust een andere vraag.",
                    fr: "Pas de problème ! N'hésitez pas à poser une autre question."
                }
            },
            errors: {
                general: {
                    en: "Sorry, I encountered an error. Please try again.",
                    nl: "Sorry, er is een fout opgetreden. Probeer het opnieuw.",
                    fr: "Désolé, j'ai rencontré une erreur. Veuillez réessayer."
                },
                submitInfo: {
                    en: "Sorry, I encountered an error submitting your information.",
                    nl: "Sorry, er is een fout opgetreden bij het versturen van uw gegevens.",
                    fr: "Désolé, j'ai rencontré une erreur lors de l'envoi de vos informations."
                }
            },
            userInfo: {
                formTitle: {
                    en: "Contact Support",
                    nl: "Contacteer Support",
                    fr: "Contacter le Support"
                },
                firstName: {
                    en: "First Name",
                    nl: "Voornaam",
                    fr: "Prénom"
                },
                lastName: {
                    en: "Last Name",
                    nl: "Achternaam",
                    fr: "Nom de famille"
                },
                email: {
                    en: "Email Address",
                    nl: "E-mailadres",
                    fr: "Adresse e-mail"
                },
                phone: {
                    en: "Phone Number",
                    nl: "Telefoonnummer",
                    fr: "Numéro de téléphone"
                },
                question: {
                    en: "Your Question",
                    nl: "Jouw vraag",
                    fr: "Votre question"
                },
                submitButton: {
                    en: "Submit",
                    nl: "Verzenden",
                    fr: "Soumettre"
                },
                submitting: {
                    en: "Submitting...",
                    nl: "Verzenden...",
                    fr: "Envoi en cours..."
                },
                validation: {
                    required: {
                        en: "Please fill out all required fields.",
                        nl: "Vul alstublieft alle verplichte velden in.",
                        fr: "Veuillez remplir tous les champs obligatoires."
                    },
                    email: {
                        en: "Please enter a valid email address (e.g., name@example.com)",
                        nl: "Voer een geldig e-mailadres in (bijv. naam@voorbeeld.com)",
                        fr: "Veuillez entrer une adresse e-mail valide (ex: nom@exemple.com)"
                    },
                                    phone: {
                    en: "Please enter a valid Belgian phone number (mobile: 0470123456 or landline: 021234567)",
                    nl: "Voer een geldig Belgisch telefoonnummer in (mobiel: 0470123456 of vast: 021234567)",
                    fr: "Veuillez entrer un numéro de téléphone belge valide (mobile: 0470123456 ou fixe: 021234567)"
                }
                },
                success: {
                    en: "Thank you! Your information has been sent to our support team.",
                    nl: "Bedankt! Uw informatie is verzonden naar ons supportteam.",
                    fr: "Merci ! Vos informations ont été envoyées à notre équipe de support."
                },
                placeholders: {
                    firstName: {
                        en: "Enter your first name",
                        nl: "Voer uw voornaam in",
                        fr: "Entrez votre prénom"
                    },
                    lastName: {
                        en: "Enter your last name",
                        nl: "Voer uw achternaam in",
                        fr: "Entrez votre nom de famille"
                    },
                    email: {
                        en: "e.g., name@example.com",
                        nl: "bijv. naam@voorbeeld.com",
                        fr: "ex: nom@exemple.com"
                    },
                    phone: {
                        en: "e.g., 0470123456 or 02123456   ",
                        nl: "bijv. 0470123456 of 02123456",
                        fr: "ex: 0470123456 ou 02123456"
                    },
                    question: {
                        en: "Describe your parking question or issue...",
                        nl: "Beschrijf uw parkeervraag of probleem...",
                        fr: "Décrivez votre question ou problème de stationnement..."
                    }
                }
            },
            placeholder: {
                en: "What are you looking for?",
                nl: "Waar ben je naar op zoek?",
                fr: "Que recherchez-vous?"
            },
            sourceButton: {
                en: "Source",
                nl: "Bron",
                fr: "Source"
            }
        };

        
        this.createWidget();
        this.initialize();
        
        // Track actual conversation language (may differ from config language)
        this.conversationLanguage = this.config.language;
    }
    
    generateSessionToken() {
        return 'widget_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    createWidget() {
        const position = this.config.theme.position;
        const isLeft = position.includes('left');
        
        // Create widget styles with theme support
        const styles = `
            :host {
                --widget-height: 600px;
                --widget-width: 350px;
                --primary-color: ${this.config.theme.primaryColor};
                --secondary-color: #f8f9fa;
                --header-color: ${this.config.theme.primaryColor};
                font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
            }
            
            .chat-widget {
                position: fixed;
                bottom: 20px;
                ${isLeft ? 'left' : 'right'}: 20px;
                z-index: 1000;
            }
            
            .chat-button {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: var(--primary-color);
                border: none;
                cursor: pointer;
                position: fixed;
                bottom: 20px;
                ${isLeft ? 'left' : 'right'}: 20px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
                transition: transform 0.2s;
                color: white;
                font-size: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .chat-button:hover {
                transform: scale(1.1);
            }
            
            .chat-container {
                position: fixed;
                bottom: 90px;
                ${isLeft ? 'left' : 'right'}: 20px;
                width: var(--widget-width);
                height: var(--widget-height);
                background: white;
                border-radius: 15px;
                box-shadow: 0 5px 20px rgba(0,0,0,0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
            }
            
            .chat-container.active {
                display: flex;
            }
            
            .chat-header {
                background: var(--primary-color);
                color: white;
                padding: 20px;
                font-weight: normal;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: relative;
            }
            
            .close-button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                line-height: 1;
            }
            
            .close-button:hover {
                opacity: 0.8;
            }
            
            .chat-messages {
                flex-grow: 1;
                padding: 20px;
                overflow-y: auto;
                display: flex;
                flex-direction: column;
                gap: 16px;
                background: #f8fafc;
            }
            
            .message {
                max-width: 85%;
                padding: 12px 16px;
                border-radius: 20px;
                margin: 2px 0;
                font-size: 14px;
                line-height: 1.4;
                font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
            }
            
            .user-message {
                background: #1e293b;
                color: white;
                align-self: flex-end;
                border-radius: 16px;
                padding: 12px 16px;
                font-size: 14px;
                line-height: 1.5;
                max-width: 80%;
            }
            
            .bot-message-container {
                display: flex;
                justify-content: flex-start;
                max-width: 80%;
                align-self: flex-start;
            }
            
            .bot-message {
                background: white;
                color: #1e293b;
                border: 1px solid #e2e8f0;
                border-radius: 16px;
                margin: 0;
                line-height: 1.5;
                white-space: pre-wrap;
                padding: 16px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                width: 100%;
            }
            
            .bot-header {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 8px;
            }
            
            .bot-avatar {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--primary-color);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: bold;
                font-size: 11px;
                flex-shrink: 0;
            }
            
            .bot-label {
                font-size: 12px;
                font-weight: 600;
                color: #64748b;
            }
            
            .bot-message-text {
                font-size: 14px;
                line-height: 1.5;
                color: #1e293b;
            }
            
            .chat-input {
                display: flex;
                padding: 15px;
                background: white;
                border-top: 1px solid #eee;
            }
            
            .chat-input input {
                flex-grow: 1;
                padding: 12px;
                border: 1px solid #eee;
                border-radius: 25px;
                margin-right: 10px;
                font-size: 14px;
                font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
            }
            
            .chat-input input:focus {
                outline: none;
                border-color: var(--primary-color);
            }
            
            .chat-input input:disabled {
                background-color: #f5f5f5;
                cursor: not-allowed;
            }
            
            .chat-input button {
                width: 40px;
                height: 40px;
                background: var(--primary-color);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 20px;
            }
            
            .chat-input button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .sources {
                font-size: 0.8em;
                margin-top: 8px;
                display: flex;
                gap: 8px;
            }
            
            .source-button {
                padding: 6px 12px;
                background: white;
                color: var(--primary-color);
                border: 1px solid var(--primary-color);
                border-radius: 15px;
                cursor: pointer;
                font-size: 12px;
                transition: all 0.2s;
            }
            
            .source-button:hover {
                background: var(--primary-color);
                color: white;
            }
            
            .action-buttons {
                display: flex;
                gap: 10px;
                margin-top: 10px;
            }
            
            .action-button {
                padding: 6px 12px;
                border-radius: 16px;
                cursor: pointer;
                font-size: 12px;
                border: 1px solid var(--primary-color);
                transition: all 0.2s;
            }
            
            .action-button.primary {
                background: white;
                color: var(--primary-color);
            }
            
            .action-button.secondary {
                background: white;
                color: var(--primary-color);
            }
            
            .action-button:hover {
                opacity: 0.9;
            }
            
            .typing-indicator {
                display: flex;
                gap: 4px;
                padding: 8px 12px;
                background: #f0f0f0;
                border-radius: 10px;
                width: fit-content;
            }
            
            .typing-dot {
                width: 6px;
                height: 6px;
                background: var(--primary-color);
                border-radius: 50%;
                opacity: 0.3;
                animation: typingAnimation 1.4s infinite;
            }
            
            .typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typingAnimation {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            
            .powered-by {
                text-align: center;
                padding: 8px;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #eee;
            }
            
            .powered-by a {
                color: var(--primary-color);
                text-decoration: none;
            }
            
            .powered-by a:hover {
                text-decoration: underline;
            }

            .user-info-form-container {
                flex-grow: 1;
                padding: 20px;
                overflow-y: auto;
                background: white;
                display: none;
            }

            .user-info-form h3 {
                margin-top: 0;
                font-size: 16px;
                text-align: center;
                color: #333;
            }

            .form-field {
                margin-bottom: 10px;
            }

            .form-field label {
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
                color: #555;
            }

            .form-field input,
            .form-field textarea {
                width: 100%;
                padding: 8px;
                font-size: 12px;
                border: 1px solid #ddd;
                border-radius: 8px;
                box-sizing: border-box;
            }

            .form-field input::placeholder,
            .form-field textarea::placeholder {
                color: #999;
                opacity: 1;
            }

            .form-field input.error,
            .form-field textarea.error {
                border-color: #e74c3c;
                background-color: #fdf2f2;
            }

            .form-field input.error:focus,
            .form-field textarea.error:focus {
                border-color: #e74c3c;
                box-shadow: 0 0 0 2px rgba(231, 76, 60, 0.2);
            }

            .field-error {
                color: #e74c3c;
                font-size: 11px;
                margin-top: 3px;
                display: block;
            }

            .form-field textarea {
                resize: vertical;
                min-height: 100px;
            }

            .form-submit-button {
                width: 100%;
                padding: 12px;
                background-color: var(--primary-color);
                color: white;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 16px;
                margin-top: 10px;
                transition: background-color 0.2s;
            }

            .form-submit-button:disabled {
                background-color: #ccc;
                cursor: not-allowed;
            }

            .form-submit-button:hover:not(:disabled) {
                opacity: 0.9;
            }
        `;
        
        // Create widget HTML
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="chat-widget">
                <button class="chat-button">💬</button>
                <div class="chat-container">
                    <div class="chat-header">
                        <span>Cityparking Assistant</span>
                        <button class="close-button">×</button>
                    </div>
                    <div class="chat-messages"></div>
                    <div class="user-info-form-container"></div>
                    <div class="chat-input">
                        <input type="text" placeholder="${this.messages.placeholder[this.config.language] || this.messages.placeholder.en}">
                        <button>➤</button>
                    </div>
                    <div class="powered-by">
                        Powered by <a href="https://www.ringring.be" target="_blank">RingRing</a>
                    </div>
                </div>
            </div>
        `;
    }
    
    initialize() {
        const chatButton = this.shadowRoot.querySelector('.chat-button');
        const chatContainer = this.shadowRoot.querySelector('.chat-container');
        const closeButton = this.shadowRoot.querySelector('.close-button');
        const input = this.shadowRoot.querySelector('input');
        const sendButton = this.shadowRoot.querySelector('.chat-input button');
        const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
        
        // Add welcome message
        const welcomeMessage = this.messages.welcome[this.config.language] || this.messages.welcome.en;
        this.addMessage(welcomeMessage, 'bot', [], true);
        
        // Toggle chat window
        chatButton.addEventListener('click', () => {
            if (chatContainer.classList.contains('active')) {
                chatContainer.classList.remove('active');
            } else {
                chatContainer.classList.add('active');
                input.focus();
            }
        });
        
        closeButton.addEventListener('click', () => {
            chatContainer.classList.remove('active');
            this.resetWidgetState();
        });
        
        sendButton.addEventListener('click', () => this.sendMessage());
        
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }
    
    setInputState(enabled) {
        const input = this.shadowRoot.querySelector('.chat-input input');
        const button = this.shadowRoot.querySelector('.chat-input button');
        
        input.disabled = !enabled;
        button.disabled = !enabled;
        
        if (enabled) {
            input.focus();
        }
    }

    resetWidgetState() {
        // Generate new session token
        this.sessionToken = this.generateSessionToken();
        
        // Reset conversation language to config default
        this.conversationLanguage = this.config.language;
        
        // Clear conversation history if it exists
        if (this.conversationHistory) {
            this.conversationHistory = [];
        }
        
        // Reset any flags
        this.isGeneratingResponse = false;
        
        // Clear chat messages
        const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
        messagesContainer.innerHTML = '';
        
        // Hide form if it's visible
        this.hideUserInfoForm();
        
        // Clear input field
        const input = this.shadowRoot.querySelector('.chat-input input');
        input.value = '';
        
        // Re-enable input
        this.setInputState(true);
        
        // Add fresh welcome message
        const welcomeMessage = this.messages.welcome[this.config.language] || this.messages.welcome.en;
        this.addMessage(welcomeMessage, 'bot', [], true);
        
        console.log('Widget state reset. New session:', this.sessionToken);
    }

    sendActionMessage(payload, buttonText = null, language = null) {
        // Use the actual button text that was clicked, or fallback to payload
        const displayText = buttonText || payload;
        this.addMessage(displayText, 'user');
        
        // Special handling for handover_request_yes - show form directly without webhook call
        if (payload === 'handover_request_yes') {
            this.showUserInfoForm();
            return;
        }
        
        // For other actions (including handover_request_no), proceed with webhook call
        this.setInputState(false);
        this.isGeneratingResponse = true;
        
        // Send to webhook with language information
        this.sendMessageToWebhook(payload, language);
    }

    async sendMessageToWebhook(message, language = null) {
        try {
            const payload = {
                chatInput: message,
                sessionId: this.sessionToken,
                pageUrl: window.location.href,
                pageTitle: document.title,
                referrer: document.referrer || null
            };
            
            // Include language if provided (for action responses)
            if (language) {
                payload.language = language;
            }
            
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const jsonResponse = await response.json();
            
            if (jsonResponse.response) {
                this.addMessage(jsonResponse.response, 'bot');
                
                // Show form if this is a handover confirmation
                if (message === 'handover_request_yes') {
                    this.showUserInfoForm();
                }
            }
            
        } catch (error) {
            console.error('Error sending action message:', error);
            this.addMessage(this.messages.errors.general[this.config.language] || this.messages.errors.general.en, 'bot');
        } finally {
            this.isGeneratingResponse = false;
            this.setInputState(true);
        }
    }

    async sendMessage() {
        const input = this.shadowRoot.querySelector('input');
        const message = input.value.trim();
        
        if (!message || this.isGeneratingResponse) return;
        
        if (this.isCollectingUserInfo) {
            return;
        }
        
        this.isGeneratingResponse = true;
        this.setInputState(false);
        
        this.addMessage(message, 'user');
        input.value = '';
        
        try {
            // Create message container with loading animation
            const containerDiv = document.createElement('div');
            containerDiv.classList.add('bot-message-container');
            
            const loadingDiv = document.createElement('div');
            loadingDiv.classList.add('typing-indicator');
            for (let i = 0; i < 3; i++) {
                const dot = document.createElement('div');
                dot.classList.add('typing-dot');
                loadingDiv.appendChild(dot);
            }
            
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('bot-message');
            messageDiv.style.display = 'none';
            
            // Create bot header with avatar and label (will be shown when message appears)
            const botHeader = document.createElement('div');
            botHeader.classList.add('bot-header');
            
            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('bot-avatar');
            avatarDiv.textContent = 'C';
            
            const labelDiv = document.createElement('span');
            labelDiv.classList.add('bot-label');
            labelDiv.textContent = 'Assistant';
            
            botHeader.appendChild(avatarDiv);
            botHeader.appendChild(labelDiv);
            
            // Create message text container
            const messageText = document.createElement('div');
            messageText.classList.add('bot-message-text');
            
            messageDiv.appendChild(botHeader);
            messageDiv.appendChild(messageText);
            
            containerDiv.appendChild(loadingDiv);
            containerDiv.appendChild(messageDiv);
            
            const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
            messagesContainer.appendChild(containerDiv);
            
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatInput: message,
                    sessionId: this.sessionToken
                })
            });

            // Check if response is streaming or simple JSON
            const contentType = response.headers.get('content-type') || '';
            const isStreaming = contentType.includes('text/plain') || contentType.includes('text/event-stream');
            
            if (!isStreaming) {
                // Handle simple JSON response
                const jsonResponse = await response.json();
                
                loadingDiv.remove();
                messageDiv.style.display = 'block';
                
                if (jsonResponse.response) {
                    // Handle n8n format: {"response": "text", "actions": [], "sources": []}
                    let formattedContent = jsonResponse.response.replace(/\*\*/g, '');
                    messageText.textContent = formattedContent;
                    
                    // Update conversation language if provided in response
                    if (jsonResponse.sessionData && jsonResponse.sessionData.language) {
                        this.conversationLanguage = jsonResponse.sessionData.language;
                    } else if (jsonResponse.language) {
                        this.conversationLanguage = jsonResponse.language;
                    }
                    
                    // Handle actions (URL and message buttons)
                    if (jsonResponse.actions && jsonResponse.actions.length > 0) {
                        const actionsDiv = document.createElement('div');
                        actionsDiv.classList.add('action-buttons');
                        
                        // Store the language from this response for action buttons
                        const responseLanguage = jsonResponse.language || this.conversationLanguage;
                        
                        jsonResponse.actions.forEach((action) => {
                            const button = document.createElement('button');
                            button.textContent = action.text || 'Action';
                            
                            if (action.type === 'url') {
                                button.classList.add('source-button');
                                button.addEventListener('click', () => {
                                    window.open(action.payload, '_blank');
                                });
                            } else if (action.type === 'message') {
                                button.classList.add('action-button', 'primary');
                                button.addEventListener('click', () => {
                                    // Send payload, button text, and language back to n8n
                                    this.sendActionMessage(action.payload, action.text, responseLanguage);
                                });
                            }
                            
                            actionsDiv.appendChild(button);
                        });
                        
                        messageDiv.appendChild(actionsDiv);
                    }
                    
                    // Handle sources array (fallback if no actions)
                    else if (jsonResponse.sources && jsonResponse.sources.length > 0) {
                        const sourcesDiv = document.createElement('div');
                        sourcesDiv.classList.add('sources');
                        
                        const topSources = jsonResponse.sources.slice(0, 2);
                        const sourceText = this.messages.sourceButton[this.config.language] || this.messages.sourceButton.en;
                        
                        topSources.forEach((source, index) => {
                            const button = document.createElement('button');
                            button.classList.add('source-button');
                            button.textContent = `${sourceText} ${index + 1}`;
                            button.addEventListener('click', () => {
                                window.open(source, '_blank');
                            });
                            sourcesDiv.appendChild(button);
                        });
                        
                        messageDiv.appendChild(sourcesDiv);
                    }
                    
                } else if (jsonResponse.content) {
                    // Handle direct content: {"content": "text"}
                    let formattedContent = jsonResponse.content.replace(/\*\*/g, '');
                    messageText.textContent = formattedContent;
                } else {
                    // Fallback: display the entire response
                    messageText.textContent = JSON.stringify(jsonResponse);
                }
                
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                return;
            }

            // Handle streaming response (original code)
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            
            let needsUserInfo = false;
            let firstToken = true;
            
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());
                
                for (const line of lines) {
                    try {
                        const data = JSON.parse(line);
                        
                        if (firstToken) {
                            loadingDiv.remove();
                            messageDiv.style.display = 'block';
                            firstToken = false;
                        }
                        
                        switch (data.type) {
                            case 'token':
                                let formattedToken = data.content.replace(/\*\*/g, '');
                                
                                if (formattedToken.includes('•')) {
                                    formattedToken = `<br>• ${formattedToken.replace('•', '')}`;
                                }
                                
                                if (formattedToken.includes('\n')) {
                                    formattedToken = formattedToken.replace(/\n/g, '<br>');
                                }
                                
                                if (/[.!?]/.test(formattedToken)) {
                                    formattedToken += ' ';
                                }
                                
                                messageText.innerHTML += formattedToken;
                                this.scrollToBottom();
                                break;
                                
                            case 'rephrase':
                                this.noAnswerCount++;
                                messageDiv.textContent = data.content;
                                this.scrollToBottom();
                                break;
                                
                            case 'needsUserInfo':
                                if (data.content) {
                                    messageDiv.textContent = this.messages.confirmation.question[this.config.language] || this.messages.confirmation.question.en;
                                    const wantsHelp = await this.handleConfirmation(messageDiv);
                                    if (wantsHelp) {
                                        needsUserInfo = true;
                                    } else {
                                        this.noAnswerCount = 0;
                                    }
                                } else {
                                    this.noAnswerCount = 0;
                                }
                                break;
                                
                            case 'showForm':
                                if (firstToken) {
                                    loadingDiv.remove();
                                    messageDiv.style.display = 'none';
                                    firstToken = false;
                                }
                                this.showUserInfoForm();
                                break;
                                
                            case 'sources':
                                if (data.content && data.content.length > 0) {
                                    const sourcesDiv = document.createElement('div');
                                    sourcesDiv.classList.add('sources');
                                    
                                    const topSources = data.content.slice(0, 2);
                                    const sourceText = this.messages.sourceButton[this.config.language] || this.messages.sourceButton.en;
                                    
                                    topSources.forEach((source, index) => {
                                        const button = document.createElement('button');
                                        button.classList.add('source-button');
                                        button.textContent = `${sourceText} ${index + 1}`;
                                        button.addEventListener('click', () => {
                                            window.open(source, '_blank');
                                        });
                                        sourcesDiv.appendChild(button);
                                    });
                                    
                                    messageDiv.appendChild(sourcesDiv);
                                    this.scrollToBottom();
                                }
                                break;
                                
                            case 'error':
                                messageDiv.textContent = this.messages.errors.general[this.config.language] || this.messages.errors.general.en;
                                this.scrollToBottom();
                                break;
                        }
                    } catch (e) {
                        console.error('Error parsing response:', e);
                    }
                }
            }
            
            if (needsUserInfo) {
                this.showUserInfoForm();
                this.noAnswerCount = 0;
            }
            
        } catch (error) {
            console.error('Error:', error);
            this.addMessage(this.messages.errors.general[this.config.language] || this.messages.errors.general.en, 'bot');
        } finally {
            this.isGeneratingResponse = false;
            this.setInputState(true);
        }
    }
    
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateBelgianPhone(phone) {
        // Clean the phone number (remove spaces, dots, slashes, parentheses)
        const cleanPhone = phone.replace(/[\s.\-\/\(\)]/g, '');
        
        // Belgian Mobile Numbers: Specific operator prefixes
        // Proximus: 047X, Mobile Vikings: 0456, Telenet: 0467/0468
        // Orange: 049X, Hey!: 0466, VOO: 0455
        // Base/Telenet: 048X, Lycamobile: 0465
        const mobileRegex = /^(\+32(455|456|465|466|467|468|47\d|48\d|49\d)\d{6}|0(455|456|465|466|467|468|47\d|48\d|49\d)\d{6})$/;
        
        // Belgian Landline Numbers: Valid area codes only
        const landlineRegex = /^(\+32[23579]\d{7,8}|0[23579]\d{7,8}|\+321[0-6]\d{6,7}|01[0-6]\d{6,7}|\+325[0-9]\d{6,7}|05[0-9]\d{6,7}|\+326[0-9]\d{6,7}|06[0-9]\d{6,7}|\+3271\d{6}|071\d{6}|\+328[0-7,9]\d{6,7}|08[0-7,9]\d{6,7})$/;
        
        return mobileRegex.test(cleanPhone) || landlineRegex.test(cleanPhone);
    }
    
    showFieldError(fieldId, message) {
        const field = this.shadowRoot.querySelector(`#${fieldId}`);
        const fieldContainer = field.closest('.form-field');
        
        // Add error class to input
        field.classList.add('error');
        
        // Remove any existing error message
        const existingError = fieldContainer.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        fieldContainer.appendChild(errorDiv);
        
        // Remove error styling when user starts typing
        const clearError = () => {
            field.classList.remove('error');
            errorDiv.remove();
            field.removeEventListener('input', clearError);
        };
        field.addEventListener('input', clearError);
    }
    
    clearFieldErrors() {
        const form = this.shadowRoot.querySelector('.user-info-form');
        const errorInputs = form.querySelectorAll('input.error, textarea.error');
        const errorMessages = form.querySelectorAll('.field-error');
        
        errorInputs.forEach(input => input.classList.remove('error'));
        errorMessages.forEach(error => error.remove());
    }
    
    showUserInfoForm() {
        const formContainer = this.shadowRoot.querySelector('.user-info-form-container');
        const chatMessages = this.shadowRoot.querySelector('.chat-messages');
        const chatInput = this.shadowRoot.querySelector('.chat-input');

        // Use conversation language (actual chat language) instead of config language
        const formLanguage = this.conversationLanguage || this.config.language;
        
        const formHtml = `
            <div class="user-info-form">
                <h3>${this.messages.userInfo.formTitle[formLanguage] || this.messages.userInfo.formTitle.en}</h3>
                <div class="form-field">
                    <label for="firstName">${this.messages.userInfo.firstName[formLanguage] || this.messages.userInfo.firstName.en}</label>
                    <input type="text" id="firstName" name="firstName" required placeholder="${this.messages.userInfo.placeholders.firstName[formLanguage] || this.messages.userInfo.placeholders.firstName.en}">
                </div>
                <div class="form-field">
                    <label for="lastName">${this.messages.userInfo.lastName[formLanguage] || this.messages.userInfo.lastName.en}</label>
                    <input type="text" id="lastName" name="lastName" required placeholder="${this.messages.userInfo.placeholders.lastName[formLanguage] || this.messages.userInfo.placeholders.lastName.en}">
                </div>
                <div class="form-field">
                    <label for="email">${this.messages.userInfo.email[formLanguage] || this.messages.userInfo.email.en}</label>
                    <input type="email" id="email" name="email" required placeholder="${this.messages.userInfo.placeholders.email[formLanguage] || this.messages.userInfo.placeholders.email.en}">
                </div>
                <div class="form-field">
                    <label for="phone">${this.messages.userInfo.phone[formLanguage] || this.messages.userInfo.phone.en}</label>
                    <input type="tel" id="phone" name="phone" required placeholder="${this.messages.userInfo.placeholders.phone[formLanguage] || this.messages.userInfo.placeholders.phone.en}">
                </div>
                <div class="form-field">
                    <label for="question">${this.messages.userInfo.question[formLanguage] || this.messages.userInfo.question.en}</label>
                    <textarea id="question" name="question" required placeholder="${this.messages.userInfo.placeholders.question[formLanguage] || this.messages.userInfo.placeholders.question.en}"></textarea>
                </div>
                <button class="form-submit-button">${this.messages.userInfo.submitButton[formLanguage] || this.messages.userInfo.submitButton.en}</button>
            </div>
        `;

        formContainer.innerHTML = formHtml;
        chatMessages.style.display = 'none';
        chatInput.style.display = 'none';
        formContainer.style.display = 'block';

        const submitButton = formContainer.querySelector('.form-submit-button');
        submitButton.addEventListener('click', () => this.handleFormSubmit());
    }

    hideUserInfoForm() {
        const formContainer = this.shadowRoot.querySelector('.user-info-form-container');
        const chatMessages = this.shadowRoot.querySelector('.chat-messages');
        const chatInput = this.shadowRoot.querySelector('.chat-input');

        formContainer.innerHTML = '';
        formContainer.style.display = 'none';
        chatMessages.style.display = 'flex';
        chatInput.style.display = 'flex';
    }

    async handleFormSubmit() {
        const form = this.shadowRoot.querySelector('.user-info-form');
        const submitButton = form.querySelector('.form-submit-button');
        
        const firstNameInput = form.querySelector('#firstName');
        const lastNameInput = form.querySelector('#lastName');
        const emailInput = form.querySelector('#email');
        const phoneInput = form.querySelector('#phone');
        const questionInput = form.querySelector('#question');
        
        const firstName = firstNameInput.value.trim();
        const lastName = lastNameInput.value.trim();
        const email = emailInput.value.trim();
        const phone = phoneInput.value.trim();
        const question = questionInput.value.trim();

        // Use conversation language for validation messages
        const formLanguage = this.conversationLanguage || this.config.language;
        
        // Clear previous errors
        this.clearFieldErrors();
        
        let hasErrors = false;
        
        // Validate required fields
        if (!firstName) {
            this.showFieldError('firstName', this.messages.userInfo.validation.required[formLanguage] || this.messages.userInfo.validation.required.en);
            hasErrors = true;
        }
        
        if (!lastName) {
            this.showFieldError('lastName', this.messages.userInfo.validation.required[formLanguage] || this.messages.userInfo.validation.required.en);
            hasErrors = true;
        }
        
        if (!question) {
            this.showFieldError('question', this.messages.userInfo.validation.required[formLanguage] || this.messages.userInfo.validation.required.en);
            hasErrors = true;
        }

        // Validate email format
        if (email && !this.validateEmail(email)) {
            this.showFieldError('email', this.messages.userInfo.validation.email[formLanguage] || this.messages.userInfo.validation.email.en);
            hasErrors = true;
        } else if (!email) {
            this.showFieldError('email', this.messages.userInfo.validation.required[formLanguage] || this.messages.userInfo.validation.required.en);
            hasErrors = true;
        }

        // Validate phone format
        if (phone && !this.validateBelgianPhone(phone)) {
            this.showFieldError('phone', this.messages.userInfo.validation.phone[formLanguage] || this.messages.userInfo.validation.phone.en);
            hasErrors = true;
        } else if (!phone) {
            this.showFieldError('phone', this.messages.userInfo.validation.required[formLanguage] || this.messages.userInfo.validation.required.en);
            hasErrors = true;
        }
        
        if (hasErrors) {
            return;
        }

        const userInfo = {
            firstName,
            lastName,
            email,
            phone,
            question,
            language: this.conversationLanguage || this.config.language, // Use conversation language
            conversation: this.conversationHistory,
        };

        submitButton.disabled = true;
        submitButton.textContent = this.messages.userInfo.submitting[formLanguage] || this.messages.userInfo.submitting.en;

        try {
            const response = await this.submitUserInfo(userInfo);
            this.hideUserInfoForm();
            // Use the proper success message in the conversation language
            const successMessage = this.messages.userInfo.success[formLanguage] || this.messages.userInfo.success.en;
            this.addMessage(response.message || response.response || successMessage, 'bot');
        } catch (error) {
            this.addMessage(this.messages.errors.submitInfo[formLanguage] || this.messages.errors.submitInfo.en, 'bot');
        } finally {
            this.setInputState(true);
        }
    }

    async submitUserInfo(userInfo) {
        try {
            const response = await fetch(this.config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    chatInput: 'handover_form_submission',
                    sessionId: this.sessionToken,
                    pageUrl: window.location.href,
                    pageTitle: document.title,
                    referrer: document.referrer || null,
                    handover_info: {
                        firstName: userInfo.firstName,
                        lastName: userInfo.lastName,
                        email: userInfo.email,
                        phone: userInfo.phone,
                        question: userInfo.question
                    },
                    formData: userInfo,
                    bypass_conversational: true,
                    form_complete: true
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit user info');
            }

            return await response.json();
        } catch (error) {
            console.error('Error submitting user info:', error);
            throw error;
        }
    }
    
    addMessage(text, type, sources = [], isWelcome = false) {
        this.conversationHistory.push({
            type,
            text: text.replace(/<[^>]*>/g, ''),
            timestamp: new Date().toISOString()
        });

        const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
        
        if (type === 'bot') {
            const containerDiv = document.createElement('div');
            containerDiv.classList.add('bot-message-container');
            
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('bot-message');
            if (isWelcome) {
                messageDiv.classList.add('welcome-message');
            }
            
            // Create bot header with avatar and label
            const botHeader = document.createElement('div');
            botHeader.classList.add('bot-header');
            
            const avatarDiv = document.createElement('div');
            avatarDiv.classList.add('bot-avatar');
            avatarDiv.textContent = 'C';
            
            const labelDiv = document.createElement('span');
            labelDiv.classList.add('bot-label');
            labelDiv.textContent = 'Assistant';
            
            botHeader.appendChild(avatarDiv);
            botHeader.appendChild(labelDiv);
            
            // Create message text container
            const messageText = document.createElement('div');
            messageText.classList.add('bot-message-text');
            messageText.innerHTML = text;
            
            messageDiv.appendChild(botHeader);
            messageDiv.appendChild(messageText);
            
            if (sources && sources.length > 0) {
                const sourcesDiv = document.createElement('div');
                sourcesDiv.classList.add('sources');
                sourcesDiv.innerHTML = 'Sources:<br>' + sources.map(s => `- ${s}`).join('<br>');
                messageDiv.appendChild(sourcesDiv);
            }
            
            containerDiv.appendChild(messageDiv);
            messagesContainer.appendChild(containerDiv);
        } else {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'user-message');
            messageDiv.textContent = text;
            messagesContainer.appendChild(messageDiv);
        }
        
        this.scrollToBottom();
    }
    
    scrollToBottom(smooth = true) {
        setTimeout(() => {
            requestAnimationFrame(() => {
                const messagesContainer = this.shadowRoot.querySelector('.chat-messages');
                const scrollOptions = smooth ? { behavior: 'smooth' } : { behavior: 'auto' };
                
                messagesContainer.scrollTo({
                    top: messagesContainer.scrollHeight + 100,
                    behavior: scrollOptions.behavior
                });
            });
        }, 100);
    }
    
    async handleConfirmation(messageDiv) {
        this.setInputState(false);
        
        return new Promise((resolve) => {
            const buttonsDiv = document.createElement('div');
            buttonsDiv.classList.add('action-buttons');
            
            const yesButton = document.createElement('button');
            yesButton.classList.add('action-button', 'primary');
            yesButton.textContent = this.messages.confirmation.buttons.yes[this.config.language] || this.messages.confirmation.buttons.yes.en;
            
            const noButton = document.createElement('button');
            noButton.classList.add('action-button', 'secondary');
            noButton.textContent = this.messages.confirmation.buttons.no[this.config.language] || this.messages.confirmation.buttons.no.en;
            
            buttonsDiv.appendChild(yesButton);
            buttonsDiv.appendChild(noButton);
            messageDiv.appendChild(buttonsDiv);
            
            yesButton.addEventListener('click', () => {
                buttonsDiv.remove();
                this.showUserInfoForm();
                resolve(true);
            });
            
            noButton.addEventListener('click', () => {
                buttonsDiv.remove();
                const declineMessage = this.messages.confirmation.decline[this.config.language] || this.messages.confirmation.decline.en;
                this.addMessage(declineMessage, 'bot');
                this.setInputState(true);
                resolve(false);
            });
        });
    }
}

// Global initialization function
window.initCityparkingWidget = function(config = {}) {
    // Validate webhook URL
    if (!config.webhookUrl && !config.chatUrl) {
        console.error('CityparkingWidget: webhookUrl is required');
        return;
    }
    
    // Only create if it doesn't already exist
    if (!document.querySelector('cityparking-chat-widget')) {
        customElements.define('cityparking-chat-widget', CityparkingChatWidget);
        const widget = new CityparkingChatWidget(config);
        widget.setAttribute('id', 'cityparking-chat-widget');
        document.body.appendChild(widget);
        
        console.log('CityParking Chat Widget initialized with config:', config);
    }
};

// Auto-initialize if config is provided via data attributes
document.addEventListener('DOMContentLoaded', () => {
    const script = document.currentScript || document.querySelector('script[data-webhook-url], script[data-chat-url]');
    if (script && (script.dataset.webhookUrl || script.dataset.chatUrl)) {
        window.initCityparkingWidget({
            webhookUrl: script.dataset.webhookUrl || script.dataset.chatUrl,
            language: script.dataset.language || document.documentElement.lang,
            theme: {
                primaryColor: script.dataset.primaryColor || script.dataset.widgetBtnColor,
                position: script.dataset.position || script.dataset.btnPosition || 'bottom-right'
            }
        });
    }
});
