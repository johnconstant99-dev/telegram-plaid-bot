const db = require('../database/connection');
const encryptionService = require('../services/encryptionService');

class PlaidConnection {
  static async create(connectionData) {
    const { user_id, access_token, item_id, institution_name, institution_id } = connectionData;
    
    const encryptedToken = encryptionService.encrypt(access_token);
    
    const result = await db.query(
      `INSERT INTO plaid_connections (user_id, access_token, item_id, institution_name, institution_id)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (item_id) DO UPDATE
       SET access_token = $2, institution_name = $4, institution_id = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [user_id, encryptedToken, item_id, institution_name, institution_id]
    );
    
    return result.rows[0];
  }

  static async findByUserId(userId) {
    const result = await db.query(
      'SELECT * FROM plaid_connections WHERE user_id = $1',
      [userId]
    );
    return result.rows;
  }

  static async findByItemId(itemId) {
    const result = await db.query(
      'SELECT * FROM plaid_connections WHERE item_id = $1',
      [itemId]
    );
    return result.rows[0];
  }

  static async getDecryptedAccessToken(itemId) {
    const connection = await this.findByItemId(itemId);
    if (!connection) return null;
    return encryptionService.decrypt(connection.access_token);
  }

  static async getAllByUserId(userId) {
    const connections = await this.findByUserId(userId);
    return connections.map(conn => ({
      ...conn,
      access_token: encryptionService.decrypt(conn.access_token),
    }));
  }

  static async delete(itemId) {
    await db.query(
      'DELETE FROM plaid_connections WHERE item_id = $1',
      [itemId]
    );
  }
}

module.exports = PlaidConnection;
