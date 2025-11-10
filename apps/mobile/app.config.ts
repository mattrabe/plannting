import { version } from './package.json'

export default {
  "expo": {
    "name": "Plannting",
    "slug": "plannting",
    "version": version.replace(/^([0-9]*\.[0-9]*\.[0-9]*).*/, '$1'),
    runtimeVersion: '1',
    scheme: 'plannting',
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "bundleIdentifier": "com.completecodesolutions.plannting",
      "infoPlist": { "ITSAppUsesNonExemptEncryption": false },
      "supportsTablet": true
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "edgeToEdgeEnabled": true,
      "predictiveBackGestureEnabled": false
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": { "eas": { "projectId": "9fcdb798-fbdf-45da-bf80-9f6c51c527b3" } },
    "updates": { "url": "https://u.expo.dev/9fcdb798-fbdf-45da-bf80-9f6c51c527b3" }
  }
}
