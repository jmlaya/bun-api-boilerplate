import { SQL } from 'bun';

export default async function (sql: SQL) {
  const mainUser = process.env.MAIN_USER && JSON.parse(process.env.MAIN_USER);
  const hashedPassword = await Bun.password.hash(mainUser.password);

  await sql`
      INSERT INTO users (name, role, email, password)
      VALUES (${mainUser.name}, 'admin', ${mainUser.email}, ${hashedPassword})
      RETURNING id, email, created_at
    `;
}
