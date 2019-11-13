const FoldersService = {
    getAllFolders(knex) {
      return knex.select('*').from('folders')
    },
  
    insertfolder(knex, newFolder) {
      return knex
        .insert(newFolder)
        .into('folders')
        .returning('*')
        .then(rows => {
          return rows[0]
        })
    },
  
    getById(knex, id) {
      return knex
        .from('folders')
        .select('*')
        .where('id', id)
        .first()
    },
  
    deletefolder(knex, id) {
      return knex('folders')
        .where({ id })
        .delete()
    },
  
    updatefolder(knex, id, newFolderFields) {
      return knex('folders')
        .where({ id })
        .update(newFolderFields)
    },
  }
  
  module.exports = FoldersService