import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class AdminProfileService {

  constructor() { }

  async getAllUsers(email: string): Promise<any> {
    try {
      const response = await fetch('api/users/getAllUsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async deleteUser(email: string): Promise<any> {
    await this.deleteSubsFromStudent(email);
    try {
      const response = await fetch('api/users/DeleteStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async deleteSubsFromStudent(email: String): Promise<any> {
    try {
      const response = await fetch('api/submissions//DeleteSubsFromStudent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });

      if (!response.ok) {
        throw new Error('Failed to delete flags');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting flags:', error);
      throw error;
    }
  }

  async getContests(email: string): Promise<any> {
    try {
      const response = await fetch('api/contests/getContests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contests');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching contests:', error);
      throw error;
    }
  }

  async getContestFlagsSubs(email: string, contest: string | null): Promise<any> {
    try {
      const response = await fetch('api/getContestFlagsSubs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, contest })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contest flags');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching contest flags:', error);
      throw error;
    }
  }
}