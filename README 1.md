# 🚗 Workshop Vehicle Management System

**AutoInspect** - एक पूर्ण React Native app जो Workshop मध्ये Vehicle Inspection करण्यासाठी बनवलेला आहे।

## ✨ Features

- **👤 Login System** - Demo accounts के साथ
- **🚗 Vehicle Details** - Vehicle number, owner name, type
- **📸 Photo Capture** - Before & After photos (Camera/Gallery)
- **🔧 Problem Documentation** - विस्तृत समस्या का विवरण
- **📄 PDF Report Generation** - Beautiful inspection report
- **🖨️ Print & Share** - सीधे प्रिंट करें या शेयर करें
- **🎨 Marathi UI** - पूरी तरह Marathi में interface

## 🔐 Demo Accounts

| नाव | Email | Password | Role |
|-----|-------|----------|------|
| Rahul Patil | rahul@workshop.com | 1234 | Inspector |
| Suresh Desai | suresh@workshop.com | 1234 | Manager |
| Amit Shinde | amit@workshop.com | 1234 | Technician |

## 📦 Installation

### 1. Node.js & npm Install करें
```bash
https://nodejs.org/
```

### 2. Project Setup
```bash
# Repository clone करें
git clone https://github.com/mangutkarpram90-ui/Workshop-Vehicle-Management-System.git
cd Workshop-Vehicle-Management-System

# Dependencies install करें
npm install
```

### 3. Expo CLI Install करें
```bash
npm install -g expo-cli
```

### 4. App चलाएं
```bash
# Android के लिए
expo start --android

# iOS के लिए
expo start --ios

# Web के लिए
expo start --web

# या बस
npm start
```

## 🎮 कैसे Use करें

1. **Login करें**
   - Demo accounts में से कोई भी select करें
   - या manually email/password enter करें

2. **Inspection Form भरें**
   - Vehicle number (अनिवार्य)
   - Owner name (अनिवार्य)
   - Vehicle type (dropdown से select करें)
   - Problem description (अनिवार्य)

3. **Photos Add करें**
   - Camera से लें या Gallery से select करें
   - Before photo (समस्या से पहले)
   - After photo (समस्या के बाद)

4. **Report Generate करें**
   - सभी details के साथ beautiful report बनता है
   - PDF में save करें
   - Share करें
   - Print करें

## 📱 Technology Stack

- **React Native** - Cross-platform development
- **Expo** - Easy React Native development
- **expo-image-picker** - Camera & Gallery access
- **expo-print** - Print functionality
- **expo-sharing** - Share files
- **React Hooks** - State management

## 🎨 Design

- **Dark theme** (#1a1a2e)
- **Red accent** (#e63946)
- **Responsive design**
- **Shadow effects**
- **Smooth animations**

## 📄 Report Format

PDF Report में निम्नलिखित होता है:
- Inspector की जानकारी
- Vehicle की complete details
- Problem का विस्तृत विवरण
- Before & After photos
- Timestamp
- Inspector की signature space

## 🛠️ Project Structure

```
Workshop-Vehicle-Management-System/
├── App.js              # Main app file
├── package.json        # Dependencies
├── app.json            # Expo configuration
└── README.md          # Documentation
```

## 🐛 Troubleshooting

### Permission Issues
- **Android**: Settings में Camera & Storage permission दें
- **iOS**: Info.plist में permission requests जोड़ें

### Photo Issues
- High resolution photos के लिए base64 compression (0.6 quality)
- सभी devices पर काम करता है

### Print Issues
- **iOS**: AirPrint enabled printer चाहिए
- **Android**: Print service installed हो

## 📝 License

This project is open source and available for educational purposes.

## 👨‍💻 Author

**Mangutkarpram90-ui**

---

**Made with ❤️ for Workshop Vehicle Management**