# QR Codes for Testing

During development, you'll need QR codes to test the start/finish flow.

## Expected QR Code Values

The app expects these exact strings when scanning:

- **START QR**: `SYNAQ_START`
- **FINISH QR**: `SYNAQ_FINISH`

## Generate QR Codes for Testing

### Option 1: Online Generator

1. Go to [qr-code-generator.com](https://www.qr-code-generator.com/) or similar
2. Select "Text" type
3. Enter `SYNAQ_START` for start QR
4. Download and print/display on phone
5. Repeat for `SYNAQ_FINISH`

### Option 2: Using QR Code Generator Libraries

```bash
# Install qrcode generator
npm install -g qrcode

# Generate START QR code
qrcode -o start.png "SYNAQ_START"

# Generate FINISH QR code
qrcode -o finish.png "SYNAQ_FINISH"
```

### Option 3: Quick CLI Tool

```bash
# macOS/Linux - Generate QR in terminal
echo "SYNAQ_START" | qrencode -o start.png
echo "SYNAQ_FINISH" | qrencode -o finish.png
```

## Testing Without QR Codes

For quick testing, you can temporarily modify the QR scanner validation:

In `app/start/page.tsx` and `app/finish/page.tsx`, change:

```tsx
// Temporarily accept any QR code
if (qrData !== "SYNAQ_START") {
  // Comment this out for testing
}
```

Or use the browser console to trigger the flow manually:

```javascript
// In browser DevTools console
localStorage.setItem('synaq_active_attempt', JSON.stringify({
  attemptId: 'test-123',
  userId: 'test-user',
  startTime: Date.now(),
  status: 'started'
}));
```

## Production QR Codes

For production deployment:

1. **Physical Signs**: Print large QR codes (A4 size) laminated for weather protection
2. **Location**: 
   - START: At the base of Health Stairs (entrance)
   - FINISH: At the top of the stairs (exit point)
3. **Visibility**: Ensure good lighting and clear signage
4. **Height**: Mount at eye level (5-6 feet) for easy scanning
5. **Protection**: Use weatherproof enclosures or lamination

## Security Considerations

- Use unique, hard-to-guess codes for production
- Consider rotating QR codes periodically
- Add geofencing as primary validation (QR is secondary)
- Monitor for QR code tampering or copying

## Future Enhancement Ideas

- Dynamic QR codes that change daily
- QR codes with encrypted timestamps
- Multi-factor validation (QR + location + time)
- Admin dashboard to generate new codes
