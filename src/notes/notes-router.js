const path = require('path')
const express = require('express')
const notesService = require('./notes-service')

const notesRouter = express.Router()
const jsonParser = express.json()

const serializenote = note => ({
  id: note.id,
  name: note.name,
  modified: note.modified,
  folderid: note.folderid,
  content: note.content
})

notesRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    notesService.getAllNotes(knexInstance)
      .then(notes => {
        res.json(notes.map(serializenote))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name, modified, folderid, content } = req.body
    const newnote = { name, modified, folderid, content }
    for (const [key, value] of Object.entries(newnote)) {
      if (value === null && key !== 'modified'){
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        })
      }
    }



    notesService.insertnote(
      req.app.get('db'),
      newnote
    )
      .then(note => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${note.id}`))
          .json(serializenote(note))
      })
      .catch(next)
  });

notesRouter
  .route('/:note_id')
  .all((req, res, next) => {
    notesService.getById(
      req.app.get('db'),
      req.params.note_id
    )
      .then(note => {
        if (!note) {
          return res.status(404).json({
            error: { message: `note doesn't exist` }
          })
        }
        res.note = note
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializenote(res.note))
  })
  .delete((req, res, next) => {
    notesService.deletenote(
      req.app.get('db'),
      req.params.note_id
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const {  name, modified, folderid, content} = req.body
    const noteToUpdate = {  name, modified, folderid, content}

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length
    if (numberOfValues === 0)
      return res.status(400).json({
        error: {
          message: `Request body must contain name, modified, folder_id, and content`
        }
      })

    updatenote.modified = new Date();

    notesService.updatenote(
      req.app.get('db'),
      req.params.note_id,
      noteToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = notesRouter