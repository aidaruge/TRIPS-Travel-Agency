import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import nodemailer from 'nodemailer';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';



const salt = 10;

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(bodyParser.json());

app.use(session({
  key: "userId",
  secret: "session-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    expires: 60 * 60 * 24 * 30,
  },
}));

app.use(cors({
  origin: ["http://localhost:3000"], 
  methods: ["POST", "GET", "PUT", "DELETE"],
  credentials: true,
}));

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Good4trying!",
  database: "travelDB",
});

// Middleware to retrieve userID from session
const getUserID = (req, res, next) => {
  if (req.session && req.session.user) {
    req.userID = req.session.user[0].userID;
  } else {
    req.userID = null;
  }
  next();
};

app.use(getUserID);

app.get("/", (req, res) => {
  res.json("backend database here.");
});

// Route to fetch a single destination by ID
app.get("/destinations/:id", (req, res) => {
  const destinationID = req.params.id;
  const query = "SELECT * FROM destinations WHERE destinationID = ?";
  db.query(query, [destinationID], (err, result) => {
    if (err) {
      console.error('Error fetching destination:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    return res.json(result[0]);
  });
});

// Route to fetch photos associated with a destination by destinationID
app.get("/destinationphotos/:destinationID", (req, res) => {
  const destinationID = req.params.destinationID;
  const query = "SELECT * FROM destinationphotos WHERE destinationID = ?";
  db.query(query, [destinationID], (err, result) => {
    if (err) {
      console.error('Error fetching destination photos:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    return res.json(result);
  });
});

db.on('error', (err) => {
  console.error('MySQL connection error:', err);
  if (err.code === 'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR') {
    console.log('Attempting to reconnect MySQL connection pool...');
    db.end(); // End the current pool
    db = mysql.createPool({ host: 'localhost',
    user: 'root',
    password: 'Good4trying!',
    database: 'travelDB' }); // Recreate the pool
  } else {
    throw err; // Throw error for other types of errors
  }
});

app.get("/destinations", (req, res) => {
  const q = "SELECT * FROM destinations";
  db.query(q, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Route to fetch destinations with optional filters
app.get("/destinations", (req, res) => {
  const { name, country, maxPrice, mealType, stars } = req.query;
  let query = "SELECT * FROM destinations WHERE 1=1";
  const queryParams = [];

  if (name) {
    query += " AND name LIKE ?";
    queryParams.push(`%${name}%`);
  }
  if (country) {
    query += " AND country = ?";
    queryParams.push(country);
  }
  if (maxPrice) {
    query += " AND price <= ?";
    queryParams.push(parseFloat(maxPrice));
  }
  if (mealType) {
    query += " AND mealType = ?";
    queryParams.push(mealType);
  }
  if (stars) {
    query += " AND stars = ?";
    queryParams.push(stars);
  }

  db.query(query, queryParams, (err, data) => {
    if (err) return res.status(500).json(err);
    return res.json(data);
  });
});

// Route to insert the registered information into db
app.post('/signup', (req, res) => {
  const sql = "INSERT INTO users (username, password, email, fullName, userType) VALUES (?, ?, ?, ?, ?)";
  bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
    if (err) return res.json({ Error: "Error hashing password" });

    const values = [
      req.body.username,
      hash,
      req.body.email,
      req.body.fullName,
      'user'
    ];
    db.query(sql, values, (err, result) => {
      if (err) return res.json({ Error: "Inserting error" });
      return res.json({ Status: "Success" });
    });
  });
});

// For sessions
app.get("/signin", (req, res) => {
  if (req.session.user) {
    console.log("Session user data:", req.session.user);
    res.send({ loggedIn: true, user: req.session.user[0] }); // Assuming user data is an array
  } else {
    console.log("No session user data found.");
    res.send({ loggedIn: false });
  }
});

// Signin
app.post('/signin', (req, res) => {
  const { username, password } = req.body;

  // Query the database to check if the username exists
  const sql = "SELECT * FROM users WHERE username = ?";
  db.query(sql, [username], (err, result) => {
    if (err) {
      console.error("Error signing in:", err);
      return res.status(500).json({ error: 'Error signing in' });
    }

    // If no user found, return error
    if (result.length === 0) {
      return res.status(401).json({ error: 'Invalid username' });
    }

    // Compare passwords asynchronously
    bcrypt.compare(password, result[0].password, (err, response) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ error: 'Error comparing passwords' });
      }
      if (response) {
        // Store user data in the session
        req.session.user = result;

        console.log(req.session.user);
        // Passwords match, return success
        return res.status(200).json({ Status: "Success" });
      } else {
        // Passwords don't match, return error
        return res.status(401).json({ error: 'Invalid password' });
      }
    });
  });
});


// Logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.clearCookie('userId'); // Clear cookie upon logout
    res.status(200).json({ message: 'Logged out successfully' });
  });
});

