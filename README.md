# Matcha

A dating web application that matches potential partners based on location, interests, and compatibility - 42 Network Project.


## 📑 Overview

Matcha is a full-featured dating platform that helps users find potential matches through an intelligent algorithm that considers location, common interests, and popularity. This project was developed as part of the 42 curriculum.

## ✨ Features

### User Authentication & Profile
- Registration/login system with email verification
- Password reset functionality
- Detailed user profiles with up to 5 photos
- Interest tags system (e.g., #vegan, #geek, #travel)
- GPS-based location tracking
- Biography and sexual preference settings
- Fame rating system

### Match Finding
- Smart matching algorithm based on:
  - Geographic proximity
  - Common interests/tags
  - Fame rating
  - Sexual preferences
- Advanced filtering and sorting capabilities
- Comprehensive browsing and search functionality

### Interaction
- Profile likes and mutual connection system
- Real-time chat for connected users
- Profile visit history
- Profile blocking and fake account reporting
- Online status and last connection time

### Real-time Features
- Instant notifications for:
  - Likes received
  - Profile visits
  - New messages
  - New connections
  - Disconnections

## 🛠️ Tech Stack

- **Frontend**: React
- **Backend**: ExpressJs
- **Database**: Neo4j
- **Real-time**: Socket.io
- **Authentication**: JWT, OAuth (Google, Discord, 42)

## 🚀 Installation

```bash
# Clone repository
git clone https://github.com/anastabiti/Matcha-42.git
cd Matcha-42

# Set up environment variables (required before running make)
# You need to create .env files in three locations:

# 1. Backend .env
cp backend/.env.example backend/.env
# Edit backend/.env with your backend configuration

# 2. Frontend .env
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your frontend configuration

# 3. Database .env
cp database/.env.example database/.env
# Edit database/.env with your database configuration

# Build and start the application using the Makefile
make all
```

### Makefile Commands

```
============================================
==         PROJECT MAKEFILE HELP         ==
============================================
Usage: make [target]
Available targets:
  help              - Show this help message
  install-backend   - Install backend dependencies
  build-backend     - Build backend
  start-backend     - Start backend server
  install-frontend  - Install frontend dependencies
  build-frontend    - Build frontend
  start-frontend    - Start frontend preview server
  start-database    - Build and start the database container with Docker Compose
  all               - Build and start database, backend and frontend concurrently
```

You can view this list of commands at any time by running `make help`.

## ⚙️ Environment Variables

You need to set up environment variables in three different locations before running `make all`:

### Backend (.env in backend folder)
```
# Database Configuration
database_password="your_neo4j_password"
database_username="neo4j"
database_URL="neo4j://localhost:7687"

# Email Configuration
google_app_password="your_app_password"
google_mail="your_email@gmail.com"
google_mail_port=465
google_mail_host="smtp.gmail.com"
google_mail_service="Gmail"

# Authentication
JWT_TOKEN_SECRET="your_jwt_secret"
session_secret="your_session_secret"

# OAuth Configuration
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET="your_discord_client_secret"
FORTYTWO_APP_ID="your_42_app_id"
FORTYTWO_APP_SECRET="your_42_app_secret"

# Server Configuration
front_end_ip=http://localhost:7070
back_end_ip=http://localhost:3000

# External Services
ip_finder_pub=your_ip_finder_key
cloudinary_cloud_name=your_cloudinary_name
cloudinary_api_key=your_cloudinary_api_key
cloudinary_api_secret=your_cloudinary_api_secret
```

### Frontend (.env in frontend folder)
```
VITE_BACKEND_IP=http://localhost:3000
VITE_FRONTEND_IP=http://localhost:7070
```

### Database (.env in database folder)
```
# Same as backend database configuration
database_password="your_neo4j_password"
database_username="neo4j"
database_URL="neo4j://localhost:7687"
```

## 🔒 Security Implementations

- Password hashing (not stored in plain text)
- Protection against SQL injections
- Form validation and secure file upload handling
- XSS prevention
- JWT authentication
- OAuth integration for secure third-party authentication

## 👥 Contributors

- [ANAS TABITI](https://github.com/anastabiti)
- [Ali Louzizi](https://github.com/alouzizi)

## 📷 Screenshots

![Screenshot from 2025-02-28 08-57-39](https://github.com/user-attachments/assets/226b2ae1-7ff7-446d-849e-167596a94b94)
![Screenshot from 2025-02-28 08-57-34](https://github.com/user-attachments/assets/f685372b-e6c3-4951-8edd-ebcd7e330660)
![Screenshot from 2025-02-28 08-56-55](https://github.com/user-attachments/assets/30943f82-ef0b-48c9-88b2-54124f643a83)
![Screenshot from 2025-02-28 08-56-48](https://github.com/user-attachments/assets/0943b9c1-be09-4d4f-9db4-2a5db1096f06)
![Screenshot from 2025-02-28 08-56-44](https://github.com/user-attachments/assets/6043c49c-2d08-4e57-8048-3e06b9071842)
![Screenshot from 2025-02-28 08-56-10](https://github.com/user-attachments/assets/81822dd0-ef9c-48c4-947c-03f453b43016)
![Screenshot from 2025-02-28 08-55-43](https://github.com/user-attachments/assets/2bb7990b-5565-4668-89b6-c695a7a86ef0)
![Screenshot from 2025-02-28 08-55-36](https://github.com/user-attachments/assets/2087008e-06dd-4441-bf4b-c6f8387ff524)
![Screenshot from 2025-02-28 08-55-20](https://github.com/user-attachments/assets/39f0944a-19eb-454f-923a-536ca16bb5af)




