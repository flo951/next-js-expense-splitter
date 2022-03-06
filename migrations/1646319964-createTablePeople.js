exports.up = async (sql) => {
  await sql`
	 CREATE TABLE people (
	 	id integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	 	name varchar(30) NOT NULL,
		user_id integer REFERENCES users (id) ON DELETE CASCADE

		 );
`;
};

exports.down = async (sql) => {
  await sql`
	DROP TABLE people
	`;
};