const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Get all students with search and filter
router.get('/', async (req, res) => {
    try {
        let filter = {};
        
        // Search by name or department
        if (req.query.search) {
            filter = {
                $or: [
                    { name: { $regex: req.query.search, $options: 'i' } },
                    { department: { $regex: req.query.search, $options: 'i' } }
                ]
            };
        }
        
        let students = await Student.find(filter);
        
        // Sort students
        if (req.query.sort === 'gpa') {
            students = students.sort((a, b) => b.gpa - a.gpa);
        } else if (req.query.sort === 'name') {
            students = students.sort((a, b) => a.name.localeCompare(b.name));
        }
        
        res.render('students', { 
            students: students,
            searchQuery: req.query.search || '',
            sortBy: req.query.sort || ''
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Show form to add new student
router.get('/add', (req, res) => {
    res.render('addStudent');
});

// Handle form submission to create new student
router.post('/add', async (req, res) => {
    try {
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.redirect('/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error creating student');
    }
});

// Show edit form
router.get('/edit/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        res.render('editStudent', { student: student });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error finding student');
    }
});

// Handle edit form submission
router.post('/edit/:id', async (req, res) => {
    try {
        await Student.findByIdAndUpdate(req.params.id, req.body);
        res.redirect('/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating student');
    }
});

// Delete student
router.get('/delete/:id', async (req, res) => {
    try {
        await Student.findByIdAndDelete(req.params.id);
        res.redirect('/students');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error deleting student');
    }
});

module.exports = router;