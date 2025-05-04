import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModifyContestService {

  constructor() {}

  async getImages(email: string): Promise<any> {
    try {
      const response = await fetch('api/images/getImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching images:', error);
      throw error;
    }
  }

  async loadContests(email: string): Promise<any> {
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

  async loadFlagsForContest(contestId: number): Promise<any> {
    if(contestId === 0)
      return [];
    try {
      const response = await fetch('api/flags/getAllFlagsFromContest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contest: contestId })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch flags');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching flags:', error);
      throw error;
    }
  }

  async addContest(data: any): Promise<any> {
    try {
      const response = await fetch('api/constests/AddContest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to add contest');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding contest:', error);
      throw error;
    }
  }

  async deleteContest(contestId: number): Promise<any> {
    // Send a POST request to delete the contest by its name
    let data = {contest: contestId};
    await this.deleteFlagsFromContest(contestId);
    let res = await fetch('api/contests/DeleteContest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (res.ok) {
        console.log("Success: deleting contest");
    } else {
        console.log("ERROR: deleting contest");
        alert("Failed to delete contest.");
    }
  }

  async deleteFlagsFromContest(contestId: number): Promise<any> {
    try {
      const response = await fetch('api/flags/DeleteFlagsFromContest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contest: contestId })
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

  async AddFlag(data: any): Promise<any> {
    try {
      const response = await fetch('api/flags/AddFlag', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to add flag');
      }
      return await response.json();
    } catch (error) {
      console.error('Error adding flag:', error);
      throw error;
    }
  }

  async DeleteFlag(flagId: number): Promise<any> {
    let data = { flag: flagId };
    let res = await fetch('api/flags/DeleteFlag', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

  async setNewActiveFlag(flagImage: string, Email: string):Promise<any> {
    const image = flagImage;
    // set up the container for the image
    const data = { FlagImage: image, email: Email };
    const res = await fetch('/api/flags/setNewActiveFlag', {
        method: 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(data)
    });
}

  async setContestActive(contestId: number, email: string): Promise<any> {
    const oldcontestID = await this.getActiveContest(email);
    if(oldcontestID !== 0 && oldcontestID === contestId){
      try{
        const response = await fetch('api/contests/EndContest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({contest: oldcontestID, email})
        });
        if(!response.ok)
          throw new Error('Failed to end contest');
        await response.json();
        return 0;
    }catch(error){
      console.error('Error ending contest');
      throw error;
    }
    }
    else{
      try {
        const response = await fetch('api/contests/setContestActive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ contest: contestId, email })
        });

        if (!response.ok) {
          throw new Error('Failed to set contest active');
        }
        await response.json();
        return 1;
      } catch (error) {
        console.error('Error setting contest active:', error);
        throw error;
      }
    }
  }

  async deleteImage(imageName: string | undefined): Promise<any> {
    try {
      const response = await fetch('api/images/DeleteImageReplaceFlags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ images: imageName })
      });

      if (!response.ok) {
        throw new Error('Failed to delete image');
      }
      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }

  async getActiveContest(Email: string): Promise<any>{
    const data = { email: Email };
    const res = await fetch('api/contests/getActiveContest', {
      method: 'POST',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify(data)
    });
    if (res.ok) {
      let contest = await res.json();
      return contest.ContestID;
    }
    else
      return 0;
  }
}