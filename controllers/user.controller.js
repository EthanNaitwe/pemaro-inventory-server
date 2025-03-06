const { Sequelize } = require("sequelize");
const { User } = require("../config/db");
const { sequelizeErrorHandler } = require("../config/helpers");
const jwt = require("jsonwebtoken");

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const { username, email, phone_number, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    { email },
                    { phone_number }
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === email) {
                throw new Error('A User with the given email already exists');
            } else if (existingUser.phone_number === phone_number) {
                throw new Error('A User with the given phone number already exists');
            }
        }

        const user = await User.create(req.body);
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        console.log('error.message', error.message)
        const { message, status } = sequelizeErrorHandler(error);
        res.status(status).json({ message });
        // res.status(500).json({ message: 'Error creating user', error: error.message });
    }
};

// Get Login a User
exports.loginUser = async (req, res) => {
    try {
        const { email, phone_number, password } = req.body;

        // Check if User exists
        const authUser = await User.findOne({
            where: {
                [Sequelize.Op.or]: [
                    email ? { email } : {},
                    phone_number ? { phone_number } : {}
                ]
            }
        });

        if (!authUser) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const isPasswordValid = await authUser.validatePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: authUser.id }, process.env.JWT_SECRET, {
            expiresIn: '1h',
        });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        const { message, status } = sequelizeErrorHandler(error);
        res.status(status).json({ message });
    }
}

// Get All Users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get a single user by userId
exports.getSingleUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.body.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a user
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.update(req.body);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a user
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        await user.destroy();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Loggedin User's Profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }, // Exclude sensitive fields
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};
