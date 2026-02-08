# **App Name**: Finance Shield MDM

## Core Features:

- Vendor Registration: Capture shop name, owner details, and Aadhar images. Store the information securely in Firestore and Storage. Make sure vendors are not able to self-register, they should only be able to with explicit consent from a super-admin.
- Device Owner Setup: Enable the application to become a device owner, preventing uninstallation and enabling remote control features.
- Remote Screen Lock: Functionality to remotely lock the managed device's screen via device admin capabilities.
- EMI Due Overlay: Display a custom overlay indicating an EMI is due on the managed device's screen. Use generative AI tool to dynamically compose appropriate overlay message depending on device, shop and owner.
- Kiosk Mode: Activate a full-screen Kiosk Mode overlay with a 'Pay at Shop' message based on a Firebase Realtime Database trigger.
- QR Code Provisioning: Allow new devices to be provisioned, the app should automatically be downloaded, and then set as device owner.

## Style Guidelines:

- Primary color: Dark blue (#2C3E50) to convey trust and security.
- Background color: Light gray (#F0F4F7) for a clean, professional look.
- Accent color: Teal (#3498DB) for interactive elements and highlights.
- Body and headline font: 'Inter', a sans-serif font providing a clean and modern look.
- Use material design icons to visually represent different actions and statuses. Follow Google’s Material Design guidelines.
- Implement a consistent grid-based layout to ensure visual consistency. Use cards and lists for displaying information.
- Use subtle animations to give feedback on user interactions. Consider animations when displaying overlays.