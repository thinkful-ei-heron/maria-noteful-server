function makeNotesArray() {
    return [
      {
        id: 1,
        name: 'Sam Gamgee',
        modified: '2029-01-22T16:28:32.615Z',
        folderid:1,       
        content: 'Sam'
      },
      { 
        id: 2,
        name: 'Peregrin Took',
        modified: '2100-05-22T16:28:32.615Z',
        folderid:2,
        content: 'Pippin'
      },
    ];
  }
  
  
  module.exports = {
    makeNotesArray,
  }
 