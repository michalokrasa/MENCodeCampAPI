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

// Get logs
router.get('/log', (req, res) => {
    let { userId, from, to, limit } = req.query;

    if (!userId) {
        res.send('unknown userId');
        return
    }

    from = new Date(from);
    to = new Date(to);

    if (limit && limit < 1) {
        limit = undefined;
    }
    


    User.findById(userId).lean()
    .then(user => {
        Exercise.find({ userId }).lean()
        .then( exercises => {
            user.count = exercises.length;
            user.log = exercises
            .filter(e => {
                if (!isNaN(from) && e.date < from) {
                    return false;
                }
                if (!isNaN(to) && e.date >= to) {
                    return false;
                }
                return true;
            })
            .map(e => { 
                const dateString = e.date.toDateString();
                return {
                    description: e.description, 
                    duration: e.duration,
                    date: dateString
                }
            })
            
            if (limit) {
                user.log = user.log.slice(0, limit);
            }

            delete user.__v;
            res.json(user);
        })
        .catch(err => {
            console.log(err);
            res.send(err.message);
        });
    })
    .catch(err => {
        console.log(err);
        res.send('unknown userId');
    });
});

module.exports = router;