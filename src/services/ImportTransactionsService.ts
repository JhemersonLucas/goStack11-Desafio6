import fs from 'fs';
import path from 'path';
import csvParse from 'csv-parse';
import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const parsers = csvParse({ delimiter: ', ', from_line: 2 });

    const csvFilePath = path.join(uploadConfig.directory, filename);
    const csvReadStream = fs.createReadStream(csvFilePath);

    const parse = csvReadStream.pipe(parsers);

    const transactions: Request[] = [];

    parse.on('data', async line => {
      const [title, type, value, category] = line;
      transactions.push({ title, type, value, category });
    });

    await new Promise(resolve => parse.on('end', resolve));

    const createTransaction = new CreateTransactionService();
    const transactionsDB: Transaction[] = [];

    for (const item of transactions) {
      const { title, type, value, category } = item;
      const transaction = await createTransaction.execute({
        title,
        type,
        value,
        category,
      });
      transactionsDB.push(transaction);
    }
    return transactionsDB;
  }
}

export default ImportTransactionsService;
