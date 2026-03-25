# Google Maps Integration Setup

## Overview
The directions page has been implemented with Google Maps to allow users to get directions to pharmacies when searching for medications.

## Features
- Interactive Google Maps integration
- Automatic directions from user's current location to pharmacy
- Pharmacy information display (address, phone, rating)
- Option to open in external Google Maps app
- Turn-by-turn directions display

## Setup Instructions

### 1. Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps JavaScript API
   - Geocoding API
   - Directions API
4. Go to "Credentials" and create an API key
5. Restrict the API key to your domain for security

### 2. Add API Key to Environment Variables

Create a `.env.local` file in the root directory (if it doesn't exist) and add:

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
```

### 3. Usage

Users can search for medications on the `/nearbypharmacies` page and click "Get Directions" to navigate to the new directions page at `/directions`.

The directions page will:
- Display pharmacy information
- Show a map with the pharmacy location
- Automatically get directions from the user's current location
- Display turn-by-turn instructions

### 4. Testing

1. Start the development server: `npm run dev`
2. Navigate to `/nearbypharmacies`
3. Search for a medication
4. Click "Get Directions" on any result
5. The directions page should load with the map and directions

## API Key Security

**Important**: 
- Never commit your `.env.local` file to version control
- The file is already in `.gitignore`
- Consider restricting your API key to specific domains in Google Cloud Console
- Monitor your API usage in Google Cloud Console

## Troubleshooting

### Map Not Loading
- Check that your API key is correctly set in `.env.local`
- Ensure the required APIs are enabled in Google Cloud Console
- Check browser console for any error messages

### Directions Not Showing
- Ensure the user grants location permissions
- Check that the API key has Directions API enabled
- Verify pharmacy coordinates are being passed correctly

### API Key Errors
- Make sure the API key is not expired or deleted
- Check that billing is enabled for your Google Cloud project
- Verify API restrictions if you've set any
