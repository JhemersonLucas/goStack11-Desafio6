import { Router } from 'express';

import multer from 'multer';
import { getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';

import CreateTransactionService from '../services/CreateTransactionService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  // const transactions = await transactionsRepository.find({
  //   select: ['title', 'type', 'value'],
  //   relations: ['category'],
  // });
  const transactions = await transactionsRepository
    .createQueryBuilder('transactions')
    .leftJoin('transactions.category', 'category')
    .select([
      'transactions.id',
      'transactions.title',
      'transactions.type',
      'transactions.value',
      'category.title',
      'category.id',
    ])
    .getMany();
  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransaction = new CreateTransactionService();
  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });
  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransaction = new DeleteTransactionService();
  await deleteTransaction.execute(id);
  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { filename } = request.file;
    const importTransaction = new ImportTransactionsService();
    const transactions = await importTransaction.execute(filename);
    return response.json(transactions);
  },
);

export default transactionsRouter;
