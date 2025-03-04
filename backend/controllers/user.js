const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.signup = async (req, res, next) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ message: "Cet email est déjà utilisé." });
        }
        
        const hash = await bcrypt.hash(req.body.password, 10);
        
        const user = new User({
            email: req.body.email,
            password: hash,
        });
        await user.save();
        console.log("[SIGNUP] Utilisateur créé:", user);
        
        return res.status(201).json({ message: 'Utilisateur créé avec succès !' });
    } catch (error) {
        console.error("[SIGNUP] Erreur:", error);
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};

exports.login = async (req, res, next) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.status(401).json({ error: 'Paire Identifiant/Mot de passe incorrecte' });
        }
        
        const valid = await bcrypt.compare(req.body.password, user.password);
        if (!valid) {
            return res.status(401).json({ error: 'Paire Identifiant/Mot de passe incorrecte' });
        }
        const token = jwt.sign(
            { userId: user._id },
            'RANDOM_TOKEN_SECRET',
            { expiresIn: '24h' }
        );
        return res.status(200).json({ userId: user._id, token });
    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur", error });
    }
};
