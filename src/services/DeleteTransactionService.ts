import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

class DeleteTransactionService {
  public async execute(id: string): Promise<null> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const transaction = transactionsRepository.findOne(id);
    if (!transaction) {
      throw new AppError('A transação informada não foi encontrada!');
    }
    await transactionsRepository.delete({ id });
    return null;
  }
}

export default DeleteTransactionService;
