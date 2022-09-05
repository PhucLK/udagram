import supertest from 'supertest'
import { User } from '../controllers/v0/users/models/User'
import {AuthRouter} from '../controllers/v0/users/routes/auth.router'

const user:Partial<User> = {
    email: 'phuctv7',
    passwordHash: 'sdfwersffdsf'
}

describe('Test endpoint responses', function () {
    it('create new user', function (done) {
        supertest(AuthRouter)
        .post('/')
        .send(user)
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        .expect(200)
    done()
    })
})
