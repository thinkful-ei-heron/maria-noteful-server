const path = require('path')
const express = require('express')
const FoldersService = require('./folders-service')

const FoldersRouter = express.Router()
const jsonParser = express.json()

const serializefolder = folder => ({
    id: note.id,
    name: folder.name
})

FoldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db')
    FoldersService.getAllFolders(knexInstance)
      .then(Folders => {
        res.json(Folders.map(serializefolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body;
    const newfolder = { name }

    if(!name) {
      return res.status(400).json({
        error: { 
          message: `Missing Folder name`
        }
      });
    }


    FoldersService.insertfolder(
      req.app.get('db'),
      newfolder
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializefolder(folder))
      })
      .catch(next)
  })

FoldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getById(
      req.app.get('db'),
      req.params.folderid
    )
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: { message: `folder doesn't exist` }
          })
        }
        res.folder = folder
        next()
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.json(serializefolder(res.folder))
  })
  .delete((req, res, next) => {
    FoldersService.deletefolder(
      req.app.get('db'),
      req.params.folderid
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })
  .patch(jsonParser, (req, res, next) => {
    const { name } = req.body
    const folderToUpdate = { name }

    if(!name) {
      return res.status(400).json({
        error: { 
          message: `Request must contain name`
        }
      });
    }

    FoldersService.updatefolder(
      req.app.get('db'),
      req.params.folder_id,
      folderToUpdate
    )
      .then(numRowsAffected => {
        res.status(204).end()
      })
      .catch(next)
  })

module.exports = FoldersRouter