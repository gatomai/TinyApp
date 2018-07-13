const bcrypt = require('bcryptjs');
const password = "123"; // you will probably this from req.params
const hashedPassword = bcrypt.hashSync(password, 10);

// console.log(bcrypt.compareSync("purple-monkey-dinosaur", hashedPassword)); // returns true
// console.log(bcrypt.compareSync("pink-donkey-minotaur", hashedPassword)); // returns false

console.log(password, hashedPassword);
