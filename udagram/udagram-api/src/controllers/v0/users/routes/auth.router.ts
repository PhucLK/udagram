import { Router, Request, Response, NextFunction } from 'express';

import { User } from '../models/User';
import * as c from '../../../../config/config';

// import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

import * as EmailValidator from 'email-validator';
import { config } from 'bluebird';

const router: Router = Router();
var bcrypt = require('bcryptjs');

async function generatePassword(plainTextPassword: string): Promise<string> {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  return await bcrypt.hash(plainTextPassword, salt);
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(plainTextPassword, hash);
}

function generateJWT(user: User): string {
  console.log('sdfsdfsfsdfdsfsfdsf');
  console.log(user.short());
  
  return jwt.sign(user.short(), `${process.env.JWT_SECRET}`);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  console.log(req.headers);
  if (!req.headers || !req.headers.authorization) {
    return res.status(401).send({ message: 'No authorization headers.' });
  }

  const tokenBearer = req.headers.authorization.split(' ');
  if (tokenBearer.length != 2) {
    return res.status(401).send({ message: 'Malformed token.' });
  }

  const token = tokenBearer[tokenBearer.length - 1];
  return jwt.verify(token, `${process.env.JWT_SECRET}`, (err, decoded) => {
    if (err) {
      return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
    }
    return next();
  });
}

router.get('/verification',
  requireAuth,
  async (req: Request, res: Response) => {
    return res.status(200).send({ auth: true, message: 'Authenticated.' });
  });

router.post('/login', async (req: Request, res: Response) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !EmailValidator.validate(email)) {
    return res.status(400).send({ auth: false, message: 'Email is required or malformed.' });
  }

  if (!password) {
    return res.status(400).send({ auth: false, message: 'Password is required.' });
  }

  const user = await User.findByPk(email);
  if (!user) {
    return res.status(401).send({ auth: false, message: 'User was not found..' });
  }

  const authValid = await comparePasswords(password, user.passwordHash);

  if (!authValid) {
    return res.status(401).send({ auth: false, message: 'Password was invalid.' });
  }
  console.log('before------------------->');
  
  const jwt = generateJWT(user);
  res.status(200).send({ auth: true, token: jwt, user: user.short() });
});


router.post('/', async (req: Request, res: Response) => {
  // console.log('zooooo0000000000');
  
  const email = req.body.email;
  const plainTextPassword = req.body.password;

  if (!email || !EmailValidator.validate(email)) {
    return res.status(400).send({ auth: false, message: 'Email is missing or malformed.' });
  }

  if (!plainTextPassword) {
    return res.status(400).send({ auth: false, message: 'Password is required.' });
  }

  const user = await User.findByPk(email);
  if (user) {
    return res.status(422).send({ auth: false, message: 'User already exists.' });
  }

  // console.log('save user 1');
  const generatedHash = await generatePassword(plainTextPassword);

  const newUser = await new User({
    email: email,
    passwordHash: generatedHash,
  });
  // console.log('save user 1');

  const savedUser = await newUser.save();

  console.log('save user');
  
  const jwt = generateJWT(savedUser);
  res.status(201).send({ token: jwt, user: savedUser.short() });
});

router.get('/', async (req: Request, res: Response) => {
  res.send('auth');
});

 export  const  AuthRouter: Router = router;
