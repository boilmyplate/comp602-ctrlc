## Blank Web
Blank web is a safe space that is designed to help users manage their stress and improve mental clarity. This web app provides a platform where users can freely express their thoughts while interacting with calming and stress reliefing games. The goal is to create a peaceful enviroment that supports users through self-help techniques, offering a peaceful enviroment that supports users through self-help techniques, offering immediate stress relief while also bridging the gap caused by long wait times for professional counseling or helplines.

## Overview 
Blank Web is focused on:
- Stress Relief: Games are integrated to provide quick relief, helping users achieve a calm mental state.
- Self-Help: The app offers self-help sessions, encouraging users to take control of their mental health.
- Community Support: Option for the community-based discussions, where users can seek advice and support from others.
Blank Web is designed as a solution for individuals that are facing heightened stress, offering a way to cope with mental strain in real-time.

## Features 
- Journaling: Users can document their thoughts.
- Games for stress relief: Fun and interactive games like Pong, 2048 and penguin game are avaliable to promote relaxation while typing their thoughts in.
- Mood tracker: Log moods daily and visualize mental well-being over time.
- Global Chat: Access a real time chat room to discuss and share experiences with others.
- Chatbot: Access a real time chatbot to discuss and ask personal questions when you don't want to disucss or ask in global chat.
- Calendar for Events: Track personal events and milestones with a built-in calendar.
- Self-Helping Tools: Interactive breathing exercises and journaling options.
- Dark/Light mode: Customize the app appearance to suit your preferences.
- Account signup: Creating an account and begining your self-help journey.
- Password Reset: Easily reset your password if you forget it.

## Contents

- [About](#about)
- [Getting Started](#getting-started)
  - [Required Accounts](#required-accounts)
  - [API Keys](#api-keys)
  - [Firestore Database](#firestore-database)
- [Usage](#usage)
  - [Installation](#installation)
  - [Development Server](#development-server)
  - [Production Server](#production-server)
  - [Tests](#tests)
  - [Access](#access)
- [Team](#team)
- [License](#license)


## About
Blank Web is built using Next.js for the front-end and Firebase for authentication, database storage and user management. The app integrates games, mood tracking and journaling to help users manage stress and promote well-being.

## Getting started

## Required
- Next.js version 14.2.15 or higher.

## Required Accounts
To run this project, you will need access to following services:
- Firebase Authentication
- Firebase Firestore

## API Keys
Create a .env.local file in your project root and add the following:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=""
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=""
NEXT_PUBLIC_FIREBASE_PROJECT_ID=""
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=""
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=""
NEXT_PUBLIC_FIREBASE_APP_ID=""
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=""
```

## Usage

### Installation
to install dependencies
```bash
npm install
```

### Development Server
To run the development server: 
```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000).

### Production Server
To build and run the app for production:
```bash
npm run build
npm run start
```

### Tests
To run tests, please use the following command:
```bash
npm test
```

To run specific tests:
```bash
npm test -t "testName"
```

### Access 
Once your app is running, access it locally at:
[http://localhost:3000](http://localhost:3000)

## Team 
| Name                   | GitHub                                       | Role                       |
|------------------------|----------------------------------------------|----------------------------|
| Emily L                | [emilyylauu](https://github.com/emilyylauu)  | Product Owner / Developer  |
| Vi N                   | [idkshit127](https://github.com/idkshit127)  | SCRUM Master / Developer   |
| John M                 | [boilmyplate](https://github.com/boilmyplate)| Developer                  |
| Pei-Te S               | [pxter22](https://github.com/pxter22)        | Developer                  |
| Bosco K                | [BoscoKW](https://github.com/BoscoKW)        | Developer                  |


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
