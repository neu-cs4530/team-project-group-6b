import { Collection, MongoClient, Document as Doc } from 'mongodb';

const client = new MongoClient(
  'mongodb+srv://admin:admin@cluster0.ktxlq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
);
let connected = false;

const connect = async (): Promise<Collection<Doc>> => {
  if (!connected) {
    await client.connect();
    connected = true;
  }
  return client.db('CoveyTown').collection('Profile');
};

export default connect;
