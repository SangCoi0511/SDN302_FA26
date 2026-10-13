const { MongoClient } = require("mongodb");

// Connection URL
const url = "mongodb://127.0.0.1:27017";
const client = new MongoClient(url);

async function main() {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    console.log("Connected to MongoDB");

    const dbname = "sdn302_db";
    const colname = "mongoDemo";

    // Create
    const productId = await createdoc(client, dbname, colname, {
      productID: 1,
      name: "Laptop",
      price: 25000,
    });

    // Read
    console.log("Created document:", await readdoc(client, dbname, colname, productId));

    // Update
    await updatedoc(client, dbname, colname, productId, { price: 23000 });
    console.log("Updated document:", await readdoc(client, dbname, colname, productId));

    // Delete
    await deletedoc(client, dbname, colname, productId);
  } finally {
    // Close the connection to the MongoDB cluster
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

async function createdoc(client, dbname, colname, doc) {
  const db = client.db(dbname);
  const collection = db.collection(colname);
  const result = await collection.insertOne(doc);
  console.log(`New document created with the following id: ${result.insertedId}`);
  return result.insertedId;
}

async function readdoc(client, dbname, colname, id) {
  const db = client.db(dbname);
  const collection = db.collection(colname);
  return collection.findOne({ _id: id });
}

async function updatedoc(client, dbname, colname, id, fields) {
  const db = client.db(dbname);
  const collection = db.collection(colname);
  const result = await collection.updateOne({ _id: id }, { $set: fields });
  console.log(`Documents updated: ${result.modifiedCount}`);
  return result;
}

async function deletedoc(client, dbname, colname, id) {
  const db = client.db(dbname);
  const collection = db.collection(colname);
  const result = await collection.deleteOne({ _id: id });
  console.log(`Documents deleted: ${result.deletedCount}`);
  return result;
}