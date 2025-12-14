const db = require('../database/connection');

class User {
  static async findByTelegramId(telegramId) {
    const result = await db.query(
      'SELECT * FROM users WHERE telegram_id = $1',
      [telegramId]
    );
    return result.rows[0];
  }

  static async create(userData) {
    const { telegram_id, username, first_name, last_name } = userData;
    const result = await db.query(
      `INSERT INTO users (telegram_id, username, first_name, last_name)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (telegram_id) DO UPDATE
       SET username = $2, first_name = $3, last_name = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [telegram_id, username, first_name, last_name]
    );
    return result.rows[0];
  }

  static async update(telegramId, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.entries(updateData).forEach(([key, value]) => {
      fields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    });

    values.push(telegramId);

    const result = await db.query(
      `UPDATE users 
       SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE telegram_id = $${paramCount}
       RETURNING *`,
      values
    );
    return result.rows[0];
  }

  static async findById(id) {
    const result = await db.query(
      'SELECT * FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = User;
