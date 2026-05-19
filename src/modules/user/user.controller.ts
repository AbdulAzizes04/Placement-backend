import { Request, Response } from 'express';
import { UserService } from './user.service';
import { updateUserSchema } from './user.validation';

const userService = new UserService();

export class UserController {
  async getProfile(req: Request, res: Response) {
    try {
      const user = await userService.getUserById((req as any).user.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const data = updateUserSchema.parse(req.body);
      const user = await userService.updateUser((req as any).user.id, data);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}