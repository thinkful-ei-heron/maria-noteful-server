process.env.TZ = 'UTC'
require('dotenv').config()
const { expect } = require('chai')
const supertest = require('supertest') //these 2 tests will run before any other test 

global.expect = expect
global.supertest = supertest
// seting up on global , hence dont need to  pull in super test in the test file.