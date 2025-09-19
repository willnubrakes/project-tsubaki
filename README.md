# Project Tsubaki - Inventory Control App

A React Native iOS app for inventory control with chain of custody tracking, built with Expo.

## Overview

This app enables technicians to track parts pickup and return with photo evidence, creating a virtual chain of custody for inventory management.

## Features

### ✅ Core Functionality
- **Order Management**: View and manage part orders organized by store
- **Chain of Custody**: Track pickup and return events with photo evidence
- **Status Tracking**: Real-time status updates for orders and individual items
- **Photo Capture**: Camera integration for evidence photos with location data
- **Filter System**: Filter orders by status (All, Ready for Pickup, On Van, Ready for Return)
- **Sync Functionality**: Mock sync to mark events as uploaded
- **Data Persistence**: Local storage using AsyncStorage

### 📱 User Interface
- **Modern Design**: Clean, professional UI with status pills and cards
- **Expandable Orders**: Tap to expand order cards and view individual items
- **Intuitive Actions**: Context-aware action buttons for pickup/return
- **Camera Integration**: Full-screen camera modal with photo preview
- **Permission Handling**: Graceful camera and location permission requests

## Technical Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Zustand
- **Storage**: AsyncStorage for local persistence
- **Camera**: Expo Camera
- **Location**: Expo Location
- **Navigation**: React Navigation (ready for expansion)

## Project Structure

```
src/
├── components/
│   ├── CameraCaptureModal.tsx    # Camera capture with photo preview
│   ├── FilterTabs.tsx            # Status filter tabs
│   ├── OrderCard.tsx             # Expandable order cards
│   └── StatusPill.tsx            # Status indicator pills
├── data/
│   └── seedData.ts               # Sample orders and items
├── screens/
│   └── OrdersScreen.tsx          # Main orders screen
├── store/
│   └── useAppStore.ts            # Zustand store with business logic
└── types/
    └── index.ts                  # TypeScript interfaces
```

## Data Models

### PartOrder
- Order information with store details
- Computed status based on item statuses
- Array of PartOrderItems

### PartOrderItem
- Individual part details (SKU, name, units)
- Current status (Ready for Pickup, Picked Up, Ready for Return, Returned)
- Job association

### PartEvent
- Chain of custody events with photo evidence
- Location data (optional)
- Sync status for upload tracking

## Status Computation Logic

Order status is automatically computed based on item statuses:
- **READY_FOR_PICKUP**: Any item is ready for pickup
- **PICKED_UP**: All items are picked up
- **READY_FOR_RETURN**: Any item is ready for return
- **RETURNED**: All items are returned

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Run on iOS Simulator**
   ```bash
   npm run ios
   ```

## Usage Flow

### Pickup Flow
1. Navigate to orders screen
2. Expand an order with "Ready for Pickup" items
3. Tap "Picked up" on an item
4. Capture photo evidence
5. Submit to update status and create event

### Return Flow
1. Find items with "Picked Up" or "Ready for Return" status
2. Tap "Returned" on an item
3. Capture photo evidence
4. Submit to update status and create event

### Sync
1. Tap "Sync" button in header
2. All pending events are marked as synced
3. Pending uploads counter resets to 0

## Permissions

The app requests the following permissions:
- **Camera**: Required for evidence photos
- **Location**: Optional for geotagging photos

## Demo Data

The app includes sample data with 5 orders across different stores and statuses:
- Downtown Brake Supply (Austin, TX)
- Central Auto Parts (Houston, TX)
- Eastside Brake Parts (Austin, TX)
- Northside Auto Supply (Dallas, TX)

## Future Enhancements

- Backend API integration
- User authentication
- Push notifications
- Offline sync capabilities
- Barcode scanning
- Advanced reporting
- Multi-user support

## Development Notes

- Built as a prototype for demo purposes
- Uses local storage only (no backend)
- Mock sync functionality
- Ready for handoff to development team
- Follows React Native best practices
- TypeScript for type safety
- Modern UI/UX patterns