// Route to check if the user is admin
app.get("/check-admin", (req, res) => {
  if (req.userID) { // Ensure userID is retrieved correctly from the session middleware
    const query = "SELECT userType FROM users WHERE userID = ?";
    db.query(query, [req.userID], (err, result) => {
      if (err) {
        console.error("Error fetching user type:", err);
        return res.status(500).json({ error: "Server error" });
      }
      if (result.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      const userType = result[0].userType;
      res.json({ isAdmin: userType === "admin" });
    });
  } else {
    res.json({ isAdmin: false });
  }
});


// Contact form submission endpoint
app.post('/send-email', (req, res) => {
  const { name, email, message } = req.body;

  // Validate the input fields
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  // Create a transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'aidaioana1102@gmail.com',
      pass: 'smgy nclt rtmv jkja', // replace with your actual email password or an app-specific password
    },
  });

  const mailOptions = {
    from: 'aidaioana1102@gmail.com', // The email address you're sending from
    to: 'aidaioana1102@gmail.com', // The email address you're sending to
    replyTo: email, // Set the reply-to field to the user's email
    subject: `New Contact Form Submission from ${name}`,
    text: `
      Name: ${name}
      Email: ${email}
      Message: ${message}
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ error: 'Failed to send email' });
    }
    console.log('Email sent:', info.response);
    res.status(200).json({ message: 'Email sent successfully' });
  });
});




// Route to handle RESERVATION 
app.post('/submit-booking', (req, res) => {
  const { destinationID, checkInDate, checkOutDate, numGuests, userID } = req.body;

  // Calculate the number of nights
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const nightsStayed = (checkOut - checkIn) / (1000 * 60 * 60 * 24);

  // Fetch the price and name of the destination from the database
  const getPriceQuery = "SELECT price, name FROM destinations WHERE destinationID = ?";
  db.query(getPriceQuery, [destinationID], (priceErr, priceResult) => {
    if (priceErr) {
      console.error('Error fetching destination price:', priceErr);
      return res.status(500).json({ error: 'Failed to fetch destination price' });
    }

    // Calculate the final price
    const destinationPrice = priceResult[0].price;
    const destinationName = priceResult[0].name;
    const finalPrice = nightsStayed * numGuests * destinationPrice;

    // Insert the booking into the database
    const insertBookingQuery = `
      INSERT INTO bookings (destinationID, checkInDate, checkOutDate, numGuests, userID, finalPrice)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    db.query(insertBookingQuery, [destinationID, checkInDate, checkOutDate, numGuests, userID, finalPrice], (err, result) => {
      if (err) {
        console.error('Error inserting booking:', err);
        return res.status(500).json({ error: 'Failed to submit booking' });
      }

      // Retrieve the user's email from the users table
      const getUserEmailQuery = "SELECT email FROM users WHERE userID = ?";
      db.query(getUserEmailQuery, [userID], (userErr, userResult) => {
        if (userErr) {
          console.error('Error fetching user email:', userErr);
          return res.status(500).json({ error: 'Failed to fetch user email' });
        }

        const userEmail = userResult[0].email;

        // Send a confirmation email
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: 'aidaioana1102@gmail.com', 
            pass: 'smgy nclt rtmv jkja', 
          },
        });

        const mailOptions = {
          from: 'aidaioana1102@gmail.com',
          to: userEmail,
          subject: 'Booking Confirmation',
          text: `Thank you for your booking! You have booked the destination ${destinationName} from ${checkInDate} to ${checkOutDate}. The total price is ${finalPrice}€. We look forward for a meeting to discuss the payment method.`,
        };

        transporter.sendMail(mailOptions, (emailErr, info) => {
          if (emailErr) {
            console.error('Error sending confirmation email:', emailErr);
            return res.status(500).json({ error: 'Failed to send confirmation email' });
          }

          console.log('Email sent: ' + info.response);
          return res.status(200).json({ message: 'Booking submitted successfully and confirmation email sent' });
        });
      });
    });
  });
});






