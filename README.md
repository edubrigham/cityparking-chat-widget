# CityParking Chat Widget

A deployable, self-contained chat widget for CityParking customer support with AI-powered assistance and seamless handover to human agents.

## Features

- 🤖 AI-powered customer support
- 🔄 Seamless handover to human agents
- 🌍 Multi-language support (EN, NL, FR)
- 📱 Responsive design
- 🎨 Customizable themes
- 🔒 Session management
- 📧 Email integration for support requests

## Quick Start

### Single Script Tag (Recommended)

```html
<script 
  src="https://cdn.jsdelivr.net/gh/edubrigham/cityparking-chat-widget@latest/dist/cityparking-chat-widget.min.js"
  data-webhook-url="https://edubrigham.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601"
  data-language="nl"
  data-primary-color="#009648"
  data-position="bottom-right">
</script>
```

### Alternative: Programmatic Initialization

```html
<!-- Load the widget -->
<script src="https://cdn.jsdelivr.net/gh/edubrigham/cityparking-chat-widget@latest/dist/cityparking-chat-widget.min.js"></script>

<!-- Initialize with your webhook URL -->
<script>
  window.initCityparkingWidget({
    webhookUrl: 'https://edubrigham.app.n8n.cloud/webhook/4091fa09-fb9a-4039-9411-7104d213f601',
    language: 'nl', // optional: 'en', 'nl', 'fr'
    theme: {
      primaryColor: '#009648',
      position: 'bottom-right' // or 'bottom-left'
    }
  });
</script>
```

## Configuration Options

### Data Attributes (Single Script Tag)

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-webhook-url` | string | **required** | Your n8n webhook URL |
| `data-language` | string | `'en'` | Widget language (`'en'`, `'nl'`, `'fr'`) |
| `data-primary-color` | string | `'#009648'` | Primary color for the widget |
| `data-position` | string | `'bottom-right'` | Widget position (`'bottom-left'` or `'bottom-right'`) |

### Programmatic Configuration

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `webhookUrl` | string | **required** | Your n8n webhook URL |
| `language` | string | `'en'` | Widget language (`'en'`, `'nl'`, `'fr'`) |
| `theme.primaryColor` | string | `'#009648'` | Primary color for the widget |
| `theme.position` | string | `'bottom-right'` | Widget position (`'bottom-left'` or `'bottom-right'`) |

### Full Configuration Example

```javascript
window.initCityparkingWidget({
  webhookUrl: 'https://your-n8n-instance.com/webhook/your-webhook-id',
  language: 'nl',
  theme: {
    primaryColor: '#009648',
    position: 'bottom-right'
  }
});
```

## Webhook Integration

The widget is designed to work with n8n webhooks. Your n8n workflow should handle:

### Expected Request Format

```json
{
  "chatInput": "User message",
  "sessionId": "widget_generated_session_id"
}
```

### Expected Response Format (Streaming)

The widget expects Server-Sent Events (SSE) or streaming JSON responses:

```json
{"type": "token", "content": "Response text chunk"}
{"type": "sources", "content": ["http://source1.com", "http://source2.com"]}
{"type": "needsUserInfo", "content": true}
{"type": "showForm"}
{"type": "error", "content": "Error message"}
```

### Form Submission Format

When a user submits the contact form:

```json
{
  "chatInput": "form_submission",
  "sessionId": "session_id",
  "formData": {
    "name": "First Name",
    "lastname": "Last Name", 
    "email": "user@example.com",
    "phone": "+32470123456",
    "question": "User question",
    "language": "nl",
    "conversation": [...]
  }
}
```

## Development

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/edubrigham/cityparking-chat-widget.git
cd cityparking-chat-widget
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm run serve
```

4. Open test page:
```bash
npm run test
```

### Build Process

```bash
# Development build
npm run dev

# Production build (minified)
npm run build
```

### File Structure

```
cityparking-chat-widget/
├── src/
│   └── cityparking-chat-widget.js    # Source code
├── dist/
│   ├── cityparking-chat-widget.js    # Development build
│   └── cityparking-chat-widget.min.js # Production build
├── examples/
│   ├── basic.html                    # Basic usage example
│   ├── customized.html              # Customization example
│   └── multiple-languages.html     # Multi-language example
├── package.json
└── README.md
```

## Language Support

The widget automatically detects the page language from `document.documentElement.lang` or defaults to English.

### Supported Languages

- **English** (`en`)
- **Dutch** (`nl`)
- **French** (`fr`)

### Message Customization

All user-facing messages are embedded in the widget and automatically translated based on the selected language.

## Styling and Customization

### CSS Custom Properties

The widget uses CSS custom properties that can be overridden:

```css
cityparking-chat-widget {
  --widget-height: 600px;
  --widget-width: 350px;
  --primary-color: #009648;
  --secondary-color: #f8f9fa;
}
```

### Position Customization

```javascript
// Bottom right (default)
theme: { position: 'bottom-right' }

// Bottom left
theme: { position: 'bottom-left' }
```

## Browser Support

- Modern browsers supporting ES6 classes and Shadow DOM
- Chrome 53+
- Firefox 63+
- Safari 10.1+
- Edge 79+

## Security Considerations

- Session tokens are generated client-side for basic session management
- All communication uses HTTPS
- Form validation includes email and phone number validation
- No sensitive data is stored in localStorage

## Examples

See the `examples/` directory for complete implementation examples:

- `basic.html` - Minimal setup
- `customized.html` - Custom theming and positioning
- `multiple-languages.html` - Language switching examples

## Support

For technical support or questions:

- Email: info@ringring.be
- Website: https://www.ringring.be

## License

MIT License - see LICENSE file for details

## Changelog

### v1.0.0
- Initial release
- Multi-language support (EN, NL, FR)
- Customizable theming
- n8n webhook integration
- Form submission handling
- Responsive design
