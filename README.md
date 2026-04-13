---
Travel Buddy
Overview
Travel Buddy is a client-side JavaScript web application that connects travelers looking to share trips and find companions. The app allows users to create and join travel groups, coordinate trip details, and communicate with fellow travelers through real-time chat.
Developed for the COMP 1800 course, this project applies User-Centred Design practices and agile project management, and demonstrates integration with Firebase backend services for authentication, database management, and real-time messaging.
---

Features

- User Authentication: Secure signup and login using Firebase Authentication
- Create Travel Groups: Users can create groups with destination, travel dates, travel method, and tags
- Join Groups: Search and join existing groups based on destination and interests
- Real-time Chat: Live messaging within each group using Firestore
- User Profiles: Customizable profiles with display name, profile picture, and status message
- Group Management: View group members, leave groups, and track group details

---

Technologies Used

- Frontend: HTML, CSS, JavaScript
- Build Tool: Vite (https://vitejs.dev/)
- Backend: Firebase for hosting
- Database: Firestore
- Authentication: Firebase Authentication
- UI Framework: Bootstrap 5

---

Usage
To run the application locally:

1. Clone the repository.
2. Install dependencies by running npm install in the project root directory.
3. Start the development server by running the command: npm run dev.
4. Open your browser and visit the local address shown in your terminal (usually http://localhost:5173 or similar).
   Once the application is running:
5. Sign up for a new account or log in with existing credentials.
6. Create a new travel group with your trip details, or browse and join existing groups.
7. Connect with your travel buddies through the real-time chat feature.
8. Manage your profile and view your travel groups.

---

Project Structure
travel-buddy/
├── src/
│ ├── authentication.js # Firebase auth functions (login, signup, logout)
│ ├── firebaseConfig.js # Firebase initialization
│ ├── createGroup.js # Group creation logic
│ ├── joinGroup.js # Group search and join functionality
│ ├── group.js # Group page with chat and member list
│ ├── main.js # Main page initialization
│ ├── myGroups.js # User's groups page
│ ├── report.js # Report functionality
│ ├── tags.js # Tag selection utility
│ ├── darkMode.js # Dark mode toggle
│ └── styles/ # CSS files for each page
├── public/
│ └── images/ # Image assets
├── dist/ # Built production files
├── index.html # Login/Signup page
├── main.html # Main dashboard
├── group.html # Group details and chat
├── createGrpForm.html # Create group form
├── JoinGroup.html # Search and join groups
├── myGroups.html # User's groups list
├── report.html # Report page
├── package.json
├── vite.config.js
└── README.md

---

## Database Schema

The application uses Firestore with the following collections:
**tbUsers**

- name, email, userID, successfulGroups, profilePicture, statusMessage
  **tbGroups**
- groupName, tags, leader, destination, travelMethod, max, members, joinType, status, groupID, startDate, endDate
  **Chat (subcollection within tbGroups)**
- user, uid, timestamp, message

---

Contributors

- Malcolm - BCIT CST Student with an interest in creating programs and games. I am a fan of many music genres, particularly metal and punk.
- Veerpartap - BCIT CST Student with a passion for outdoor adventures and user-friendly applications. Fun fact: Loves to play basketball.
- Shaan - BCIT CST Student with a passion for outdoor adventures and user-friendly applications. Fun fact: Loves solving Rubik's Cubes in under a minute.
- Omar - BCIT CST student who is an aspiring Software Developer.

---

Acknowledgments

- Code snippets were adapted from resources such as Stack Overflow (https://stackoverflow.com/) and MDN Web Docs (https://developer.mozilla.org/).
- Icons sourced from FontAwesome (https://fontawesome.com/).
- Firebase documentation and tutorials.
- Special thanks to Carly Orr for guidance and feedback throughout the project.

---

Limitations and Future Work
Limitations

- Group search is limited to destination and tags filtering.
- No push notifications for new messages (email notifications not fully implemented).
- Limited profile customization options.
  Future Work
- Implement map view with destination locations.
- Add trip cost splitting calculations.
- Implement push notifications for new messages and group updates.
- Add image upload for group posts and profiles.
- Create a rating/review system for group members.

---

License
This project is licensed under the MIT License. See the LICENSE file for details.
