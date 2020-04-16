import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  category: string;
  value: number;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    category,
    value,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('O tipo de transação não é válido.');
    }

    const balance = await transactionsRepository.getBalance();
    if (type === 'outcome' && balance.total <= 0) {
      throw new AppError('Não há valor em caixa para ser retirado.');
    } else if (type === 'outcome' && value > balance.total) {
      throw new AppError('O valor em caixa é inferior ao solicitado.');
    }

    // checa se existe a categoria
    let categoryDB = await categoriesRepository.findOne({
      where: { title: category },
    });
    if (!categoryDB) {
      // cria categoria
      categoryDB = categoriesRepository.create({
        title: category,
      });
      await categoriesRepository.save(categoryDB);
    }
    const transaction = transactionsRepository.create({
      title,
      type,
      category_id: categoryDB.id,
      value,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
