const knex = require('knex');
const app = require('../src/app');
const { makeFoldersArray } = require('./folders.fixtures');

describe('folders Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  });

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));

  afterEach('cleanup',() => db.raw('TRUNCATE folders, notes RESTART IDENTITY CASCADE'));
  
  //GET: 
  describe(`GET /api/folders`, () => {
    //passing 
    context(`Given no folders`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
  });

    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
      })

      it('responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    });


  });
//GET By ID
  describe(`GET /api/folders/:folderid`, () => {
    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderid = 123456
        return supertest(app)
          .get(`/api/folders/${folderid}`)
          .expect(404, { error: { message: `Folder doesn't exist` } })
  
      })
    });

    context('Given there are folders in the database', () => {
      const testfolders = makeFoldersArray()

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testfolders)
      })

      it('responds with 200 and the specified folders', () => {
        const folderid = 2
        const expectedFolders = testfolders[folderid - 1]
        return supertest(app)
          .get(`/api/folders/${folderid}`)
          .expect(200, expectedFolders)
      });
    });



//POST
//passing 
  describe(`POST /api/folders`, () => {
    it(`creates folder, responding with 201 and the new folder`, () => {
      const newFolder = {
        name: 'Test new folder name',
        date_created: 'Test folders date created'
      }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newFolder.name)
          expect(res.body).to.have.property('id')
        })
        .then(res =>
          supertest(app)
            .get(`/api/folders/${res.body.id}`)
            .expect(res.body)
        )
    });

    const requiredFields = ['name'];

    requiredFields.forEach(field => {
      const newFolder = {
        name: 'Test new folder name',
        date_created: 'Test folders date created'
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newFolder[field]

        return supertest(app)
          .post('/api/folders')
          .send(newFolder)
          .expect(400, {
            error: { message: `Missing Folder ${field}` }
          })
      })
    });

  });

  describe(`DELETE /api/folders/:folderid`, () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testFolders)
        })

      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2;
        const testFolders = makeFoldersArray();
        const expectedFolders = testFolders.filter(folder => folder.id !== idToRemove);
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/folders`)
              .expect(expectedFolders)
          )
      });
    })

    context(`Given no folders`, () => {
      it(`responds with 404`, () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { 
            error: { 
              message: `Folder doesn't exist` 
            }
          })
      })
    });
  
})
}) 