app.post('/create-destination', (req, res) => {
  const { name, price, country, mealType, stars, description, location, photoURL } = req.body;

  // Validate the input fields
  if (!name || !price || !country || !mealType || !stars || !description || !location || !photoURL) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const query = "INSERT INTO destinations (`name`, `price`, `country`, `mealType`, `stars`, `description`, `location`, `photoURL`) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  const values = [name, price, country, mealType, stars, description, location, photoURL];

  db.query(query, values, (err, data) => {
    if (err) {
      console.error('Error inserting destination:', err);
      return res.status(500).json({ error: 'Failed to add destination. Please try again.' });
    }
    return res.status(201).json({ message: 'Destination has been created successfully.' });
  });
});

//deleting destination 
app.delete('/destinations/:id', (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM destinations WHERE destinationID = ?`;

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting destination:', err);
      return res.status(500).json({ error: 'An error occurred while deleting the destination' });
    } else if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    } else {
      return res.status(200).json({ message: 'Destination deleted successfully' });
    }
  });
});


//showing the reservations
// Route to fetch all bookings
app.get('/bookings', (req, res) => {
  const query = `
    SELECT 
      b.bookingID, 
      b.checkInDate, 
      b.checkOutDate, 
      b.numGuests, 
      b.finalPrice, 
      b.status,
      d.name AS destinationName,
      d.location AS destinationLocation,
      d.photoURL AS destinationPhoto
    FROM 
      bookings b
    JOIN 
      destinations d ON b.destinationID = d.destinationID
    ORDER BY 
      b.bookingID DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    return res.json(results);
  });
});
// Route to fetch all bookings
/*app.get('/bookings', (req, res) => {
  const query = `
    SELECT 
      b.bookingID, 
      b.checkInDate, 
      b.checkOutDate, 
      b.numGuests, 
      b.finalPrice, 
      b.status,
      d.name AS destinationName,
      d.location AS destinationLocation,
      d.photoURL AS destinationPhoto
    FROM 
      bookings b
    JOIN 
      destinations d ON b.destinationID = d.destinationID
    ORDER BY 
      b.bookingID DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching bookings:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    return res.json(results);
  });
});*/



