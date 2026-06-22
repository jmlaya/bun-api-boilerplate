import { UsersService } from '@sivro/core';

export class AppUsersService extends UsersService {
  public testMethod() {
    return 'This is a test method in AppUsersService';
  }
}
