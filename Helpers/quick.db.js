var quick = require('quick.db')
var { Crypt, Compare } = require('password-crypt')
var { generate } = require('randomstring')

class Quick {
  async createUser (username, password) {
    var id = generate({ charset: 'numeric', length: 16 })
    var tag = generate({ charset: 'numeric', length: 4 })
    var user = {
      username,
      tag,
      password: await Crypt(process.env.SECRET, password),
      id
    }
    quick.set(id, user)
    return user
  }

  async verifyUser (username, password) {
    var users = quick.all().filter(v => JSON.parse(v.data).username === username)
    if (users.length === 0) return new Error('No users found with that username.')
    for (const u of users) {
      u.data = JSON.parse(u.data)
      const isMatch = await Compare(process.env.SECRET, password, u.data.password)
      if (isMatch === true) return u
      else continue
    }
    return new Error('Password was invalid.')
  }

  all () {
    return quick.all()
  }
}

module.exports = Quick
