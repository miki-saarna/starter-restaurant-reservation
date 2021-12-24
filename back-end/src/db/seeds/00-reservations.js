const reservations = require("./00-reservations.json");

// console.log(JSON.stringify(reservations, null, 4));

exports.seed = function (knex) {
  return knex.raw("TRUNCATE TABLE reservations RESTART IDENTITY CASCADE")
    .then(function () {
      return knex("reservations").insert(reservations);
    })
};
