exports.up = function(knex, Promise) {
    return knex.schema.createTable('client', function(table) {
        table.increments();
        table.string('name').notNullable();
        table.string('email').notNullable();
        table.string('password').notNullable();
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('client');
};
