const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const path = require('path');
const keys = require('./config/keys').mailChimpID;

const app = express();

// Body parser Middleware
app.use(bodyParser.urlencoded({ extended: false }));

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Signup Route
app.post('/signup', (req, res) => {
  const { firstName, lastName, email } = req.body;

  // Make sure fields are filled
  if (!firstName || !lastName || !email) {
    res.redirect('/fail.html');
    return;
  }

  // Construct mailchimp api req data
  const data = {
    members: [
      {
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: firstName,
          LAME: lastName
        }
      }
    ]
  };

  // Convert JSON data into string (according to API docs)
  const postData = JSON.stringify(data);

  // Send options to connect with mailchimp API
  const options = {
    url: 'https://us7.api.mailchimp.com/3.0/lists/0733515cc6',
    method: 'POST',
    headers: {
      Authorization: keys
    },
    body: postData
  };

  // Route success or fail responses
  request(options, (err, response, body) => {
    if (err) {
      res.redirect('/fail.html');
    } else {
      if (response.statusCode === 200) {
        res.redirect('success.html');
      } else {
        res.redirect('/fail.html');
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
