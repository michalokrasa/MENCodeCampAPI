const express = require('express');
const mognoose = require('mongoose');
const Exercise = require('../models/Exercise');
const User = require('../models/User');

const router = express.Router();

const USERNAME_TAKEN = 11000;

// Add new user
router.post('/new-user', async (req, res) => {
    const user = new User({
        username: req.body.username
    });

    user.save()
        .then(({ username, _id }) => {
            res.json({ username, _id });
        })
        .catch(err => {
            if (err.code === USERNAME_TAKEN) {
                res.send('username already taken');
            }
            else {
                res.json({ message: err });
            }
        });
});

// Add new exercise
router.post('/add', async (req, res, next) => {
    const { userId, description, duration, date } = req.body;
    let fetchedName;

    try {
        const { username } = await User.findById(userId);
        fetchedName = username;
    } catch (err) {
        res.send('unknown _id');
        return
    }

    const exercise = new Exercise({
        userId,
        description,
        duration,
        date
    });

    
    const valErr = exercise.validateSync();
    if (valErr !== undefined) {
        const errors = valErr.errors;
        let errorMsg = '';

        for (const key in errors) {
            errorMsg += errors[key] + '\n';
        }
        
        res.send(errorMsg);
        return
    }

    exercise.save()
        .then(result => {
            res.json({ 
                username: fetchedName, 
                description, duration, 
                _id: userId, 
                date: result.date.toDateString() 
            });
            console.log(result);
        })
        .catch(err => {
            console.log(err);
            res.send(err);
        });
});

// Get all the users
router.get('/users', (req, res) => {
    User.find()
        .then(users => {
            res.json(users);
        }) 
        .catch(err => {
            res.json(err);
        });
});

module.exports = router;