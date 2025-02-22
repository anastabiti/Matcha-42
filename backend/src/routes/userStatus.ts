import express from 'express';
import { driver } from '../database';

const userStatus = express.Router();

userStatus.get('/user-status/:username', async (req, res) => {
  const session_db = driver.session();
  try {
    const { username } = req.params;
    
    const result = await session_db.run(
      `MATCH (u:User {username: $username})
       RETURN u.lastSeen as lastSeen`,
      { username }
    );
    
    if (result.records.length > 0) {
      const lastSeen = result.records[0].get('lastSeen');
      res.json({
        username,
        isOnline: false, // Default to offline for HTTP request
        lastSeen: lastSeen ? parseInt(lastSeen.toString()) : null
      });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user status:', error);
    res.status(500).json({ error: 'Failed to fetch user status' });
  } finally {
    await session_db.close();
  }
});

export default userStatus;