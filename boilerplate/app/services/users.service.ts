import { UsersService } from '@talon/core';

export class AppUsersService extends UsersService {
  public testMethod() {
    return 'This is a test method in AppUsersService';
  }
}
