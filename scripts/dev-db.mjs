/**
 * Starts a throwaway local MongoDB (a one-node replica set, so transactions
 * work) for developing or testing accounts and sync without MongoDB Atlas.
 *
 *   npm run db:dev
 *
 * Then set MONGODB_URI to the printed URI. Data is lost when it stops.
 */
import { MongoMemoryReplSet } from "mongodb-memory-server";

const port = Number(process.env.DEV_DB_PORT ?? 27027);
const replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 }, instanceOpts: [{ port }] });
console.log(`MONGODB_URI=${replSet.getUri()}`);

const stop = async () => {
  await replSet.stop();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
