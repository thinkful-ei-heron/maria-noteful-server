const knex = require('knex')
const app = require('../src/app')
const { makeNotesArray} = require('./notes.fixtures');
const {makeFoldersArray} = require('./folders.fixtures');


describe('notes Endpoints', function() {
  let db

  before('make knex instance', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)

  });

  after('disconnect from db', () => db.destroy())

  before('clean the table', () => db.raw('TRUNCATE  folders, notes RESTART IDENTITY CASCADE'))

  afterEach('cleanup',() => db.raw('TRUNCATE  folders, notes RESTART IDENTITY CASCADE'))

  //GET: PASSING 
  describe(`GET /api/notes`, () => {
    context(`Given no notes`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      });
    });

    context('Given there are notes in the database', () => {
      const testnotes = makeNotesArray();
      const testfolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('folders')
          .insert(testfolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testnotes)
          });
      });

      it('responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testnotes)
      })
    })


  });
//GET BY ID: PASSING
  describe(`GET /api/notes/:note_id`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const notesId = 123456
        return supertest(app)
          .get(`/api/notes/${notesId}`)
          .expect(404, { error: { message: `note doesn't exist` } })
      })
    })

    context('Given there are notes in the database', () => {
      const testnotes = makeNotesArray();
      const testfolders = makeFoldersArray();
      

      beforeEach('insert note', () => {
        return db
          .into('folders')
          .insert(testfolders)
          .then(() => {
            return db
              .into('notes')
              .insert(testnotes) 
          })
      })

      it('responds with 200 and the specified note', () => {
        const notesId = 2
        const expectednotes = testnotes[notesId - 1]
        return supertest(app)
          .get(`/api/notes/${notesId}`)
          .expect(200, expectednotes)
      })
    })
  })
 //POST: 
  describe(`POST /api/notes`, () => {
    const testNotes = makeNotesArray();
    const testFolders = makeFoldersArray();

    beforeEach('insert notes', () => {
      return db 
        .into('folders')
        .insert(testFolders)
    })

    it(`creates an note, responding with 201 and the new notes`, () => {
      const newnotes = {
        name: 'Test new note',
        content: 'Test new notes content...',
        folderid: 1
      }
      return supertest(app)
        .post('/api/notes')
        .send(newnotes)
        .expect(201)
        .expect(res => {
          expect(res.body.name).to.eql(newnotes.name)
          expect(res.body.content).to.eql(newnotes.content)
          expect(res.body.folderid).to.eql(newnotes.folderid)          
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/notes/${res.body.id}`)   
         })
         .then(res =>
          supertest(app)
            .get(`/api/notes/${res.body.id}`)
            .expect(res.body)
         )
    })

    const requiredFields = ['name', 'content', 'folderid' ];

    requiredFields.forEach(field => {
      const newnotes = {
        name: 'Test new note', 
        content: 'test new notes content', 
        folderid: 1,
        
        
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newnotes[field]

        return supertest(app)
          .post('/api/notes')
          .send(newnotes)
          .expect(400, {
            error: { message: `Missing '${field}' in request body` }
          })
      })
    })

  });

  describe(`DELETE /api/notes/:folderid`, () => {
    context(`Given no notes`, () => {
      it(`responds with 404`, () => {
        const notesId = 123456
        return supertest(app)
          .delete(`/api/notes/${notesId}`)
          .expect(404, { error: { message: `note doesn't exist` } })
      })
    });

    context('Given there are notes in the database', () => {
      const testnotes = makeNotesArray();
      const testfolders = makeFoldersArray();
      beforeEach('insert notes', () => {

            return db
              .into('folders')
              .insert(testfolders)
              .then(() => {
                return db
                  .into('notes')
                  .insert(testnotes)
          })
      })

      it('responds with 204 and removes the notes', () => {
        const idToRemove = 2
        const expectednotes = testnotes.filter(notes => notes.id !== idToRemove)
        return supertest(app)
          .delete(`/api/notes/${idToRemove}`)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/notes`)
              .expect(expectednotes)
          )
        });
      })
      
    });
      
  });