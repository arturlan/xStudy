exports.up = function(knex, Promise) {
    return knex.schema.createTable('question', function(table) {
        table.increments();
        table.text('question');
        table.text('answer');
        table.integer('client_Id').references('client.id').onDelete('CASCADE');
    })
};

exports.down = function(knex, Promise) {
    return knex.schema.dropTable('question')
};
