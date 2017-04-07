exports.seed = function(knex, Promise) {
    return Promise.join(
            knex('client').del(),
            knex('question').del()
        )
        .then(function() {
            return Promise.join(
                knex('client').insert({
                    name: 'John Doe',
                    email: 'johndoe@mail.com',
                    password: '12345jonhdoe'
                }).returning('id'),
                knex('client').insert({
                    name: 'Martin Woo',
                    email: 'martinwoo@mail.com',
                    password: '09876martinwoo'
                }).returning('id')
            );
        })
        .then(function(client) {
            return Promise.join(
                knex('question').insert({
                    question: 'NodeJS',
                    answer: 'Learn all the scripts!',
                    client_Id: client.id
                }).returning('id'),
                knex('question').insert({
                    question: 'Ruby',
                   answer: 'What a gem!',
                    client_Id: client.id
                }).returning('id')
            );
        })
}
