const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Example database (you would use a real database in production)
const users = [];
const activationTokens = new Map();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));

// Registration endpoint
app.post('/register', (req, res) => {
    const { name, email } = req.body;

    // Generate a unique activation token
    const token = crypto.randomBytes(20).toString('hex');
    activationTokens.set(token, email);

    // Store user data (you would use a database in production)
    users.push({ name, email, activated: false, token });

    // Send activation email
    sendActivationEmail(email, token);

    res.send('Registration successful. Check your email for activation instructions.');
});

// Activation endpoint
app.get('/activate', (req, res) => {
    const token = req.query.token;

    if (activationTokens.has(token)) {
        const email = activationTokens.get(token);
        // Update user data to mark the account as activated
        const user = users.find(u => u.email === email);
        if (user) {
            user.activated = true;
            activationTokens.delete(token);
            res.send('Account activated successfully. You can now log in.');
        } else {
            res.status(404).send('User not found.');
        }
    } else {
        res.status(401).send('Invalid or expired activation link.');
    }
});

// Function to send activation email
function sendActivationEmail(email, token) {
    const activationLink = `http://localhost:${PORT}/activate?token=${token}`;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'your-email@gmail.com',
            pass: 'your-email-password',
        },
    });

    const mailOptions = {
        from: 'your-email@gmail.com',
        to: email,
        subject: 'Account Activation',
        text: `Click the following link to activate your account: ${activationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