// Route to confirm a booking
app.post('/bookings/:id/confirm', (req, res) => {
  const bookingID = req.params.id;
  const query = `UPDATE bookings SET status = 'confirmed' WHERE bookingID = ?`;

  db.query(query, [bookingID], (err, result) => {
    if (err) {
      console.error('Error confirming booking:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    return res.json({ success: true, message: 'Booking confirmed' });
  });
});

// Route to cancel a booking
app.delete('/bookings/:id/cancel', (req, res) => {
  const bookingID = req.params.id;
  const query = `DELETE FROM bookings WHERE bookingID = ?`;

  db.query(query, [bookingID], (err, result) => {
    if (err) {
      console.error('Error cancelling booking:', err);
      return res.status(500).json({ error: 'Server error' });
    }
    return res.json({ success: true, message: 'Booking cancelled' });
  });
});



// Route to edit the destination details
app.put('/destinations/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, price, photoURL } = req.body;

  const sql = `UPDATE destinations 
               SET name = ?, description = ?, price = ?, photoURL = ?
               WHERE destinationID = ?`;

  db.query(sql, [name, description, price, photoURL, id], (err, result) => {
    if (err) {
      console.error('Error updating destination:', err);
      return res.status(500).json({ error: 'Failed to update destination' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Destination not found' });
    }
    return res.status(200).json({ message: 'Destination updated successfully' });
  });
});


// Endpoint for adding a destination to favorites
app.post('/add-to-favorites', (req, res) => {
  // Extract destinationID and userID from request body
  const { destinationID, userID } = req.body;

  // Check if both destinationID and userID are provided
  if (!destinationID || !userID) {
    return res.status(400).json({ error: 'Both destinationID and userID are required' });
  }

  // Insert the destinationID and userID into the favorites table
  const query = `INSERT INTO favorites (destinationID, userID) VALUES (?, ?)`;
  db.query(query, [destinationID, userID], (error, results) => {
    if (error) {
      console.error('Error adding destination to favorites:', error);
      return res.status(500).json({ error: 'Failed to add destination to favorites' });
    }
    res.status(200).json({ message: 'Destination added to favorites successfully' });
  });
});

// Endpoint for fetching user's favorite destinations
app.get('/favorites/:userID', (req, res) => {
  const userID = req.params.userID;

  // Check if userID is provided
  if (!userID) {
    return res.status(400).json({ error: 'UserID is required' });
  }

  // Query to get the favorite destinations for the user
  const query = `
    SELECT d.*
    FROM favorites f
    JOIN destinations d ON f.destinationID = d.destinationID
    WHERE f.userID = ?
  `;
  db.query(query, [userID], (error, results) => {
    if (error) {
      console.error('Error fetching favorite destinations:', error);
      return res.status(500).json({ error: 'Failed to fetch favorite destinations' });
    }
    res.status(200).json(results);
  });
});


// Endpoint for deleting a destination from favorites
app.post('/delete-from-favorites', (req, res) => {
  const { destinationID, userID } = req.body;

  // Check if both destinationID and userID are provided
  if (!destinationID || !userID) {
    return res.status(400).json({ error: 'Both destinationID and userID are required' });
  }

  // Delete the favorite from the favorites table
  const query = `DELETE FROM favorites WHERE destinationID = ? AND userID = ?`;
  db.query(query, [destinationID, userID], (error, results) => {
    if (error) {
      console.error('Error deleting favorite:', error);
      return res.status(500).json({ error: 'Failed to delete favorite' });
    }
    res.status(200).json({ message: 'Favorite deleted successfully' });
  });
});


//Route to add new photo for a destination
app.post('/add-photo', (req, res) => {
  const { destinationID, photoURL } = req.body;

  if (!destinationID || !photoURL) {
    return res.status(400).json({ error: 'Both destinationID and photoURL are required' });
  }

  const query = 'INSERT INTO destinationphotos (destinationID, photoURL) VALUES (?, ?)';
  db.query(query, [destinationID, photoURL], (err, result) => {
    if (err) {
      console.error('Error adding photo:', err);
      return res.status(500).json({ error: 'Failed to add photo' });
    }
    return res.status(200).json({ message: 'Photo added successfully' });
  });
});

//Route to delete a photo from a destination
app.delete('/delete-photo', (req, res) => {
  const { destinationID, photoURL } = req.body;

  if (!destinationID || !photoURL) {
    return res.status(400).json({ error: 'Both destinationID and photoURL are required' });
  }

  const query = 'DELETE FROM destinationphotos WHERE destinationID = ? AND photoURL = ?';
  db.query(query, [destinationID, photoURL], (err, result) => {
    if (err) {
      console.error('Error deleting photo:', err);
      return res.status(500).json({ error: 'Failed to delete photo' });
    }
    return res.status(200).json({ message: 'Photo deleted successfully' });
  });
});



app.listen(8800, () => {
  console.log("Connected to backend.");
});
