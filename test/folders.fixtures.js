function makeFoldersArray() {
    return [
      {
        id: 1,  
        name: 'Sam Gamgee',
      },
      { 
        id: 2,
        name: 'Peregrin Took',
      }
    ]
  }
  
  // function makeMaliciousFolders() {
  //   const maliciousFolders = {
  //     id: 911,
  //     name: 'Naughty naughty very naughty <script>alert("xss");</script>',
 
  //   }
  //   const expectedFodlers = {
  //     ...maliciousFolders,
  //     name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    
  //   }
  //   return {
  //     maliciousFolders,
  //     expectedFolders,
  //   }
  // }
  
  module.exports = {
    makeFoldersArray,
    // makeMaliciousFolders,
  }

