import { Request, Response } from 'express'
import { User } from '../entity/User';
import { redis } from '../redis'

export const confirmEmail = async (req: Request, res: Response) => {
  const { id } = req.params
  const userId: any = await redis.get(id);
  if (userId) {
    await User.update(userId, { confirmed: true })
    await redis.del(id)
    res.status(200).send('ok')
  } else {
    res.status(200).send('invalid')
  }
}
