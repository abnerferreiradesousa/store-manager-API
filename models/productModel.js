const connection = require('./connection');

const getAll = async () => {
  const [products] = await connection.execute('SELECT * FROM products');
  return products;
}; 

const getById = async (id) => {
  const [product] = await connection
    .execute('SELECT * FROM products WHERE id = ?', [id]);    
  return product;
};

const getByName = async (name) => {
  const [product] = await connection
    .execute('SELECT * FROM products WHERE name = ?', [name]);    
  return product;
};

const create = async (name, quantity) => {
  const [result] = await connection
    .execute(
      'INSERT INTO products (name, quantity) VALUES (?, ?);',
      [name, quantity],
  );
  return { id: result.insertId, name, quantity };
};

const update = async (id, name, quantity) => {
  await connection
    .execute(
      `UPDATE products 
      SET name = ?, quantity = ?
      WHERE id = ?;`,
      [name, quantity, id],
  );
  return { id: Number(id), name, quantity };
};

const calcQuantiy = async (dataSalesRemoved, operation) => {
  dataSalesRemoved.forEach(async ({ quantity, productId }) => {
    await connection
      .execute(
        `UPDATE products 
        SET quantity = quantity ${operation} ?
        WHERE id = ?;`,
        [quantity, productId],
    );
  });
};

const remove = async (id) => {
  await connection
    .execute('DELETE FROM products WHERE id = ?', [id]);
};

const verifyStorageProducts = async (newSales) => {
  const query = `SELECT 
  IF(pd.quantity < ?,
        'Não temos em estoque',
        'Tá esperando o que! Vende!') AS 'for_sale'
  FROM products AS pd
  WHERE pd.id = ?;`;
    const salesFound = newSales
      .map(({ productId, quantity }) => connection.execute(query, [quantity, productId]));
    const [[response]] = await Promise.all(salesFound);
    return response;
};

module.exports = {
  getAll,
  getById,
  create,
  getByName,
  update,
  remove,
  calcQuantiy,
  verifyStorageProducts,
};